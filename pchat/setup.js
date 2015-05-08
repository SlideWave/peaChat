var config = require('./config');
var mysql = require('mysql');

var Setup = function() {

}

/**
 * Creates the database
 */
Setup.init = function(callback) {
    config.siteDatabaseOptions.database = null;
    config.siteDatabaseOptions.multipleStatements = true;

    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        fs = require('fs');
        fs.readFile('../schema/schema.sql', 'utf8', function (err,data) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }

            connection.query(data, function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                callback(null);
            });
        });
    });
}

module.exports = Setup;
