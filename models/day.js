module.exports = function(sequelize, DataTypes) {
    
    var Day = sequelize.define("Day", {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true

        },

        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    });

    Day.associate = function(models) {
        // Associating Users with Meals through Junction Tables Faves and Days

        models.Day.belongsTo(models.Meal);
        models.Day.belongsTo(models.User);


    };

    return Day;
};