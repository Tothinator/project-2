var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

var router = express.Router();
//API ROUTES======================================================================================================
//logging in route
router.post("/api/login/", passport.authenticate("local"), function(req, res) {
    res.json("/members");
});

//signing up account route
router.post("/api/signup", function(req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    db.User.create({
        username: req.body.username,
        password: req.body.password
    }).then(function() {
        res.redirect(307, "/api/login");
    }).catch(function(err) {
        console.log("Getting error");
        res.json(err);
        // res.status(422).json(err.errors[0].message);
    });
});

router.post("/members/favorites", function(req, res) {
    //Posting favorties into database

});

router.post("/members/calendar", function(req, res) {
    //Posting calendar entry into database

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



//HTML ROUTES======================================================================================================
router.get("/members/favorites", function(req, res) {
    //Checking if session exists for current user.
    
    console.log(req.user);
    if (!req.user) {
        return res.redirect("/");
    }

    //Pull data from database
    res.render("favorites", {
        user: req.user.username
    });
});



router.get("/members/calendar", function(req, res) {
    //Posting favorties into database
    
});


router.get("/", function(req, res) {
    //Checking if session exists for current user.
    console.log(req.user);
    if (req.user) {
        return res.redirect("/members");
    }

    res.render("index", {
        msg: "Welcome!"
    });
});

router.get("/members", isAuthenticated, function(req, res) {
    console.log("reaching member page");
    res.render("members", {user: req.user.username});

});


// Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});




module.exports = router;
