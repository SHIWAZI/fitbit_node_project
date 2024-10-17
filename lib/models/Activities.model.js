module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('categories',{categoryId:{ type: DataTypes.STRING}});
    const  UserActivities = sequelize.define('user_activities',{activityId:{ type: DataTypes.STRING}});
   
    const Activities = sequelize.define(
      "activities",
      {
        name: {
          type: DataTypes.STRING,
        },
        categoryId: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
        },
        status: {
            type: DataTypes.TINYINT(1),
        },
      },
      { tableName: "activities" }
    );
    Activities.hasOne(Category);
    Activities.hasMany(UserActivities);
    
    return Activities;
  };
  