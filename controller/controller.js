var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var axios = require("axios");


var router = express.Router();


var APIID = process.env.APIID || "ac3e460c";
var APIKEY = process.env.RECIPEAPI || "4a8c99b69bd19aa9ecf68dd209babee8";

var APIURL = "https://api.edamam.com/search?app_id=" + APIID + "&app_key=" + APIKEY + "&from=0&to=8&q=";


//API ROUTES======================================================================================================

//Getting calendar data from Day Table
router.get("/api/calendar/", function(req, res){
    if (!req.user) {
        return res.redirect("/");
    }

    db.Day.findAll({
        attributes: ["id", "startDate", "endDate"],
        where: {UserId: req.user.id},
        include: [{
            model: db.Meal,
            attributes: ["name", "recipeURL"],
        }]
    }).then(function(calendarResults){
        res.json(calendarResults);
    });
});


router.post("/api/calendar/", function(req, res){
    // if (!req.user) {
    //     return res.redirect("/");
    // }
    
   
    var data = req.body.data;
    console.log(data.recipeURL);
    console.log(data.name);
    console.log(data.ingredients);
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
            
            db.Day.create({
                startDate: req.body.date,
                endDate: req.body.date,
                MealId: meal.id,
                UserId: req.user.id
            }).then(function(result){
                console.log(result);
                res.redirect("/form");
            });


            
        });
});


//Updating receipe to Day model
router.put("/api/calendar/", function(req, res){
    console.log(req.body);
    db.Day.update({
        startDate: req.body.start,
        endDate: req.body.end
    }, 
    { where:
             {
                 id: req.body.id
             }
    }).then(function(result){
        console.log(result);
        res.send("got it");
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

//logging in route
router.post("/api/login/", passport.authenticate("local"), function(req, res) {
    res.json("/members");
});

//signing up account route
router.post("/api/signup", function(req, res) {
    // console.log(req.body.username);
    // console.log(req.body.password);
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


router.get("/members/calendar", function(req, res){
    // console.log(req.user);
    if (!req.user) {
        return res.redirect("/");
    }

    db.Day.findAll({
        attributes: ["id", "startDate", "endDate"],
        order: ["startDate"],
        where: {UserId: req.user.id},
        include: [{
            model: db.Meal,
            attributes: ["name", "image", "recipeURL"],
        }]
    }).then(function(results){
        console.log(results);
        var scheduledMeals = [];

        for(var i = 0; i < results.length; i++){

            var data = {
                id: results[i].id,
                start: results[i].startDate,
                end: results[i].endDate,
                title: results[i].Meal.name,
                url: results[i].Meal.recipeURL,
                image: results[i].Meal.image
            };
            scheduledMeals.push(data);
        }

        res.render("calendar", {scheduledMeal:  scheduledMeals});
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


// eslint-disable-next-line no-unused-vars
router.post("/api/meals", function(req, res) {
    
    if (!req.user) {
        return res.json({
            status: "not logged in"
        });
    }
    var data = req.body.data;

    console.log(data);


    db.Meal.findOrCreate({
        where: {
            recipeURL: req.body.url
        },
        defaults: data
    }).then(function(result) {

        var meal = result[0].dataValues;

        console.log(result[0].dataValues);

        var id = meal.id;

        if (req.user === undefined) {
            res.redirect("/");
        } else if (req.body.table === "favorite") {
            // add meal to favorites for current user

            db.Favorite.create({
                UserId: req.user.id,
                MealId: id
            }).then( function () {
                res.send("Added meal " + meal.name +
                " to user's favorites");
            });

        } else if (req.body.table === "day") {
            // add meal to calendar day for current user
            res.send("Added meal " + meal.get({ plain: true }).name +
            " to user's specified date");
        } else {
            res.send("Error occured");
        }

    });

});

router.get("/form", function(req, res) {

 
    res.render("form");
    
});

router.post("/form", function(req, res) {

    console.log(req.body);
    var health = "";

    var diet = "";

    if (req.body.health !== undefined) {
        if(req.body.health.length !== 0 && typeof req.body.health === "array") {
            req.body.health.forEach(function(i) {
                health=health+"&health="+i;
            });
        } else if (req.body.health !== "") {
            health = "&health=" + req.body.health;
        }
    }

    if (req.body.diet !== "") {
        diet = "&diet=" + req.body.diet;
    }

    console.log(APIURL + req.body.food + health + diet);

    axios.get(APIURL + req.body.food + health + diet)
        .then(function(response) {
            var data = response.data.hits;
            var meals=[];

            for (var i = 0; i < data.length; i ++){

                var object = {
                    "image": data[i].recipe.image,
                    "label": data[i].recipe.label,
                    "url": data[i].recipe.url,
                    "yield": data[i].recipe.yield,
                    "dietLabels": data[i].recipe.dietLabels,
                    "healthLabels": data[i].recipe.healthLabels,
                    "ingredientLines": data[i].recipe.ingredientLines,
                    "calories": data[i].recipe.calories,
                    "totalTime": data[i].recipe.totalTime
                };
                meals.push(object);
            }

            // console.log(meals); 

            res.render("form", {meals: meals});

        }).catch(function(error) {
            if (error.response) {
                // console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log("Error", error.message);
            }
            // console.log(error.config);
        });
});

// // Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});

module.exports = router;
