module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define("notifications", {
    user_type: {
      type: DataTypes.STRING,
    },
    from_id: {
      type: DataTypes.STRING,
    },
    to_id: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    table_name: {
      type: DataTypes.STRING,
    },
    table_id: {
      type: DataTypes.STRING,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    is_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    sec: DataTypes.VIRTUAL,
  });
  Notifications.selectFields = function () {
    return ["id", "title", "description", "table_id", "is_status", "is_read"];
  };
  return Notifications;
};
