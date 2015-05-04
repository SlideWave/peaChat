var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var md5 = require('MD5');
var moment = require('moment');

var User = require('../user');

router.get('/', function(req, res) {
    res.render('yourprofile', 
        {
            title: 'Your Profile',
            pageScript: "profile.page.js"
        });
});

module.exports = router;
