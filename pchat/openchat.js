var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var User = require('./user');
var md5 = require('MD5');

var OpenChat = function(conversationId, userId, title, type) {
    this.conversationId = conversationId;
    this.userId = userId;
    this.title = title;
    this.type = type;
}

OpenChat.IM = 0;
OpenChat.CHATROOM = 1;

OpenChat.mapOpenChatQuery = function(sql, params, callback) {
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

                var ret = [];
                for (var i = 0, len = results.length; i < len; i++) {
                    var result = results[i];

                    ret.push(
                      new OpenChat(result.conversation_id, result.user_id,
                        result.title, result.type));
                }

                connection.end();

                callback(null, ret);
            }
        );
    });
}

OpenChat.getOpenChats = function(userId, callback) {
    OpenChat.mapOpenChatQuery(
        "SELECT * FROM open_chats " +
        "WHERE user_id = ? ", [userId], callback
    );
}

/**
 * Starts a new IM between two users generating
 * the proper chat ID for the conversation
 */
OpenChat.startIM = function(userA, userB, callback) {
    //hash as:
    //find the lowest user UUID and make that user
    //userA, then the conversation ID becomes...
    // md5([userA_id][userA_salt][userB_id][userB_salt])
    if (userB.UUID < userA.UUID) {
        var temp = userA;
        userA = userB;
        userB = temp;
    }

    var convId = md5(userA.UUID + userA.salt + userB.UUID + userB.salt);

    var atitle = "IM with " + userB.username;
    var btitle = "IM with " + userA.username;

    //create the new chat for both sides
    OpenChat.createNewChat(convId, userA.UUID, atitle, OpenChat.IM,
        function(err) {
            if (err && err.code != 'ER_DUP_ENTRY') { //we'll get dup if a user tries to start the same IM twice
                callback(err, null);
                return;
            }

            OpenChat.createNewChat(convId, userB.UUID, btitle, OpenChat.IM,
                function(err) {
                    if (err && err.code != 'ER_DUP_ENTRY') {
                        callback(err);
                        return;
                    }

                    //success
                    callback(null, convId);
                }
            );
        }
    );
}

OpenChat.createNewChat = function(conversationId, userId, title, type, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "INSERT INTO open_chats(user_id, conversation_id, title, type) " +
                  "VALUES(?, ?, ?, ?);";

        var query = connection.query(sql, [userId, conversationId, title, type],
            function(err, results) {
                if (err) {
                    connection.end();
                    callback(err);
                    return;
                }

                callback(null);
                connection.end();
        });
    });
}

OpenChat.findChatInfo = function(userId, conversationId, callback) {
    OpenChat.mapOpenChatQuery(
        "SELECT * FROM open_chats " +
        "WHERE user_id = ? AND conversation_id = ? ", [userId, conversationId],
        function(err, info) {
            if (err || !info) {
                callback(err, info);
                return;
            }

            callback(null, info[0]);
        }
    );
}

/**
 * Adds the given user to a chat room
 */
OpenChat.joinRoom = function(roomName, userId, callback) {
    //hash as: md5(roomName)
    var convId = md5(roomName);
    var atitle = roomName;

    //create the new chat for the user
    OpenChat.createNewChat(convId, userId, atitle, OpenChat.CHATROOM,
        function(err) {
            if (err && err.code != 'ER_DUP_ENTRY') { //we'll get dup if a user tries to start the same room twice
                callback(err, null);
                return;
            }

            //success
            callback(null, convId);
        }
    );
}

/**
 * Removes the given user from a chat
 */
OpenChat.leaveChat = function(conversationId, userId, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "DELETE FROM open_chats WHERE user_id = ? AND conversation_id = ?;";

        connection.query(sql, [userId, conversationId],
            function(err, results) {
                if (err) {
                    connection.end();
                    callback(err);
                    return;
                }

                callback(null);
                connection.end();
        });
    });
}


module.exports = OpenChat;
