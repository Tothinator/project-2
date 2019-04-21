var express = require("express");
var db = require("../models");
var axios = require("axios");
var moment = require("moment");
var isAuthenticated = require("../config/middleware/isAuthenticated");

var router = express.Router();

var APIID = process.env.APIID || "ac3e460c";
var APIKEY = process.env.RECIPEAPI || "4a8c99b69bd19aa9ecf68dd209babee8";
var APIURL = "https://api.edamam.com/search?app_id=" + APIID + "&app_key=" + APIKEY + "&from=0&to=8";

//HTML ROUTES======================================================================================================

// Get empty search form
router.get("/form", function(req, res) {
    console.log(req.user);
    res.render("form", {
        user: req.user
    });

});

// Post search results to the form url
router.post("/form", function(req, res) {

    // console.log(req.body);

    if (req.body.food === "") {
        console.log("Nothing here");
        return res.render("form", {
            user: req.user,
            msg: "Please fill out one of the three fields to search for recipes."
        });
    }

    var health = "";
    var diet = "";
    var food = "";

    if (req.body.food !== "") {
        food = "&q=" + req.body.food;
    }

    if (req.body.diet !== "" && req.body.diet !== undefined) {
        diet = "&diet=" + req.body.diet;
    }

    if (req.body.health !== undefined) {
        if(req.body.health.length !== 0 && typeof req.body.health === "array") {
            req.body.health.forEach(function(i) {
                health=health+"&health="+i;
            });
        } else if (req.body.health !== "") {
            health = "&health=" + req.body.health;
        }
    }

    console.log(APIURL + food + health + diet);

    axios.get(APIURL + food + health + diet)
        .then(function(response) {
            var data = response.data.hits;
            var meals=[];
            // console.log(data[0]);

            // TODO
            // make a database query to get all the user's favorites

            if (req.user) {

                db.Favorite.findAll({
                    where: {
                        UserId: req.user.id,
                    },
                    include: [{
                        model: db.Meal,
                        attributes: ["recipeURL"]
                    }]
                }).then(function (result) {

                    // console.log(result[0].Meal.recipeURL);

                    for (var i = 0; i < data.length; i ++){
                        var hours = Math.floor(data[i].recipe.totalTime / 60);
                        var minutes = data[i].recipe.totalTime % 60;

                        var object = {
                            "image": data[i].recipe.image,
                            "label": data[i].recipe.label,
                            "url": data[i].recipe.url,
                            "yield": data[i].recipe.yield,
                            "dietLabels": data[i].recipe.dietLabels,
                            "healthLabels": data[i].recipe.healthLabels,
                            "ingredientLines": data[i].recipe.ingredientLines,
                            "calories": data[i].recipe.calories,
                            "totalTime": data[i].recipe.totalTime,
                            "favorited": false,
                            "caloriesPer" : parseInt(data[i].recipe.calories/data[i].recipe.yield),
                            "minutes": minutes,
                            "hours": hours
                        };

                        // TODO
                        // check to see if the meal is already a favorited meal
                        // if it is, object.favorited = true;
                        for (var j = 0; j < result.length; j++){
                            if (object.url === result[j].Meal.recipeURL) {
                                object.favorited = true;
                                break;
                            }
                        }

                        meals.push(object);
                    }

                    // console.log(meals);

                    res.render("form", {
                        user: req.user,
                        meals: meals
                    });

                });
            } else {

                for (var i = 0; i < data.length; i ++){
                    var hours = Math.floor(data[i].recipe.totalTime / 60);
                    var minutes = data[i].recipe.totalTime % 60;

                    var object = {
                        "image": data[i].recipe.image,
                        "label": data[i].recipe.label,
                        "url": data[i].recipe.url,
                        "yield": data[i].recipe.yield,
                        "dietLabels": data[i].recipe.dietLabels,
                        "healthLabels": data[i].recipe.healthLabels,
                        "ingredientLines": data[i].recipe.ingredientLines,
                        "calories": data[i].recipe.calories,
                        "totalTime": data[i].recipe.totalTime,
                        "favorited": false,
                        "caloriesPer" : parseInt(data[i].recipe.calories/data[i].recipe.yield),
                        "minutes": minutes,
                        "hours": hours
                    };

                    meals.push(object);
                }

                res.render("form", {
                    user: req.user,
                    meals: meals
                });
            }

        }).catch(function(error) {
            if (error.response) {
                // console.log(error.response.data);
                console.log(error.response.status);
                // console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log("Error", error.message);
            }
            // console.log(error.config);
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
            // console.log(recipeList);
            var recipes = [];
            for (var i = 0; i < recipeList.length; i++){

                var recipe = {
                    recipeName: recipeList[i].name,
                    imageLink: recipeList[i].image,
                    recipeLink: recipeList[i].recipeURL
                };

                recipes.push(recipe);
            }
            // console.log(recipes);

            res.render("favorites", {
                user: req.user.username,
                recipes: recipes
            });

        });
        
});

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
        // console.log(results);
        var scheduledMeals = [];

        for(var i = 0; i < results.length; i++){
            
            var formatDate = moment(results[i].date).format("dddd");

            var data = {
                id: results[i].id,
                MealId: results[i].MealId,
                formatDate: formatDate,
                title: results[i].Meal.name,
                url: results[i].Meal.recipeURL,
                image: results[i].Meal.image
            };
            scheduledMeals.push(data);
        }
        // console.log(scheduledMeals);

        res.render("schedule", {scheduledMeal:  scheduledMeals, user: req.user});
    });

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

router.get("/members", isAuthenticated, function(req, res) {
    console.log("reaching member page");
    res.render("members", {user: req.user.username});

});

// Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});

module.exports = router;