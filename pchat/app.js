var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var SessionStore = require('express-mysql-session');
var config = require('./config');

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

String.isEmpty = function(str) {
    if (str && str.trim().length) {
        return false;
    }

    return true;
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}
// session handler
app.use(session({
    key: 'pchat_sess',
    secret: config.sessionSecret,
    store: new SessionStore(config.siteDatabaseOptions),
    resave: true,
    saveUninitialized: true
}));

var routes = require('./routes/index');
var login = require('./routes/login');
var chat = require('./routes/chat');

//precatch any request coming in for any page
//and force to the login page if the user does
//not have a session
app.use(function(req, res, next) {
    //make sure the user is logged in
    var sess = req.session;

    if (sess && sess.userId) {
        next();
    } else {
        //allow the login screen to be directly accessed without
        //a session
        if (req.url.indexOf('/login') <= -1) {
            res.redirect('/login');
        } else {
            next();
        }
    }
});


app.use('/', routes);
app.use('/login', login);
app.use('/chat', chat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//app.listen(3000, '192.168.1.100');

module.exports = app;
