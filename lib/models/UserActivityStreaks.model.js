module.exports = (sequelize, DataTypes) => {
  const  User = sequelize.define('users',{userId:{ type: DataTypes.INTEGER(11)}});
 
  const UserActivityStreaks = sequelize.define(
    "user_activity_streaks",
    {
      userActivityId:{
        type: DataTypes.INTEGER(11),
      },
      userId: {
        type: DataTypes.INTEGER(11),
      },
      dateTime: {
        type: DataTypes.TEXT,
      },
      completeActivity:{
        type:DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      daily_wellness_goal:{
        type:DataTypes.INTEGER(11),
        defaultValue: null,
      }
    },
    { tableName: "user_activity_streaks" }
  );
  UserActivityStreaks.belongsTo(User);
  return UserActivityStreaks;
};
