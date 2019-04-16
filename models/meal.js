module.exports = function(sequelize, DataTypes) {
    var Meal = sequelize.define("Meal", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
        },
        recipeURL: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        servings: {
            type: DataTypes.INTEGER
        },
        dietLabels: {
            type: DataTypes.STRING
        },
        healthLabels: {
            type: DataTypes.STRING
        },
        ingredients: {
            type: DataTypes.STRING,
            allowNull: false
        },
        calories: {
            type: DataTypes.INTEGER
        },
        time: {
            type: DataTypes.INTEGER
        }
    });

    Meal.associate = function(models) {
        // Associating Meal with Users through Junction Tables Faves and Days
        models.Meal.belongsToMany(models.User, {through: models.Favorite} );

        models.Meal.belongsToMany(models.User, {through: models.Day} );

    };

    return Meal;
};