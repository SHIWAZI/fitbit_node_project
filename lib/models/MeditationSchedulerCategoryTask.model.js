module.exports = (sequelize, DataTypes) => {
  const MeditationSchedulerCategoryTask = sequelize.define(
    "meditation_scheduler_category_task",
    {
      meditationProgramSchedulerCategoryId: {
        type: DataTypes.INTEGER,
      },
      meditationProgramSchedulerId: {
        type: DataTypes.INTEGER,
      },
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      scheduler_category: {
        type: DataTypes.ENUM('morning','lunch','night'),
        defaultValue: null,
      },
      title: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      content_category: {
        type: DataTypes.STRING,
      },
      content_category_icon: {
        type: DataTypes.TEXT,
        get: function () {
          const rawValue = this.getDataValue("content_category_icon");
          return rawValue;
          // return rawValue ? process.env.BASE_URL + rawValue : "/img/no-images/slider.png";
        },
      },
      image: {
        type: DataTypes.TEXT,
        get: function () {
          const rawValue = this.getDataValue("image");
          return rawValue;
          // return rawValue
          //   ? process.env.BASE_URL + rawValue
          //   : "/img/no-images/slider.png";
        },
      },
      duration: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM('audio', 'video'),
        defaultValue: '',
      },
      media: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
        get: function () {
          const rawValue = this.getDataValue("media");
          const fileType = this.getDataValue("type");
          var mediaUrl = '';

          if (fileType == 'audio') {
            // mediaUrl = rawValue ? process.env.BASE_URL + rawValue : "";
            mediaUrl = rawValue;

          } else {
            mediaUrl = rawValue;
          }
          return mediaUrl;
        },
      },
      is_potrait: {
        type: DataTypes.TINYINT(0),
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
      isTaskCompleted: DataTypes.VIRTUAL,
    },
    { tableName: "meditation_scheduler_category_task" }
  );
  return MeditationSchedulerCategoryTask;
};
