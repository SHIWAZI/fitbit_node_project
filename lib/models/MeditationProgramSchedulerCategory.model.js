module.exports = (sequelize, DataTypes) => {
  const MeditationProgramSchedulerCategory = sequelize.define(
    "meditation_program_scheduler_category",
    {
      title: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "meditation_program_scheduler_category" }
  );
  return MeditationProgramSchedulerCategory;
};
