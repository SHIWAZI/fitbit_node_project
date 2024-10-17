module.exports = (sequelize, DataTypes) => {
  const Alarms = sequelize.define(
    "alarms",
    {
      description: {
        type: DataTypes.STRING,
      },
      time: {
        type: DataTypes.TEXT,
      },
      date: {
        type: DataTypes.TEXT,
      },
      timezone: {
        type: DataTypes.TEXT,
      },
      datetimeUTC: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
    },
    { tableName: "alarms" }
  );

  return Alarms;
};
