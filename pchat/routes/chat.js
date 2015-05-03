var express = require('express');
var router = express.Router();
var ChatMessage = require('../chatmessage');
var OpenChat = require('../openchat');
var User = require('../user');

/* GET the messages from a specific chat */
router.get('/:id', function(req, res) {
    var sess = req.session;

    ChatMessage.getRecentChatMessages(req.params.id, function (err, messages) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        res.render('chat',
            {   title: 'Chat',
                username: sess.username,
                messages: messages,
                pageScript: 'chat.page.js',
                session: sess });
    });
});

/**
 * Displays a screen where a user can start a new IM session
 */
router.get('/im/new', function(req, res) {
    var sess = req.session;

    var e = null;
    if (req.query.e == "notfound") {
        e = "Username not found";
    }

    res.render('newim',
    {   title: 'Send a new Instant Message',
        username: sess.username,
        session: sess,
        error: e});
});

router.post('/im/new', function(req, res) {
    var sess = req.session;

    //look up both users involved
    User.findUserByName(req.body.username, function(err, u1) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        if (u1 == null) {
            //we couldn't find the user
            res.redirect('/chat/im/new?e=notfound');
            return;
        }

        User.resolveUser(sess.userId, function (err, u2) {
            if (err || u2 == null) {
                console.error(err);
                res.status(500).send('Could not complete request');
                return;
            }

            OpenChat.startIM(u1, u2, function(err, chatId) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Could not complete request');
                    return;
                }

                res.redirect('/chat/' + chatId);
            })
        });

    });
});

router.get('/recent', function(req, res) {
    ChatMessage.getRecentChatMessages(function (err, messages) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        //reverse the sorting since it will be newest first
        //coming out of the DB
        var reordered = [];
        for (var i = messages.length - 1; i >= 0; i--) {
            reordered.push(messages[i]);
        }

        //blank out the user's email
        for (var i = 0, len=reordered.length; i < len; i++) {
            reordered[i].user.email = null;
        }

        res.json(reordered);
    });
});

router.get('/since/:id', function(req, res) {
    ChatMessage.getNewChatMessagesSince(req.params.id, function (err, messages) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        //blank out the user's email
        for (var i = 0, len=messages.length; i < len; i++) {
            messages[i].user.email = null;
        }

        res.json(messages);
    });
});

router.post('/add', function(req, res) {
    var sess = req.session;

    ChatMessage.postMessage(sess.userId, req.body.chatText, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        res.json({"status": "ok"});
    });
});

module.exports = router;
