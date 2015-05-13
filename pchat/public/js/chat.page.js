var lastTimestamp = 0;
var pollRate = 1000;
var alertTimeoutId = null;
var focused = true;
var title = document.title;
var maxDisplayed = 100;

window.onfocus = function () {
    if (alertTimeoutId != null) {
        clearInterval(alertTimeoutId);
        alertTimeoutId = null;
    }

    document.title = title;
    focused = true;
}

window.onblur = function() {
    focused = false;
}

function doNewMessageAlert() {
    var msg = "New Message";
    var timeoutId;
    var blink = function() { document.title = document.title == msg ? title : msg; };
    if (!alertTimeoutId && !focused) {
        alertTimeoutId = setInterval(blink, 1000);
    }
}

function updateChatTimes() {
    //run though all the chat messages in the DOM and
    //update the "posted X hrs/days/etc ago" labels
    $(".chat-body .post-date span").each(function(index, elem) {
        var date = moment($(elem).attr('data-date'), 'x');
        var posted = moment.duration(date.diff(moment())).humanize();

        $(elem).html(posted);
    });
}

function pruneOldMessages() {
    //run though all the chat messages in the DOM and
    //prune old messages that are at the top
    var len = $(".chatmessage").length;
    var toRemove = len - maxDisplayed;

    if (toRemove > 0) {
        $(".chatmessage").each(function(index, elem) {
            if (toRemove-- > 0) {
                elem.remove();
                return true;
            } else {
                return false;
            }
        });
    }


}

function showProfileImage(image) {
    bootbox.alert("<img src='" + image + "' style='width: 100%'>", function() {
    });
}

function showMediaImage(image) {
    bootbox.alert("<img src='" + image + "' style='width: 100%'>", function() {
    });
}

function addToChatBox(messages) {
    var tzoff = new Date().getTimezoneOffset();

    for (var i = 0, len=messages.length; i < len; i++) {
        var msg = messages[i];

        var liClass = 'left';
        var spanClass = 'pull-left';
        var smallClass = 'pull-right';
        var strongClass = '';

        if (msg.userId == userid) {
            liClass = 'right';
            spanClass = 'pull-right';
            smallClass = '';
            strongClass = 'pull-right ';
        }

        var localTimePostedOn = moment(msg.timestamp).zone(tzoff);
        var posted = moment.duration(localTimePostedOn.diff(moment())).humanize();

        var pimage;

        if (msg.user.profileImage != null) {
            pimage = msg.user.profileImage.slice(0, -4) + "-t.jpg";
        } else {
            pimage = "/images/blank.png";
        }

        var id = conversationId + msg.timestamp.toString() + msg.userId;

        var body;
        if (msg.media != null) {
            var mimage = msg.media.slice(0, -4) + "-t.jpg";
            body = '<a href="#" class="media"><img src="' + mimage + '"></a>';
        } else {
            body = '<p>' + html_sanitize(msg.message) + '</p>';
        }

        $("ul.chat").append(
            '<li class="' + liClass + ' clearfix chatmessage" id="' + id + '">' +
                '<span class="chat-img ' + spanClass + '">' +
                    '<a href="#">' +
                        '<img src="' + pimage +
                            '" alt="User Avatar" class="img-circle" style="width: 50px; height: 50px;" />' +
                    '</a>' +
                '</span>' +
                '<div class="chat-body clearfix">' +
                    '<div class="header">' +
                        '<strong class="' + strongClass + 'primary-font">' +
                            msg.user.username +
                        '</strong>' +
                        '<small class="' + smallClass + ' text-muted post-date">' +
                            '<i class="fa fa-clock-o fa-fw"></i><span data-date="' + localTimePostedOn + '">' + posted + '</span> ago' +
                        '</small>' +
                    '</div>' +
                        body +
                '</div>' +
            '</li>'
        );

        (function (pimage) {
            $("#" + id + " > span.chat-img > a").click(function (evt) {
                if (pimage != null) {
                    showProfileImage(pimage);
                }
                evt.preventDefault();
            });
        })(msg.user.profileImage);

        if (msg.media) {
            (function (mimage) {
                $("#" + id + " > div.chat-body > a.media").click(function (evt) {
                    if (pimage != null) {
                        showMediaImage(mimage);
                    }
                    evt.preventDefault();
                });
            })(msg.media);
        }


        lastTimestamp = msg.timestamp;
    }

    if (messages.length > 0) {
        //something was added, scroll to the bottom
        document.getElementById('chat-body').scrollTop = 99999;
        //also alert
        doNewMessageAlert();
    }

}

function getChatSinceLastCheck(completedCallback) {
    var cid = conversationId;

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/chat/since/" + cid + "/" + lastTimestamp +"?timestamp="+$.now(),
        contentType: "application/json",

        success:
            function(data) {
                addToChatBox(data);
            },

        complete:
            function(xhr, status) {
                completedCallback();
            }
    });
}

function sendChat() {
    var text = $("#btn-input").val();
    if (text.trim() == '') return;

    $("#btn-input").val('');
    var cid = conversationId;

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/chat/add",
        contentType: "application/json",
        data: JSON.stringify({"chatText": text, "conversationId": cid}),
        success:
        function(data) {
        }
    });
}

function chatRefresh(callback) {
    getChatSinceLastCheck(function() {
        pruneOldMessages();
        updateChatTimes();

        callback();
    });
}

function chatTimer() {
    chatRefresh(function() {
        setTimeout(chatTimer, pollRate);
    });
}

function leaveChat() {
    var cid = conversationId;

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/chat/leave",
        contentType: "application/json",
        data: JSON.stringify({"conversationId": cid}),
        success:
        function(data) {
            window.location = "/";
        }
    });
}

function chatClear() {
    //run though all the chat messages in the DOM and
    //remove them all
    $(".chatmessage").each(function(index, elem) {
        elem.remove();
    });
}

$(document).ready(function() {
    var cid = conversationId;

    //grab the most recent chat messages
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/chat/recent/" + cid,
        contentType: "application/json",
        success:
        function(data) {
            addToChatBox(data);
        }
    });

    $("#btn-chat").click(function(evt) {
        sendChat();
    });

    $("#btn-input").keypress(function (e) {
        var key = e.which;
        if(key == 13)  { //enter key
            sendChat();
            return false;
        }
    });

    $("#chat-clear").click(function (e) {
        chatClear();
        e.preventDefault();
    });

    $("#chat-leave").click(function (e) {
        leaveChat();
        e.preventDefault();
    });

    $("#btn-media").click(function(e) {
        $("#addMediaModal").modal();
    });

    $("#media-cancel").click(function(e) {
        $("#imagefile").val('');
        submissionDropzone.removeAllFiles();
    });

    $("#media-send").click(function(e) {
        var file = $("#imagefile").val();
        $("#imagefile").val('');

        submissionDropzone.removeAllFiles();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/chat/add",
            contentType: "application/json",
            data: JSON.stringify({"media": file, "conversationId": cid}),
            success:
            function(data) {
            }
        });
    });

    setTimeout(chatTimer, pollRate);
});
