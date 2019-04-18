// eslint-disable-next-line no-unused-vars
module.exports = function(sequelize, DataTypes) {
    var Favorite = sequelize.define("Favorite", {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true

        },
    });

    Favorite.associate = function(models) {
        // Associating Users with Meals through Junction Tables Faves and Days
        //models.Favorite.hasMany(models.Meal);
        models.Favorite.belongsTo(models.Meal);
        models.Favorite.belongsTo(models.User);


    };


    return Favorite;
};