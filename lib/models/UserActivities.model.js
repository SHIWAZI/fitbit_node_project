module.exports = (sequelize, DataTypes) => {
  const  Activity = sequelize.define('activities',{activityId:{ type: DataTypes.STRING}});
  const  User = sequelize.define('users',{userId:{ type: DataTypes.STRING}});
  const  ActivityProgress = sequelize.define('activity_progress',{userActivityId:{ type: DataTypes.STRING}});
 
  const UserActivities = sequelize.define(
    "user_activities",
    {
      name: {
        type: DataTypes.STRING,
      },
      activityId: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      time: {
        type: DataTypes.TEXT,
      },
      date: {
        type: DataTypes.TEXT,
      },
      datetimeUTC: {
        type: DataTypes.TEXT,
      },
      weeks_slug: {
        type: DataTypes.TEXT,
      },
      weekdays: {
        type: DataTypes.TEXT,
      },
      reminder: {
        type: DataTypes.TEXT,
      },
      reminder_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      repeat_count: {
        type: DataTypes.TEXT,
      },
      repeat_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      update_repeat_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      send_notify: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      endDate: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "user_activities" }
  );
  UserActivities.belongsTo(User);
  UserActivities.belongsTo(Activity);
  UserActivities.hasMany(ActivityProgress);
  
  return UserActivities;
};
