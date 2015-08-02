/**
 * Encapsulates functions that allow scripts to monitor changes in the
 * status of chats
 */
var ChatMonitor = function () {

}

/**
 * List of observers to be called back when we a new chat has been created
 */
ChatMonitor.newChatObservers = [];

/**
 * List of observers to be called back when a chat is updated (new message)
 */
ChatMonitor.chatUpdatedObservers = [];

/**
 * List of the chats that we know about with their timestamp information
 */
ChatMonitor.knownChats = {};

/**
 * How often do we look for new or updated conversations
 */
ChatMonitor.pollRate = 10000;


/**
 * Register for notification when a new chat is created. This usually means
 * that we have a new IM.
 */
ChatMonitor.onNewChatCreated = function(callback) {
    ChatMonitor.newChatObservers.push(callback);
}

/**
 * Register for notification for when a chat is updated. This means
 * the chat has received a new message.
 */
ChatMonitor.onChatUpdated = function(callback) {
    ChatMonitor.chatUpdatedObservers.push(callback);
}

/**
 * Updates the timestamps for the latest message received on all conversations
 * and returns any conversations which have newer messages than the last time
 * we checked
 */
ChatMonitor.updateTimestamps = function(timestampsUpdatedCallback) {
    var updatedChats = [];

    async.eachSeries(Object.keys(ChatMonitor.knownChats), function iterator(key, cb) {
        //grab the most recent timestamp for the chat
        (function(thisChat, callback) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "/chat/timestamp/" + thisChat.chatData.conversationId,
                contentType: "application/json",
                success:
                    function(data) {
                        //update the timestamp
                        if (thisChat.timestamp != data.timestamp) {
                            thisChat.timestamp = data.timestamp;
                            updatedChats.push(thisChat);
                        }
                    },

                complete:
                    function (a,b) {
                        callback();
                    }
            });

        })(ChatMonitor.knownChats[key], cb);

    }, function done() {
        timestampsUpdatedCallback(updatedChats);
    });
}

/**
 * Finds new conversations that we don't have knowledge of
 */
ChatMonitor.findNewChats = function(callback) {
    var newChats = [];

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/chat/summary",
        contentType: "application/json",
        success:
            function(data) {
                //compare the chats we know about to this list
                for (var key in data) {
                    var chat = data[key];
                    if (!(chat.conversationId in ChatMonitor.knownChats)) {
                        ChatMonitor.knownChats[chat.conversationId]
                            = {chatData: chat, timestamp: 0};

                        newChats.push(chat);
                    }
                }
            },

        complete:
            function (a,b) {
                callback(newChats);
            }
    });
}

ChatMonitor.checkConversations = function(finishedCallback) {
    //first check to see if there are any new conversations that we
    //dont yet know about
    async.waterfall([
        function (callback) {
            ChatMonitor.findNewChats(function (newChats) {
                callback(null, newChats);
            });
        },
        function (newChats, callback) {
            ChatMonitor.updateTimestamps(function (updateList) {
                callback(null, newChats, updateList);
            });
        },
        function (newChats, updateList, callback) {
            for (var key in Object.keys(newChats)) {
                var newChat = newChats[key];
                for (var i=0, len=ChatMonitor.newChatObservers.length; i < len; i++) {
                    (ChatMonitor.newChatObservers[i])(newChat);
                }
            }

            for (var key in Object.keys(updateList)) {
                var updated = updateList[key];
                for (var i=0, len=ChatMonitor.chatUpdatedObservers.length; i < len; i++) {
                    (ChatMonitor.chatUpdatedObservers[i])(updated);
                }
            }

            callback(null);
        }
    ],
    finishedCallback);
}

/**
 * Runs the test for new and updated conversations
 */
function monitorCheckTimer() {
    ChatMonitor.checkConversations(function (err) {
        scheduleCheckTimer();
    });
}

function scheduleCheckTimer() {
    setTimeout(monitorCheckTimer, ChatMonitor.pollRate);
}

$(document).ready(function() {
    //when we first load, retrieve the current timestamp for each
    //chat that we know is open
    for (var i in Object.keys(openChats)) {
        var chat = openChats[i];

        ChatMonitor.knownChats[chat.conversationId] = {chatData: chat, timestamp: 0};
    }

    ChatMonitor.updateTimestamps(function (changes) {
        scheduleCheckTimer();
    });
});
