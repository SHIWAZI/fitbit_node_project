module.exports = function (sequelize, DataTypes) {
  const Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(25),
        defaultValue: null,
      },
      mobile_number: {
        type: DataTypes.STRING(11),
        defaultValue: null,
      },
      email: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      email_verified: {
        type: DataTypes.TINYINT(1),
      },
      role_id: {
        type: DataTypes.INTEGER(11),
      },
      email_verified_at: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      password: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      remember_token: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      status: {
        type: DataTypes.TINYINT(2),
        defaultValue: 0,
      },
      wellness_score: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      previous_wellness_score: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING(255),
        defaultValue: "",
        allowNull: false,
        get: function () {
          const rawValue = this.getDataValue("image");
          const imageUrl = rawValue ? rawValue : "/img/no-images/img.png";
          return process.env.BASE_URL + imageUrl;
        },
      },
      userAvatarId: {
        type: DataTypes.INTEGER(11),
        defaultValue: null,
      },
      last_login_at: {
        type: DataTypes.DATE,
      },
      last_login_ip: {
        type: DataTypes.STRING(255),
      },
      notification_status: {
        type: DataTypes.TINYINT(2),
      },
      admin_approved: {
        type: DataTypes.INTEGER(11),
      },

      device_id: {
        type: DataTypes.STRING(255),
      },
      device_token: {
        type: DataTypes.STRING(255),
      },
      country_code: {
        type: DataTypes.STRING(255),
      },
      token: {
        type: DataTypes.TEXT,
      },
      social_id: {
        type: DataTypes.TEXT,
      },
      social_type: {
        type: DataTypes.TEXT,
      },
      device_type: {
        type: DataTypes.STRING(255),
      },
      daily_wellness_goal: {
        type: DataTypes.INTEGER(11),
        defaultValue: 1,
      },
      today_wellness_goal: {
        type: DataTypes.INTEGER(11),
        defaultValue: 1,
      },
      current_streaks: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      highest_streaks: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },

      last_highest_streaks_date: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      last_update_streaks: {
        type: DataTypes.DATE,
      },
      previous_update_streaks: {
        type: DataTypes.DATE,
      },
      question_meta_data: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      onboarding_step: {
        type: DataTypes.TEXT,
        defaultValue: '0',
      },
      yesterday_winner_hide: {
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
      is_new_user: DataTypes.VIRTUAL,
      current_level: DataTypes.VIRTUAL,
    },
    { tableName: "users" }
  );
  Users.selectFields = function () {
    return [
      "id",
      "name",
      "email",
      "mobile_number",
      "email_verified",
      "status",
      "image",
      "token",
      "daily_wellness_goal",
      "wellness_score",
      "userAvatarId",
      "current_streaks",
      "highest_streaks",
      "question_meta_data",
      "last_highest_streaks_date",
      "last_update_streaks",
      "previous_update_streaks",
      "yesterday_winner_hide",
      "onboarding_step",
      "previous_wellness_score",
      "today_wellness_goal"
    ];
  };
  return Users;
};
