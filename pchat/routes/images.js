var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../config');
var lwip = require('lwip');

var THUMB_WIDTH = 50;

router.post('/upload', function(req, res) {
    //make sure that we have a single file and it is the correct type
    if (req.files == null || !req.files.uploadfile || req.files.uploadfile.truncated) {
        res.status(400).send();
        console.error('Invalid number or size of uploaded files ' + JSON.stringify(req.files));
        return;
    }

    if (req.files.uploadfile.mimetype != "image/jpeg" &&
        req.files.uploadfile.mimetype != "image/png") {

        res.status(400).send();
        console.error('Invalid file type ' + req.files.uploadfile.mimetype);
        return;
    }

    var inFile = req.files.uploadfile;

    //resize the image and also create a thumbnail
    lwip.open(inFile.path, function(err, image1) {
        if (err) {
            console.error(err);
            res.status(500).send();
            return;
        }

        image1.clone(function(err, original) {
            if (err) {
                console.error(err);
                res.status(500).send();
                return;
            }

            //scale the original
            var ratio = THUMB_WIDTH / original.width();
            original.scale(ratio, function (err, timage) {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                    return;
                }

                console.info(inFile.path);

                var baseName = path.basename(inFile.path, path.extname(inFile.path));
                var profilesDir
                    = path.normalize(
                        path.dirname(inFile.path) + '/../public/images/profiles'
                    );

                var bigName = path.join(profilesDir, baseName + ".jpg");
                var thumbName = path.join(profilesDir, baseName + "-t.jpg");

                console.info(bigName);
                console.info(thumbName);

                //save to the profiles directory
                timage.writeFile(thumbName, function(err) {
                    if (err) {
                        console.error(err);
                        res.status(500).send();
                        return;
                    }

                    image1.writeFile(bigName, function(err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send();
                            return;
                        }

                        var ret = {
                            img: '/images/profiles/' + baseName + ".jpg",
                            thumb: '/images/profiles/' + baseName + "-t.jpg"
                        };

                        res.json(ret);
                    });
                });
            });
        });
    });
});

module.exports = router;
