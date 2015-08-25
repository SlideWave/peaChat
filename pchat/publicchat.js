var mysql = require('mysql');
var session = require('express-session');
var config = require('./config');

//NOTE: DO NOT require('./user') HERE. User already depends on openchat

var PublicChat = function(conversationId, title, userCount) {
    this.conversationId = conversationId;
    this.title = title;
    this.userCount = userCount;
}

PublicChat.mapPublicChatQuery = function(sql, params, callback) {
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
                      new PublicChat(result.conversation_id, result.title,
                        result.user_count));
                }

                connection.end();

                callback(null, ret);
            }
        );
    });
}

PublicChat.getPublicChats = function(callback) {
    PublicChat.mapPublicChatQuery(
        "SELECT * FROM public_chats",
        null, callback
    );
}

module.exports = PublicChat;
