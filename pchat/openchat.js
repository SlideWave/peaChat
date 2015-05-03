var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var User = require('./user');
var md5 = require('MD5');

var OpenChat = function(conversationId, userId, title) {
    this.conversationId = conversationId;
    this.userId = userId;
    this.title = title;
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

        var query = connection.query(sql, params,
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
                      new OpenChat(result.user_id, result.conversation_id,
                        result.title));
                }

                connection.end();
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


module.exports = OpenChat;
