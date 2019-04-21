var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
// var axios = require("axios");
var moment = require("moment");


var router = express.Router();


// var APIID = process.env.APIID || "d7d86c16";
// var APIKEY = process.env.RECIPEAPI || "de28b35c4fbd92aecc64e7f389a73879";

// var APIURL = "https://api.edamam.com/search?app_id=" + APIID + "&app_key=" + APIKEY + "&from=0&to=8";


//API ROUTES======================================================================================================

//Getting calendar data from Day Table
router.get("/api/calendar/", function(req, res){
    if (!req.user) {
        return res.redirect("/");
    }

    db.Day.findAll({
        attributes: ["id", "date"],
        where: {UserId: req.user.id},
        include: [{
            model: db.Meal,
            attributes: ["name", "recipeURL"],
        }]
    }).then(function(calendarResults){
        res.json(calendarResults);
    });
});

//Route to add event to Day Table
router.post("/api/calendar/", function(req, res){
    if (!req.user) {
        return res.json({
            status: "not logged in"
        });
    }

    var data = req.body.data;
    console.log(req.body.date);
    db.Meal.findOrCreate({
        where: {recipeURL: data.recipeURL},
        defaults: data
    })
        .then(function(result){
            if (!req.user) {
                return res.redirect("/");
            }
            console.log(req.body.date);
            var meal = result[0].dataValues;

            db.Day.findOrCreate({
                where: {date: req.body.date,
                    MealId: meal.id},
                defaults: {
                    date: req.body.date,
                    MealId: meal.id,
                    UserId: req.user.id
                }
            }).then(function(result){
                console.log(result);
                res.send("meal has been scheduled");
            });
        });
});

//Updating receipe to Day model
router.put("/api/calendar/", function(req, res){
    console.log(req.body);

    db.Day.update({
        date: req.body.date,
    },
    { where:
             {
                 id: req.body.id
             }
    }).then(function(result){
        console.log(result);
        res.send("Event has been updated");
    });
});

//Deleting receipe from Day model
router.delete("/api/calendar/", function(req, res){
    db.Day.destroy({
        where:
             {
                 id: req.body.id
             }
    }).then(function(result){
        console.log(result);
        res.status(200).send();
    });

});

//Route to add favorite Table from calendar
router.post("/api/favorites/", function(req, res){
    if (!req.user) {
        return res.redirect("/");
    }

    console.log(req.body);
    db.Favorite.findOrCreate({
        where: {MealId: req.body.MealId},
        defaults: {MealId: req.body.MealId,
            UserId: req.user.id
        }

    }).then(function(){

        res.redirect("/members/calendar");
    });
});

//logging in route
router.post("/api/login/", passport.authenticate("local"), function(req, res) {
    res.json("/members");
});

//signing up account route
router.post("/api/signup", function(req, res) {

    db.User.create({
        username: req.body.username,
        password: req.body.password
    }).then(function() {
        res.redirect(307, "/api/login");
    }).catch(function(err) {
        console.log("Getting error");
        res.json(err);

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



//HTML ROUTES======================================================================================================

//Route to populate the scheuduled meal cards
router.get("/members/calendar", function(req, res){
    // console.log(req.user);

    if (!req.user) {
        return res.redirect("/");
    }

    var today = new Date();
    var formatToday = moment(today).toDate();
    var nextWeek = moment(formatToday).add(7, "days").toDate();

    db.Day.findAll({
        attributes: ["id", "date", "MealId"],
        order: ["date"],
        where: {
            UserId: req.user.id,
            date: {
                $between: [formatToday, nextWeek]
            }
        },
        include: [{
            model: db.Meal,
            attributes: ["name", "image", "recipeURL"],
        }]
    }).then(function(results){
        console.log(results);
        var scheduledMeals = [];

        for(var i = 0; i < results.length; i++){

            var formatDate = moment(results[i].date).format("dddd");


            var data = {
                id: results[i].id,
                MealId: results[i].MealId,
                date: formatDate,
                title: results[i].Meal.name,
                url: results[i].Meal.recipeURL,
                image: results[i].Meal.image
            };
            scheduledMeals.push(data);
        }
    
        console.log(scheduledMeals);

        res.render("calendar", {scheduledMeal:  scheduledMeals, user: req.user});
    });

});


router.get("/members/favorites", function(req, res) {
    //Checking if session exists for current user.

    console.log(req.user);
    if (!req.user) {
        return res.redirect("/");
    }
    // console.log(req.user.username);
    db.User.findAll({
        where: {id: req.user.id},
        include: [{
            model: db.Meal,
            attributes: ["name", "image", "recipeURL"],
            through: {
                model: db.Favorite
            }
        }]
    })
        .then(function(results){
            //Pull data from database
            var recipeList = results[0].Meals;
            console.log(recipeList);
            var recipes = [];
            for (var i = 0; i < recipeList.length; i++){

                var recipe = {
                    recipeName: recipeList[i].name,
                    imageLink: recipeList[i].image,
                    recipeLink: recipeList[i].recipeURL
                };

                recipes.push(recipe);
            }
            console.log(recipes);
            


            res.render("favorites", {
                user: req.user.username,
                recipes: recipes
            });

        });



});

router.get("/members", isAuthenticated, function(req, res) {
    console.log("reaching member page");
    res.render("members", {user: req.user.username});

});



router.get("/", function(req, res) {
    //Checking if session exists for current user.
    if (req.user) {
        return res.redirect("/members");
    }

    res.render("index", {
        msg: "Welcome!"
    });
});




router.get("/form", function(req, res) {
    console.log(req.user);
    res.render("form", {
        user: req.user
    });

});



// // Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});


module.exports = router;
