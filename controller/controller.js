var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

var router = express.Router();

var axios = require("axios");




//HTML ROUTES======================================================================================================
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

// Load example page and pass in an example by id
// router.get("/login", function(req, res) {
//     //Session exists for the user
//     console.log(req.user);
//     if (req.user) {
//         return res.redirect("/members");
//     }

//     //Else render the login.handlbars
//     res.render("index");

// });

router.get("/members", isAuthenticated, function(req, res) {
    console.log("reaching member page");
    res.render("members", {user: req.user.username});

});


//API ROUTES======================================================================================================
//logging in route
router.post("/api/login/", passport.authenticate("local"), function(req, res) {
    console.log("going to members");
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

// eslint-disable-next-line no-unused-vars
router.post("/api/meals", function(req, res) {

    console.log(req.body);


});

router.get("/form", function(req, res) {

    res.render("form");

});

router.post("/api/recipe", function(req, res) {
	
    axios.get(req.body.sendingURL).then(function(response) {
        var data=response.data;
        var arr=[];
        
        for (var i = 0; i < data.hits.length; i ++){
            var caloriesPer = parseFloat(data.hits[i].recipe.calories)/parseFloat(data.hits[i].recipe.yield);
            
            var hours = Math.floor( parseInt(data.hits[i].recipe.totalTime) / 60);          
            var minutes = parseInt(data.hits[i].recipe.totalTime) % 60;
            
            var object = {
                "image": data.hits[i].recipe.image,
                "label": data.hits[i].recipe.label,
                "url": data.hits[i].recipe.url,
                "yield": data.hits[i].recipe.yield,
                "dietLabels": data.hits[i].recipe.dietLabels,
                "healthLabels": data.hits[i].recipe.healthLabels,
                "ingredientLines": data.hits[i].recipe.ingredientLines,
                "calories": Math.round(caloriesPer),
                "totalTime": hours + " hours and " + minutes + " minutes"
            };
            arr.push(object);
        }
        res.json(arr);
    }).catch(function(error) {
	    if (error.response) {
	      console.log(error.response.data);
	      console.log(error.response.status);
	      console.log(error.response.headers);
	    } else if (error.request) {
	      console.log(error.request);
	    } else {
	      console.log("Error", error.message);
	    }
	    console.log(error.config);
	  });
});

// // Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});

module.exports = router;