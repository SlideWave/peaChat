var config = {}

config.siteDatabaseOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pchat'
};

config.sessionSecret = 'changeMe';

module.exports = config;
