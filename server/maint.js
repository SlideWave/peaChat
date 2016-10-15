var config = require('./config');
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');

var Maint = function() {

}

/**
 * CLeans up old and expired images
 */
Maint.init = function(callback) {
    var connection = mysql.createConnection(config.siteDatabaseOptions);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            callback(err);
            return;
        }

        //get a list of all the profile images
        //we dont want to clean these up
        connection.query("SELECT profile_image FROM users", null,
            function(err, results) {
                if (err) {
                    console.error('unable to collect profile images: ' + err.stack);

                    connection.end();
                    callback(err);
                    return;
                }


                var profileImages = {};
                for (var i = 0, len = results.length; i < len; i++) {
                    var result = results[i];

                    profileImages[path.basename(result.profile_image)] = true;
                }

                connection.end();

                fs = require('fs');

                //we should have a bunch of media in public/images/media/
                //the cleanup will apply to these files that are beyond
                //the expiration in the settings
                var basePath = path.join(__dirname, 'public');
                var p = path.join(basePath, 'images', 'media');
                fs.readdir(p, function(err, files) {
                    if (err) {
                        console.error('Unable to list media director: ' + err);
                        callback(err);
                    }


                    for (var i=0, len=files.length; i < len; i++) {
                        var file = files[i];
                        var fullPath = path.join(p, file);

                        //make sure that the image is of sufficient age
                        var stat = fs.statSync(fullPath);

                        var now = new Date().getTime();
                        var endTime = new Date(stat.ctime).getTime()
                                        + config.imageRetentionPeriod;

                        if (endTime > now) {
                            //console.info('date ' + file);
                            continue;
                        }

                        //make sure that this image isn't in the profiles image
                        //list
                        var thumbName = file.replace("-t.jpg", ".jpg");
                        if (file in profileImages || thumbName in profileImages) {
                            //console.info('profile ' + file);
                            continue;
                        }

                        //console.info('remove ' + file);
                        fs.unlinkSync(fullPath);
                    }

                });
            }
        );
    });
}

module.exports = Maint;
