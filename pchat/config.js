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

/*
config.httpsOptions = {
    key: fs.readFileSync('/Users/ddaeschler/Desktop/pchat.slidewave.com.key'),
    cert: fs.readFileSync('/Users/ddaeschler/Desktop/pchat.slidewave.com.cert'),
};
*/

config.uploadDir = './upload/';
config.maxUploadSize = 4194304;
config.imageRetentionPeriod = 48 * (60 * 60 * 1000); //48 hrs
config.chatRetentionHours = 48; //48 hrs

/**
 * Default chat rooms can be specified here that all new users
 * will be placed into when they first register
 */
config.defaultChatRooms = ['Welcome Chat'];

config.plugins = {};

/**
 * User identity can be managed by an external provider. You can specify
 * the module that will load user identity information
 */

// identity-demo is a module for demonstrating how to create an identity plugin
//config.plugins['identity'] = './plugins/identity-demo.js';


/**
 * If you are supplying external identity, you probably want to change
 * the registration link
 */
config.registrationURL = '/login/register';



module.exports = config;
