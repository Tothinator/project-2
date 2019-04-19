var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var axios = require("axios");

var router = express.Router();


var APIID = process.env.APIID || "f9df3797";
var APIKEY = process.env.RECIPEAPI || "0f26dbad1499ec207c258d835d6eb351";

var APIURL = "https://api.edamam.com/search?app_id=" + APIID + "&app_key=" + APIKEY + "&from=0&to=8";


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
            console.log(results[0].Meals[0].name);
            // console.log(results[0].Meals[1].name);
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

    // console.log(req.body);
    // console.log(req.body.url);
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


        if (req.body.table === "favorite") {
            // add meal to favorites for current user

            // TODO
            // search the Favotives table for where UserId = req.user.id & MealId = id
            // if we find something, we need to delete it
            // otherwise, create it (like below)

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
    console.log(req.user);
    res.render("form", {
        user: req.user
    });

});

router.post("/form", function(req, res) {

    console.log(req.body);

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
            console.log(data[0]);

            // TODO
            // make a database query to get all the user's favorites

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
                    // "favorited": false
                };

                // TODO
                // check to see if the meal is already a favorited meal
                    // if it is, object.favorited = true;
                
                meals.push(object);
            }

            // console.log(meals); 

            res.render("form", {
                user: req.user,
                meals: meals
            });

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

router.get("/members/calendar", function(req, res) {
    console.log("here");
    if(req.user) {
        res.render("calendar", {user: req.user});
    } else {
        res.redirect("/");
    }


});
//Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});

module.exports = router;
