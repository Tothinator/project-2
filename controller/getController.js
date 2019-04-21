var express = require("express");
var db = require("../models");
var moment = require("moment");

var router = express.Router();

//GET ROUTES======================================================================================================

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

//Getting calendar data from Day Table
router.get("/api/calendar", function(req, res){
    if (!req.user) {
        return res.redirect("/");
    }
    console.log("hello");

    db.Day.findAll({
        attributes: ["id", "date"],
        where: {UserId: req.user.id},
        include: [{
            model: db.Meal,
            attributes: ["name", "image","recipeURL"],
        }]
    }).then(function(calendarResults){
        var events = [];

        for (var i = 0; i < calendarResults.length; i++) {

            event = {
                id: calendarResults[i].dataValues.id,
                date: calendarResults[i].dataValues.date,
                title: calendarResults[i].Meal.name,
                url: calendarResults[i].Meal.recipeURL
            };
            events.push(event);
        }
        // console.log(events);

        res.send(events);
    });
});

module.exports = router;