var ChatMonitor = function () {

}

/**
 * List of delegates to be called back when we a new chat has been created
 */
ChatMonitor.newChatDelegates = [];

/**
 * List of delegates to be called back when a chat is updated (new message)
 */
ChatMonitor.chatUpdatedDelegates = [];


/**
 * Register for notification when a new chat is created. This usually means
 * that we have a new IM.
 */
ChatMonitor.onNewChatCreated = function(callback) {
    ChatMonitor.newChatDelegates.push(callback);
}

/**
 * Register for notification for when a chat is updated. This means
 * the chat has received a new message.
 */
ChatMonitor.onChatUpdated = function(callback) {
    ChatMonitor.chatUpdatedDelegates.push(callback);
}

$(document).ready(function() {
    //when we first load, retrieve the current timestamp for each
    //chat that we know is open

});
