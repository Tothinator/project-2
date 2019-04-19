var bcrypt = require("bcrypt-nodejs");

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    User.associate = function(models) {
        // Associating Users with Meals through Junction Tables Faves and Days
        models.User.belongsToMany(models.Meal, {through: models.Favorite} );

        // models.User.belongsToMany(models.Meal, {through: models.Day} );
        models.User.hasMany(models.Day);
    };

    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };   

    User.addHook("beforeCreate", function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    });

    return User;
};
