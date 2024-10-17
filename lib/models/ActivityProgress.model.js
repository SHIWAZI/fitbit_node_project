module.exports = (sequelize, DataTypes) => {
  const ActivityProgress = sequelize.define(
    "activity_progress",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      userActivityId: {
        type: DataTypes.INTEGER,
      },
      userId:{
        type: DataTypes.INTEGER,
      },
      dateTime: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
      send_date_time: {
        type: DataTypes.TEXT,
      },
      weeks: {
        type: DataTypes.TEXT,
      },
      send_notify: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
    },
    { tableName: "activity_progress" }
  );
  return ActivityProgress;
};
