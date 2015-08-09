var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var md5 = require('MD5');
var moment = require('moment');
var async = require('async');

var User = require('../user');
var OpenChat = require('../openchat');

router.get('/', function(req, res) {
    res.render('login', { title: 'Login', pageScript: "login.page.js" });
});

router.get('/out', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/login');
    })
});

router.get('/tzdetect', function(req, res) {
    res.render('tzdetect', { title: 'Timezone Detection', pageScript: "tzdetect.page.js"});
});

router.post('/tzdetect', function(req, res) {
    var sess = req.session;

    sess.timezone = parseInt(req.body.timezone, "10");
    res.redirect('/');
});

router.get('/register', function(req, res) {
    var sess = req.session;

    sess.timezone = parseInt(req.body.timezone, "10");

    var error = null;
    if (req.query.e == "taken") {
        error = "That username is already taken";
    }

    if (req.query.e == "fields") {
        error = "All fields are required";
    }

    res.render('register', {title: 'Register', error: error});
});

router.post('/register', function(req, res) {
    var sess = req.session;

    if (String.isEmpty(req.body.username) ||
        String.isEmpty(req.body.email) ||
        String.isEmpty(req.body.password)) {

            res.redirect('/login/register?e=fields');
            return;
    }

    User.createUser(req.body.username, req.body.email, req.body.password,
        function (err, newId) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                  //this username is already taken
                  res.redirect('/login/register?e=taken');
                } else {
                    console.error(err);
                    res.status(500).send('Could not complete request');
                }

                return;
            }

            // no error, assign the user to the default rooms if there are any
            if (config.defaultChatRooms && config.defaultChatRooms.length > 0) {
                async.eachSeries(Object.keys(config.defaultChatRooms), function (idx, callback) {
                    OpenChat.joinRoom(config.defaultChatRooms[idx], newId, callback)
                }, function done(err) {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Could not complete request');
                    } else {
                        res.redirect('/login');
                    }
                }
                );
            } else {
                res.redirect('/login');
            }
        }
    );
});

router.post('/', function(req, res) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            res.status(500).send('Could not complete request');
            return;
        }

        User.findUserByName(req.body.username, function(err, result) {
              if (err) {
                  connection.end();
                  res.status(500).send('Could not complete request');
                  return;
              }

              if (! result) {
                  res.render('login', { title: 'Login', error: 'Login failed, try again' });
                  return;
              }

              var fullHash = User.calcPwHash(req.body.password, result.salt);

              if (fullHash == result.pwHash) {
                  var sess = req.session;
                  sess.userId = result.UUID;
                  sess.username = result.username;

                  if (req.body.timezone) {
                      sess.timezone = parseInt(req.body.timezone, "10");
                      res.redirect('/');
                  } else {
                      sess.timezone = 0;
                      res.redirect('/login/tzdetect');
                  }

              } else {
                  //console.log(fullHash);
                  res.render('login', { title: 'Login', error: 'Login failed, try again' });
              }

              connection.end();
        });
    });
});

module.exports = router;
