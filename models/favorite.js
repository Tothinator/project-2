// eslint-disable-next-line no-unused-vars
module.exports = function(sequelize, DataTypes) {
    var Favorite = sequelize.define("Favorite", {

    });

    Favorite.associate = function(models) {
        // Associating Users with Meals through Junction Tables Faves and Days
        //models.Favorite.hasMany(models.Meal);
        models.Favorite.belongsTo(models.Meal);
        models.Favorite.belongsTo(models.User);
    
    
    };

    Favorite.associate = function(models) {
	    // Associating Users with Meals through Junction Tables Faves and Days
	    //models.Favorite.hasMany(models.Meal);
	    models.Favorite.belongsTo(models.Meal);
	    models.Favorite.belongsTo(models.User);


<<<<<<< HEAD
    return Favorite;
};


=======
    };


    return Favorite;
};
>>>>>>> 777d8b04e6fb08bac6c65bf60ce85f53cdf4f74e
