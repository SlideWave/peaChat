/**
 * if the user passed in a setup param to us, execute setup
 */
if (process.argv.length > 2) {

    if (process.argv[2] == "setup") {
        require('./setup').init(function (err) {
            if (err) {
                process.exit(1);
            } else {
                process.exit(0);
            }
        });

        return;
    }

    if (process.argv[2] == "maint") {
        require('./maint').init(function (err) {
            if (err) {
                process.exit(1);
            } else {
                process.exit(0);
            }
        });

        return;
    }

}

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');

var config = require('./config');
var OpenChat = require('./openchat');


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

var routes = require('./routes/index');
var login = require('./routes/login');
var chat = require('./routes/chat');
var profile = require('./routes/profile');
var images = require('./routes/images');
var userRoute = require('./routes/user');

app.use(jwt({ secret: config.tokenSecret}).
    unless({
        path: ['/', '/login', '/login/']
    }));

app.use('/', routes);
app.use('/login', login);
app.use('/chat', chat);
app.use('/profile', profile);
app.use('/images', images);
app.use('/user', userRoute);

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

module.exports = app;
