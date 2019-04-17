// Get references to page elements
var $loginForm = $("#login-btn");
var $signupForm = $("#signup-btn");
var $loginSubmit = $("#login-submit");
var $signupSubmit = $("#signup-submit");

$loginForm.on("click", function() {
    $("#signup-form").hide();
    $("#login-form").show();
});

$signupForm.on("click", function() {
    $("#login-form").hide();
    $("#signup-form").show();
});

$loginSubmit.on("click", function(event) {
    event.preventDefault();

    var login = {
        username: $("#usernameLogin")
            .val()
            .trim(),
        password: $("#userPasswordLogin")
            .val()
            .trim()
    };

    $.ajax("/api/login/", {
        method: "POST",
        data: login
    }).then(function(res) {
        console.log(res);
        console.log("Redirecting to main page");
        window.location.replace("/members");
    }).catch(function(err){
        alert("Sorry, username or password is incorrect.");
        console.log(err);
    });
});

$signupSubmit.on("click", function(event) {
    event.preventDefault();

    var pass1 = $("#userPasswordSignup")
        .val()
        .trim();
    var pass2 = $("#confirmPassword")
        .val()
        .trim();

    if (pass1 !== pass2) {
        $("#passwordMatch").text("Your passwords don't match!");
    } else {
        console.log($("#passwordLogin").val());
        var signup = {
            username: $("#usernameSignup")
                .val()
                .trim(),
            password: $("#userPasswordSignup")
                .val()
                .trim()
        };

        $.ajax("/api/signup", {
            method: "POST",
            data: signup
        }).then(function(res) {
            console.log(res);
            if(res.errors){
                return alert("Usersname has already been taken.");
            }
         
            console.log("Redirecting to main page");
            window.location.replace("/members");
        });
    }
});

