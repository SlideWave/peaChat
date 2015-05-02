//timezone detection
$(document).ready(function() {
    var z = -(new Date().getTimezoneOffset());
    $(".form-signin input[name=timezone]").attr('value', z);
});
