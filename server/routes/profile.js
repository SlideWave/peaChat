var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var md5 = require('md5');
var moment = require('moment');

var User = require('../user');

router.get('/', function(req, res) {
    var sess = req.session;

    res.render('yourprofile',
        {
            title: "Your profile",
            username: sess.username,
            pageScript: 'dropzone.page.js',
            session: sess
        });
});

router.post('/', function(req, res) {
    var sess = req.session;

    User.updateProfileImage(sess.userId, req.body.imagefile, function(err) {
        if (err) {
            console.error(err);
            res.status(500).send();
            return;
        }

        res.redirect('/profile');
    })
});

module.exports = router;
