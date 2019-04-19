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
        if (window.localStorage.length > 0) {
            addLocal();
        } else {
            console.log("Redirecting to main page");
            window.location.replace("/members");
        }
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
        $("#confirmPassword").toggleClass("is-invalid");
        $("#passwordMatch").text("Your passwords don't match!")
            .toggleClass("invalid-feedback");
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
            }else if (window.localStorage.length > 0) {
                addLocal();
            } else {
                console.log("Redirecting to main page");
                window.location.replace("/members");
            }
        });
    }
});

function addLocal() {
    var url = window.localStorage.key(0);
    var obj = JSON.parse(window.localStorage.getItem(url));
    
    if (obj.date !== undefined) {
        $.ajax("/api/calendar", {
            method: "POST",
            data: obj
        }).then(function(res) {
            console.log(res);
            window.localStorage.clear();
            window.location.reload();
        });
    } else {
        $.ajax("/api/meals", {
            method: "POST",
            data: {
                url: url,
                data: obj,
                table: "favorite"
            }
        }).then( function(results){
            console.log(results);
            window.localStorage.clear();
            window.location.reload();

        });
    }

}
