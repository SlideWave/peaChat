var express = require('express');
var router = express.Router();
var ChatMessage = require('../chatmessage');

/* GET home page. */
router.get('/', function(req, res) {
    var sess = req.session;

    ChatMessage.getRecentChatMessages(function (err, messages) {
        if (err) {
            console.error(err);
            res.status(500).send('Could not complete request');
            return;
        }

        res.render('chat',
            {   title: 'Fitness Chat',
                userFirst: sess.userFirst,
                messages: messages,
                pageScript: 'chat.page.js',
                session: sess });
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
