// Disable auto discover for all elements:
//Dropzone.autoDiscover = false;
var submissionDropzone;

Dropzone.options.submissionDropzone = {
    url: "/images/upload",
    maxFilesize: 2,
    paramName: "uploadfile",
    maxThumbnailFilesize: 2,
    clickable: true,
    maxFiles: 1,
    acceptedFiles: "image/jpeg,image/png",
    thumbnailWidth: 350,

    resize: function(file) {
        var ratio = 350 / file.width;
        var imgHeight = file.height * ratio;

        var resizeInfo = {
            srcX: 0,
            srcY: 0,
            trgX: 0,
            trgY: 0,
            srcWidth: file.width,
            srcHeight: file.height,
            trgWidth: this.options.thumbnailWidth,
            trgHeight: imgHeight
        };

        $('.dz-details img').height(imgHeight);

        return resizeInfo;
    },

    init: function() {
        submissionDropzone = this;

        this.on('success', function(file, json) {
            $("#imagefile").val(json.img);
        });

        this.on('error', function(file, errorMessage, xhr) {
            $(".dz-error-mark").click(function() {
                submissionDropzone.removeFile(file);
            });
        });

        this.on('addedfile', function(file) {

        });

        this.on('drop', function(file) {

        });
    }
};
