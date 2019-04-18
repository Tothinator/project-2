module.exports = function(sequelize, DataTypes) {
    
    var Day = sequelize.define("Day", {

        startDate: {
            type: DataTypes.DATETIME,
            allowNull: false
        },

        endDate: {
            type: DataTypes.DATETIME,
            allowNull: false
        }
    });

    Day.associate = function(models){
        models.Day.belongsTo(models.User);
        models.Day.belongsTo(models.Meal);
    };


    return Day;
};