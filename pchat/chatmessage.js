var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var User = require('./user');

var ChatMessage = function(conversationId, timestamp, userId, message, media) {
    this.conversationId = conversationId;
    this.timestamp = timestamp;
    this.userId = userId;
    this.message = message;
    this.media = media;

    this.user = null;
}

ChatMessage.retentionDays = 1;

ChatMessage.mapChatQuery = function(sql, params, callback) {
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
                      new ChatMessage(result.conversation_id, result.timestamp,
                        result.user_id, result.message, result.media));
                }

                connection.end();

                User.resolveUsers(ret.map(function(message) { return message.userId; }),
                    function(err, data) {
                        if (err) {
                            callback(err, null);
                            return;
                        }

                        for (var i = 0, len = ret.length; i < len; i++) {
                            var message = ret[i];
                            message.user = data[message.userId];
                        }

                        callback(null, ret);
                    }
                );
            }
        );
    });
}

ChatMessage.getRecentChatMessages = function(conversationId, userId, callback) {
    ChatMessage.mapChatQuery(
        "SELECT * FROM chat " +
        "WHERE conversation_id = ? " +
          "AND timestamp >= UNIX_TIMESTAMP(DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)) * 1000 " +
          "AND timestamp > (SELECT checkpoint FROM open_chats WHERE user_id = ? AND conversation_id = ?) " +
        "ORDER BY timestamp DESC LIMIT 100",
        [conversationId, ChatMessage.retentionDays, userId, conversationId],
        function(err, results) {
            if (err || results.length > 0) {
                callback(err, results);

            } else {
                //there were no entries in the last day,
                //just grab the last one and send it back to establish the
                //most recent ID
                ChatMessage.mapChatQuery(
                    "SELECT * FROM chat WHERE conversation_id = ? " +
                    "ORDER BY timestamp DESC LIMIT 1",
                    [conversationId], callback
                );
            }
        }
    );
}

ChatMessage.getNewChatMessagesSince = function(chatId, since, callback) {
    ChatMessage.mapChatQuery(
        "SELECT * FROM chat " +
        "WHERE conversation_id = ? AND timestamp > ? ORDER BY timestamp ",
        [chatId, since], callback
    );
}

ChatMessage.postMessage = function(conversationId, userId, message, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "INSERT INTO chat(conversation_id, timestamp, user_id, message) " +
                  "VALUES(?, ?, ?, ?);";

        var timestamp = Date.now();

        var query = connection.query(sql, [conversationId, timestamp, userId, message],
            function(err, results) {
                if (err) {
                    connection.end();
                    console.error('error querying: ' + err.stack);
                    callback(err);
                    return;
                }

                callback(null, timestamp);
                connection.end();
        });
    });
}

ChatMessage.postMedia = function(conversationId, userId, media, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "INSERT INTO chat(conversation_id, timestamp, user_id, media) " +
                  "VALUES(?, ?, ?, ?);";

        var timestamp = Date.now();

        var query = connection.query(sql, [conversationId, timestamp, userId, media],
            function(err, results) {
                if (err) {
                    connection.end();
                    console.error('error querying: ' + err.stack);
                    callback(err);
                    return;
                }

                callback(null, timestamp);
                connection.end();
        });
    });
}

/**
 * Removes messages from a chat that are older than the retention period
 */
ChatMessage.clearExpiredData = function(conversationId, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "DELETE FROM chat WHERE conversation_id = ? " +
                    "AND timestamp < UNIX_TIMESTAMP(DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)) * 1000";

        connection.query(sql, [conversationId, ChatMessage.retentionDays],
            function(err, results) {
                if (err) {
                    connection.end();
                    console.error('error querying: ' + err.stack);
                    callback(err);
                    return;
                }

                callback(null);
                connection.end();
        });
    });
}

/**
 * Returns the most recent message timestamp in a conversation
 */
ChatMessage.getLatestTimestamp = function(conversationId, callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        var sql = "SELECT MAX(timestamp) as ts FROM chat WHERE conversation_id = ?;";

        connection.query(sql, [conversationId],
            function(err, results) {
                if (err) {
                    connection.end();
                    console.error('error querying: ' + err.stack);
                    callback(err, null);
                    return;
                }

                if (results.length > 0) {
                    callback(null, results[0].ts);
                } else {
                    callback(null, null);
                }

                connection.end();
        });
    });
}


module.exports = ChatMessage;
