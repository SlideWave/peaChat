var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var crypto = require('crypto');
var uuid = require('node-uuid');
var md5 = require('MD5');
var async = require('async');

var OpenChat = require('./openchat');

//load the identity overrider
var identityPlugin = null;
if ('identity' in config.plugins) {
    identityPlugin = require(config.plugins['identity']);
}

var User = function(uuid, username, email, salt, pwHash, profileImage, lastSeen) {
    this.UUID = uuid;
    this.username = username;
    this.email = email;
    this.salt = salt;
    this.pwHash = pwHash;
    this.profileImage = profileImage;
    this.lastSeen = lastSeen;
}

User.prototype.absorbIdentity = function(other) {
    if (typeof other.UUID !== "undefined") {
        this.UUID = other.UUID;
    }
    if (typeof other.username !== "undefined") {
        this.username = other.username;
    }
    if (typeof other.email !== "undefined") {
        this.email = other.email;
    }
}

User.SELECT_LIST = 'SELECT user_id, username, email, salt, pw_hash, profile_image, last_seen ';

User.mapUserQuery = function(sql, params, assoc, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        connection.query(sql, params,
            function(err, results) {
                if (err) {
                    connection.end();
                    callback(err, null);
                    return;
                }

                var ret = null;
                if (assoc) {
                    ret = {};
                    for (var i = 0, len = results.length; i < len; i++) {
                        var result = results[i];

                        ret[result.user_id] =
                          new User(result.user_id, result.username, result.email,
                            result.salt, result.pw_hash, result.profile_image,
                            result.last_seen);
                    }
                } else {
                    ret = [];
                    for (var i = 0, len = results.length; i < len; i++) {
                        var result = results[i];

                        ret.push(
                          new User(result.user_id, result.username, result.email,
                            result.salt, result.pw_hash, result.profile_image,
                            result.last_seen));
                    }
                }

                connection.end();

                callback(null, ret);
            }
        );
    });
}

/**
 * Given a list of user IDs, returns a list of User objects
 * from our local database
 */
User._resolveUsersInternal = function(userIdList, callback) {
    User.mapUserQuery(
        User.SELECT_LIST + 'FROM users WHERE user_id IN (?);',
        [userIdList], true, callback);
}

/**
 * Given a list of user IDs, returns a list of User objects
 */
User.resolveUsers = function(userIdList, callback) {
    if (userIdList.length == 0) {
        callback(null, {});
        return;
    }

    if (identityPlugin) {
        identityPlugin.findUsersById(userIdList, function(err, remoteUsers) {
            User._resolveUsersInternal(userIdList, function(err, localUsers) {
                //now find the difference in what the identity plugin has
                //resolved vs local. these will be local users that need
                //to be created
                var missingLocals = [];
                var remoteUserKeys = Object.keys(remoteUsers);
                for (var i = 0, len=remoteUserKeys.length; i < len; i++) {
                    var key = remoteUserKeys[i];

                    if (!(key in localUsers)) {
                        missingLocals.push(remoteUsers[key]);
                    } else {
                        localUsers[key].absorbIdentity(remoteUsers[key]);
                    }
                }

                if (missingLocals.length == 0) {
                    callback(null, localUsers);
                    return;
                }

                var newUsers = {};
                //create the users
                async.eachSeries(missingLocals, function iterator(u, eachCallback) {
                    var pw = User._fillRemoteMissingFieldsAndGeneratePassword(u);

                    User.createUser(u.UUID, u.username, u.email, pw, function(err, user) {
                        if (err) {
                            eachCallback(err);
                            return;
                        }

                        newUsers[u.UUID] = user;
                        eachCallback();

                    });
                }, function done(err) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    //combine the new local users with the remote data
                    //and add them to the list for return
                    var newUsersKeys = Object.keys(newUsers);
                    for (var i = 0, len=newUsersKeys.length; i < len; i++) {
                        var key = newUsersKeys[i];

                        newUsers[key].absorbIdentity(remoteUsers[key]);
                        localUsers[key] = newUsers[key];
                    }

                    callback(null, localUsers);
                });
            });
        });

    } else {
        User._resolveUsersInternal(userIdList, callback);
    }

}

User._fillRemoteMissingFieldsAndGeneratePassword = function(user) {
    if (typeof user.email === "undefined") {
        user.email = user.UUID;
    }

    //generate a random password. this will never be used anyways
    //and is only to secure things in the event that someone
    //turns off the identity plugin
    return randomAsciiString(32);
}

/**
 * If the user given does not exist locally, we create it given they
 * information returned from the identity plugin
 */
User._resolveLocalUserOrCreate = function(user, callback) {
    // we got something back from the plugin
    // now lets fill out the rest of the data from our sources
    User._resolveUserInternal(user.UUID, function (err, localUser) {
       if (err) {
           callback(err);
           return;
       }

       if (localUser) {
           localUser.absorbIdentity(user);
           callback(null, localUser);
           return;
       }

       //if we got here, we didn't find a local user
       //create a user based on what we got back from the identity plugin
       var pw = User._fillRemoteMissingFieldsAndGeneratePassword(user);

       User.createUser(user.UUID, user.username, user.email, pw,
           function (err, newLocalUser) {
               if (err) {
                   callback(err);
                   return;
               }

               callback(null, newLocalUser);
           }
       );
   });
}

