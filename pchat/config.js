var fs = require('fs');

var config = {}

config.siteDatabaseOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pchat'
};

config.sessionSecret = 'changeMe';

config.httpsOptions = {
    key: fs.readFileSync('/Users/ddaeschler/Desktop/pchat.slidewave.com.key'),
    cert: fs.readFileSync('/Users/ddaeschler/Desktop/pchat.slidewave.com.cert'),
};

module.exports = config;
