var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../config');
var lwip = require('lwip');
var ExifImage = require('exif').ExifImage;

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

    //load the exif data and see if we need to perform a rotation
    new ExifImage({image : inFile.path}, function (error, exifData) {
        var rotFlag = 0;
        if (! error) {
            console.info(exifData);
            if (exifData && exifData.image && exifData.image.Orientation) {
                rotFlag = exifData.image.Orientation;
            }
        } else {
            console.error(error);
        }

        console.info(rotFlag);

        //resize the image and also create a thumbnail
        lwip.open(inFile.path, function(err, original) {
            if (err) {
                console.error(err);
                res.status(500).send();
                return;
            }

            var rotDeg = 0;
            var func = function(callback) { original.clone(callback); }
            if (rotFlag != 0) {

                //we need to perform some kind of rotation
                if (rotFlag == 3) {
                    rotDeg = 180;
                } else if (rotFlag == 6) {
                    rotDeg = 90;
                } else if (rotFlag == 8) {
                    rotDeg == 270;
                }

                func = function(callback)
                {
                    console.info(rotDeg);
                    original.rotate(rotDeg, callback);
                }
            }

            func(function(err, fullSized) {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                    return;
                }

                //clone again before scaling
                fullSized.clone(function(err, fullClone) {
                    if (err) {
                        console.error(err);
                        res.status(500).send();
                        return;
                    }

                    //scale the original
                    var ratio = THUMB_WIDTH / fullClone.width();
                    fullClone.scale(ratio, function (err, timage) {
                        if (err) {
                            console.error(err);
                            res.status(500).send();
                            return;
                        }

                        var baseName = path.basename(inFile.path, path.extname(inFile.path));
                        var profilesDir
                            = path.normalize(
                                path.dirname(inFile.path) + '/../public/images/media'
                            );

                        var bigName = path.join(profilesDir, baseName + ".jpg");
                        var thumbName = path.join(profilesDir, baseName + "-t.jpg");

                        //save to the profiles directory
                        timage.writeFile(thumbName, function(err) {
                            if (err) {
                                console.error(err);
                                res.status(500).send();
                                return;
                            }

                            fullSized.writeFile(bigName, function(err) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send();
                                    return;
                                }

                                var ret = {
                                    img: '/images/media/' + baseName + ".jpg",
                                    thumb: '/images/media/' + baseName + "-t.jpg"
                                };

                                res.json(ret);
                            });
                        });
                    });
                });
            });
        });
    });


});

module.exports = router;
