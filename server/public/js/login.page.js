//timezone detection
$(document).ready(function() {
    var z = -(new Date().getTimezoneOffset());
    $(".form-signin input[name=timezone]").attr('value', z);
});

$("#signin-form").on("submit", function (event) {
    event.preventDefault();

    var data = $(this).serialize();

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/login",
        data: data,
        success:
            function(data) {
                //we have a valid token. Save it
                localStorage.setItem("token", data.token);
            },

        error:
            function(xhr, textStatus, error) {
                $("#err-message").text(error);
                $(".alert").show();
            }
    });
});


