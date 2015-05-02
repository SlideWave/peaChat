var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');
var User = require('./user');

var ChatMessage = function(conversationId, timestamp, userId, message) {
    this.conversationId = conversationId;
    this.timestamp = timestamp;
    this.userId = userId;
    this.message = message;

    this.user = null;
}

ChatMessage.mapChatQuery = function(sql, params, callback) {
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
                      new ChatMessage(result.chat_id, result.timestamp,
                        result.user_id, result.message));
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

ChatMessage.getRecentChatMessages = function(conversationId, callback) {
    ChatMessage.mapChatQuery(
        "SELECT * FROM chat " +
        "WHERE conversation_id = ? " +
          "AND timestamp >= UNIX_TIMESTAMP(DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)) * 1000 " +
        "ORDER BY timestamp ASC LIMIT 100", [conversationId], function(err, results) {

            if (err || results.length > 0) {
                callback(err, results);
            } else {
                //there were no entries in the last day,
                //just grab the last one and send it back
                ChatMessage.mapChatQuery(
                    "SELECT * FROM chat WHERE conversation_id = ? " +
                    "ORDER BY timestamp DESC LIMIT 1",
                    [conversationId], callback
                );
            }
        }
    );
}

ChatMessage.getNewChatMessagesSince = function(since, callback) {
    ChatMessage.mapChatQuery(
        "SELECT * FROM chat " +
        "WHERE conversation_id = ? AND timestamp > ? ORDER BY timestamp ",
        [since], callback
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
                  "VALUES(?, ?, ?);";

        var timestamp = Date.now();

        var query = connection.query(sql, [conversationId, timestamp, userId, message],
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


module.exports = ChatMessage;