/**
 * Finds the user object associated with the given ID (if it exists)
 */
User.resolveUser = function(userId, callback) {
     if (identityPlugin) {
        identityPlugin.findUserById(userId, function(err, user) {
            if (err) {
                callback(err);
                return;
            }

            if (!user) {
                callback(null, null);
                return;
            }

            User._resolveLocalUserOrCreate(user, callback);
        });
    } else {
        User._resolveUserInternal(userId, callback);
    }
}

User._resolveUserInternal = function(userId, callback) {
    User.mapUserQuery(
      User.SELECT_LIST + 'FROM users WHERE user_id = ?;',
      userId, false, function (err, result) {
          if (err) {
              callback(err, null);
              return;
          }

          if (result.length > 0) {
              callback(null, result[0]);
          } else {
              callback(null, null);
          }
    });
}

User.findUserByName = function(userName, callback) {
    if (identityPlugin) {
        identityPlugin.findUserByName(userName, function(err, user) {
            if (err) {
                callback(err);
                return;
            }

            if (!user) {
                callback(null, null);
                return;
            }

            User._resolveLocalUserOrCreate(user, callback);
        });

    } else {
        User.mapUserQuery(
            User.SELECT_LIST + 'FROM users WHERE username = ?;',
            [userName], false,
                function (err, result) {
                    if (err) {
                        callback(err, null);
                        return;
                    }

                    if (result.length > 0) {
                        callback(null, result[0]);
                    } else {
                        callback(null, null);
                    }
                }
        );
    }
}

/** Sync */
function randomString(length, chars) {
    if(!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if(charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length)
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength]
    };

    return result.join('');
}

/** Sync */
function randomAsciiString(length) {
    return randomString(length,
        'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789');
}

User.createUser = function(userId, userName, email, password, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        var SALT_LENGTH = 16;
        var salt = randomAsciiString(SALT_LENGTH);

        var newId;
        if (userId != null) newId = userId;
        else newId = uuid.v4();

        var pwHash = User.calcPwHash(password, salt);

        var query = "INSERT INTO users(user_id, username, email, salt, pw_hash, " +
                    "profile_image) VALUES(?, ?, ?, ?, ?, ?)";

        connection.query(query, [newId, userName, email, salt, pwHash, null],
            function (err, results) {
                connection.end();

                if (err) {
                    console.trace(err);
                    callback(err, null);
                    return;
                }

                // no error, assign the user to the default rooms if there are any
                if (config.defaultChatRooms && config.defaultChatRooms.length > 0) {
                    async.eachSeries(Object.keys(config.defaultChatRooms),
                        function (idx, seriesCallback) {
                            OpenChat.joinRoom(config.defaultChatRooms[idx],
                                newId, seriesCallback);

                        }, function done(err) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            callback(null, new User(newId, userName, email, salt,
                                pwHash, null, null));
                        }
                    );

                } else {
                    callback(null, new User(newId, userName, email, salt,
                        pwHash, null, null));
                }
            }
        );
    });
}

User.calcPwHash = function(password, salt) {
    return md5(password + ":" + salt);
}

User.updateProfileImage = function(userId, newImage, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        var query = "UPDATE users SET profile_image = ? WHERE user_id = ?";

        connection.query(query, [newImage, userId],
            function (err, results) {
                connection.end();

                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                callback(null);
            }
        );
    });
}

User.updateLastSeenTimeToNowIfNecessary = function(userId, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        var timestamp = Date.now();
        var twoMinutesAgo =  timestamp - (2 * 60 * 1000);
        var query = "UPDATE users SET last_seen = ? WHERE user_id = ? " +
                        "AND last_seen <= ? OR last_seen IS NULL;";

        connection.query(query, [timestamp, userId, twoMinutesAgo],
            function (err, results) {
                connection.end();

                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                callback(null);
            }
        );
    });
}

User.authenticate = function(username, password, callback) {
    if (identityPlugin) {
        //ask the identity plugin if we're authorized with the
        //creds that have been passed in
        identityPlugin.authenticate(username, password, function (err, user) {
            if (err) {
                callback(err);
                return;
            }

            if (!user) {
                callback(null, null);
                return;
            }

            //if we do have a user, fill out what we know from the database
            User._resolveLocalUserOrCreate(user, callback);
        });

    } else {
        User.findUserByName(username, function(err, result) {
            if (err) {
                callback(err);
                return;
            }

            if (!result) {
                callback(null, null);
                return;
            }

            var fullHash = User.calcPwHash(password, result.salt);
            if (fullHash == result.pwHash) {
                callback(null, result);
                return;
            }
            else {
                callback(null, null);
            }
        });
    }
}

module.exports = User;
