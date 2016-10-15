var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var User = require('../user')

/* GET home page. */
router.get('/lastseen/:id', function(req, res) {
    var sess = req.session;

    User.resolveUser(req.params.id, function (err, user) {
        if (err) {
            console.error(err);
            res.status(500).send();
            return;
        }

        if (! user) {
            console.error('User ' + req.params.id + 'not found');
            res.status(404).send();
            return;
        }

        var obj = {name: user.username, lastseen: user.lastSeen};
        //console.info(obj);

        res.json(obj);
    });
});

module.exports = router;
