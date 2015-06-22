var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var crypto = require('crypto');
var uuid = require('node-uuid');
var md5 = require('MD5');

var User = function(uuid, username, email, salt, pwHash, profileImage, lastSeen) {
    this.UUID = uuid;
    this.username = username;
    this.email = email;
    this.salt = salt;
    this.pwHash = pwHash;
    this.profileImage = profileImage;
    this.lastSeen = lastSeen;
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
 */
User.resolveUsers = function(userList, callback) {
    if (userList.length == 0) {
        callback(null, {});
        return;
    }

    User.mapUserQuery(
      User.SELECT_LIST +
      'FROM users WHERE user_id IN (?);',
      [userList], true, callback);
}

User.resolveUser = function(userId, callback) {
    User.mapUserQuery(
      User.SELECT_LIST +
      'FROM users WHERE user_id = ?;',
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
  User.mapUserQuery(
    User.SELECT_LIST +
    'FROM users WHERE username = ?;',
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

User.createUser = function(userName, email, password, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        var salt = randomAsciiString(16);
        var newId = uuid.v4();
        var pwHash = User.calcPwHash(password, salt);

        var query = "INSERT INTO users(user_id, username, email, salt, pw_hash, " +
                    "profile_image) VALUES(?, ?, ?, ?, ?, ?)";

        connection.query(query, [newId, userName, email, salt, pwHash, null],
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
                        "AND last_seen <= ?;";

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

module.exports = User;
