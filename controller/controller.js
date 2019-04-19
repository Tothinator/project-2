var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var axios = require("axios");
var moment = require("moment");


var router = express.Router();


var APIID = process.env.APIID || "d7d86c16";
var APIKEY = process.env.RECIPEAPI || "de28b35c4fbd92aecc64e7f389a73879";

var APIURL = "https://api.edamam.com/search?app_id=" + APIID + "&app_key=" + APIKEY + "&from=0&to=8";


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
            // console.log(recipes);



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


router.post("/api/meals", function(req, res) {
    
    if (!req.user) {
        return res.json({
            status: "not logged in"
        });
    }
    var data = req.body.data;

    // console.log(req.body);
    // console.log(req.body.url);
    // console.log(data);


    db.Meal.findOrCreate({
        where: {
            recipeURL: req.body.url
        },
        defaults: data
    }).then(function(result) {


        var meal = result[0].dataValues;

        // console.log(result[0].dataValues);

        var id = meal.id;


        if (req.body.table === "favorite") {
            // add meal to favorites for current user

            // TODO
            // search the Favotives table for where UserId = req.user.id & MealId = id
            // if we find something, we need to delete it
            // otherwise, create it (like below)

            db.Favorite.findOrCreate({
                where: {
                    UserId: req.user.id,
                    MealId: id
                }
            }).then( function (result) {
                console.log("favorite created: " + result[0]._options.isNewRecord);
                
                if (result[0]._options.isNewRecord) {
                    res.send("Added meal " + meal.name +
                    " to user's favorites");
                } else {
                    db.Favorite.destroy({
                        where: {
                            UserId: req.user.id,
                            MealId: id
                        }
                    }).then( function() {
                        res.send("Deleted meal " + meal.name + 
                        " from user's favorites");
                    });
                }

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
            // console.log(data[0]);

            // TODO
            // make a database query to get all the user's favorites

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
                        "favorited": false
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

// // Render 404 page for any unmatched routes
router.get("*", function(req, res) {
    res.render("404");
});

module.exports = router;
