//
// Changes the navigation to indicate when new messages come in
//

function navNotifyNewChat(chat, firstRun) {
    var IM = 0;

    if (chat.type == IM) {
        cls = "fa fa-envelope-o fa-fw";
    } else {
        cls = "fa fa-group fa-fw";
    }

    var newConvoClass = ChatMonitor.firstRun ? '' : ' new-convo';
    var newItem = '<li><a href="/chat/' + chat.conversationId +
        '"><i class="' + cls + newConvoClass + '"></i> ' + chat.title + '</a></li>';

    $(newItem).insertBefore("#convo-div");
}

function navNotifyChatUpdated(chat) {
    if (chat.chatData.conversationId != conversationId) {
        $("#convo-icon-"+chat.chatData.conversationId).addClass("new-convo");
    }
}

//subscribe to notifications from the chat monitor
ChatMonitor.onNewChatCreated(navNotifyNewChat);
ChatMonitor.onChatUpdated(navNotifyChatUpdated);
