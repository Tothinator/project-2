var express = require("express");
var db = require("../models");

var router = express.Router();

//GET ROUTES======================================================================================================

router.post("/api/meals", function(req, res) {

    if (!req.user) {
        console.log("User not logged in");
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

//Route to add event to Day Table
router.post("/api/calendar/", function(req, res){
    if (!req.user) {
        return res.json({
            status: "not logged in"
        });
    }
    
    var data = req.body.data;
    // console.log(req.body.date);
    db.Meal.findOrCreate({
        where: {recipeURL: data.recipeURL},
        defaults: data
    })
        .then(function(result){
            if (!req.user) {
                return res.redirect("/");
            }
            // console.log(req.body.date);
            var meal = result[0].dataValues;
            
            db.Day.findOrCreate({
                where: {date: req.body.date,
                    MealId: meal.id},
                defaults: {
                    date: req.body.date,
                    MealId: meal.id,
                    UserId: req.user.id
                }
            }).then(function(){
                // console.log(result);
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

// router.delete("/api/favorites", function(req, res) {
// });

module.exports = router;