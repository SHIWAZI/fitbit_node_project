module.exports = (sequelize, DataTypes) => {
  const MeditationProgramScheduler = sequelize.define(
    "meditation_program_scheduler",
    {
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      duration: {
        type: DataTypes.STRING,
      },
      days: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
      totalActivity: DataTypes.VIRTUAL,
      totalCompletedActivity: DataTypes.VIRTUAL,
    },
    { tableName: "meditation_program_scheduler" }
  );
  return MeditationProgramScheduler;
};
