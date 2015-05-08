var config = require('config');
var mysql = require('mysql');

var Setup = function() {

}

/**
 * Creates the database
 */
Setup.init = function() {
    //config.siteDatabaseOptions.
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err, null);
            return;
        }

        //connection.query(sql, params,
    });
}

module.exports = Setup;
