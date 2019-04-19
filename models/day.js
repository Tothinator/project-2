module.exports = function(sequelize, DataTypes) {
    
    var Day = sequelize.define("Day", {

        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

    });

    Day.associate = function(models){
        models.Day.belongsTo(models.User);
        models.Day.belongsTo(models.Meal);
    };


    return Day;
};