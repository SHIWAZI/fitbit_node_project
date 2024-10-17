module.exports = (sequelize, DataTypes) => {
  const UserMeditationProgramTaskStatus = sequelize.define(
    "user_meditation_program_task_status",
    {
      meditationProgramSchedulerCategoryTaskId: {
        type: DataTypes.INTEGER,
      },
      meditationProgramSchedulerId: {
        type: DataTypes.INTEGER,
      },
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },      
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "user_meditation_program_task_status" }
  );
  return UserMeditationProgramTaskStatus;
};
