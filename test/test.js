var db = require("../models");
db.sequelize.sync().then(function(){
    db.User.findOne({
        where: {id: 5},
        include: [{
            model: db.Meal,
            through: { 
                model: db.Favorite
            }
        }]
    })
        .then(function(results){
            //console.log(results);
            //Pull data from database
            console.log(results.Meals);
            // results.forEach(r => console.log(r.Meal.dataValues.name));
        });
});