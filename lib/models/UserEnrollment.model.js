module.exports = (sequelize, DataTypes) => {
  const UserEnrollment = sequelize.define(
    "user_enrollment",
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      enrollStartDate: {
        type: DataTypes.STRING,
      },
      enrollEndDate: {
        type: DataTypes.STRING,
      },
      programCompletionDate: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "user_enrollment" }
  );
  return UserEnrollment;
};
