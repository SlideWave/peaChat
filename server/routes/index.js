var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');

/* GET home page. */
router.get('/', function(req, res) {
    var sess = req.session;

    res.render('index', { title: 'Welcome!'});
});

module.exports = router;
