var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../config');
var lwip = require('lwip');
var ExifImage = require('exif').ExifImage;
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: config.uploadDir,
    limits: {
        files: 1,
        fileSize: config.maxUploadSize
    }
});

var THUMB_WIDTH = 50;
var MAX_DIMENSION = 2048;

router.post('/', upload.single('file'), function(req, res) {
    console.error(req.file);

    //make sure that we have a single file and it is the correct type
    if (req.file == null || req.file.truncated) {
        res.status(400).send();
        console.error('Invalid number or size of uploaded files ' + JSON.stringify(req.file));
        return;
    }

    if (req.file.mimetype != "image/jpeg" &&
        req.file.mimetype != "image/png") {

        res.status(400).send();
        console.error('Invalid file type ' + req.files.uploadfile.mimetype);
        return;
    }

    var inFile = req.file;
    var exifFunc;
    var shortType;

    if (inFile.mimetype == "image/jpeg") {
        shortType = "jpg";
    } else {
        shortType = "png";
    }

    if (inFile.mimetype == "image/jpeg") {
        exifFunc = function(callback) {
            try {
                new ExifImage({image: inFile.path}, callback);
            } catch (e) {
                console.error(e);
                callback(e, null);
            }
        }

    } else {
        exifFunc = function(callback) {
            callback(null, null);
        }
    }

    //load the exif data and see if we need to perform a rotation
    exifFunc(function (error, exifData) {
        var rotFlag = 0;
        if (! error) {
            if (exifData && exifData.image && exifData.image.Orientation) {
                rotFlag = exifData.image.Orientation;
            }
        } else {
            console.error("Exif: " + error);
        }

        lwip.open(inFile.path, shortType, function(err, initial) {
            if (err) {
                console.error(err);
                res.status(500).send();
                return;
            }

            var batch = initial.batch();

            //first, let's cut this image down to size
            //find the largest dimension
            var largeDimension;
            if (initial.width() > initial.height()) {
                //use the width to clamp
                largeDimension = initial.width();
            } else {
                //use the height to clamp
                largeDimension = initial.height();
            }

            scale = MAX_DIMENSION / largeDimension;
            var rotDeg = 0;

            var finish = function(err, fullSized) {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                    return;
                }

                //clone again before scaling for thumbnail
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

                                //delete the original
                                fs.unlink(inFile.path, function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                });
                            });
                        });
                    });
                });
            };

            if (rotFlag != 0) {
                //we need to perform some kind of rotation
                if (rotFlag == 3) {
                    rotDeg = 180;
                } else if (rotFlag == 6) {
                    rotDeg = 90;
                } else if (rotFlag == 8) {
                    rotDeg = 270;
                }

                if (scale < 1.0) {
                    batch.scale(scale).rotate(rotDeg).exec(finish);
                } else {
                    batch.rotate(rotDeg).exec(finish);
                }

            } else {
                if (scale < 1.0) {
                    batch.scale(scale).exec(finish);
                } else {
                    finish(null, initial);
                }

            }
        });
    });


});

module.exports = router;