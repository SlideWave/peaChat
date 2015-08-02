//
// Changes the navigation to indicate when new messages come in
//

/*
<li class="nav-divider"></li>
<% for (var i=0, len=openChats.length; i < len; i++) {
        var chat = openChats[i];

        var cls;
        if (chat.type == OpenChat.IM) {
            cls = "fa fa-envelope-o fa-fw";
        } else {
            cls = "fa fa-group fa-fw";
        }
%>
<li>
    <a href="/chat/<%= chat.conversationId%>"><i class="<%=cls%>"></i> <%= chat.title %></a>
</li>
<% } %>
<li class="nav-divider" id="convo-div"></li>
*/

function navNotifyNewChat(chat) {
    var IM = 0;

    if (chat.type == IM) {
        cls = "fa fa-envelope-o fa-fw";
    } else {
        cls = "fa fa-group fa-fw";
    }

    var newItem = '<li><a href="/chat/' + chat.conversationId +
        '"><i class="' + cls + ' new-convo"></i> ' + chat.title + '</a></li>';

    $(newItem).insertBefore("#convo-div");
}

function navNotifyChatUpdated(chat) {
    if (chat.chatData.conversationId != conversationId) {
        $("#convo-icon-"+chat.chatData.conversationId).addClass("new-convo");
    }
}

$(document).ready(function() {
    //subscribe to notifications from the chat monitor
    ChatMonitor.onNewChatCreated(navNotifyNewChat);
    ChatMonitor.onChatUpdated(navNotifyChatUpdated);
});
