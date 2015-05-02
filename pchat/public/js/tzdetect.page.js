//timezone detection
$(document).ready(function() {
    var z = -(new Date().getTimezoneOffset());
    $("#form input[name=timezone]").attr('value', z);
    $("#form").submit();
});
