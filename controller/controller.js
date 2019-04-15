var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

var router = express.Router();




//HTML ROUTES======================================================================================================
router.get("/", function(req, res) {
    res.render("index", {
        msg: "Welcome!"
    });
});

// Load example page and pass in an example by id
router.get("/login", function(req, res) {
    //Session exists for the user
    console.log(req.user);
    if (req.user) {
        return res.redirect("/members");
    }

    //Else render the login.handlbars
    res.render("login");

});

router.get("/members", isAuthenticated, function(req, res) {

    res.render("members");

});


// Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});


//API ROUTES======================================================================================================
router.post("/api/login", passport.authenticate("local"), function(req, res) {
    res.json("/members");
});

router.post("/api/signup", function(req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    db.User.create({
        username: req.body.username,
        password: req.body.password
    }).then(function() {
        res.redirect(307, "/api/login");
    }).catch(function(err) {
        console.log(err);
        res.json(err);
        // res.status(422).json(err.errors[0].message);
    });
});

// Route for logging user out
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// Route for getting some data about our user to be used client side
router.get("/api/user_data", function(req, res) {
    if (!req.user) {
        // The user is not logged in, send back an empty object
        res.json({});
    }
    else {
        // Otherwise send back the user's email and id
        // Sending back a password, even a hashed password, isn't a good idea
        res.json({
            username: req.user.username,
            id: req.user.id
        });
    }
});

module.exports = router;
