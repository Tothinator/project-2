module.exports = function(sequelize, DataTypes) {
    
    var Day = sequelize.define("Day", {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    });

    return Day;
};