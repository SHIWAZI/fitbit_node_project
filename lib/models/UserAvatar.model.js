module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    userAvatarId: { type: DataTypes.INTEGER(11) },
  });

  const UserAvatar = sequelize.define(
    "user_avatars",
    {
      image: {
        type: DataTypes.STRING,
        get: function () {
          const rawValue = this.getDataValue("image");
          return rawValue
            ? process.env.BASE_URL + rawValue
            : "/img/no-images/slider.png";
        },
      },
      status: {
        type: DataTypes.TINYINT(2),
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW(0),
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW(0),
        field: "updated_at",
      },
    },
    { tableName: "user_avatars" }
  );
  UserAvatar.hasOne(User);
  return UserAvatar;
};
