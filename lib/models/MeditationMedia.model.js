module.exports = (sequelize, DataTypes) => {
  // const  MeditationCategory = sequelize.define('meditation_category',{meditationCategoryId:{ type: DataTypes.INTEGER}});
  // const Activities = sequelize.define("activities", {
  //   categoryId: { type: DataTypes.STRING },
  // });

  const MeditationMedia = sequelize.define(
    "meditation_media",
    {
      meditationCategoryId: {
        type: DataTypes.INTEGER,
      },
      meditationSubCategoryId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      tagline: {
        type: DataTypes.STRING,
      },
      content_category: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      thumbnail_image: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
        get: function () {
          const rawValue = this.getDataValue("thumbnail_image");
          // const imageUrl = rawValue ? rawValue : "/img/no-images/img.png";
          // return process.env.BASE_URL + imageUrl;
          return rawValue;
        },
      },
      content_category_icon: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
        get: function () {
          const rawValue = this.getDataValue("content_category_icon");
          // const imageUrl = rawValue ? rawValue : "/img/no-images/img.png";
          return rawValue;
        },
      },
      duration: {
        type: DataTypes.STRING,
      },
      days: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM('audio', 'video'),
        defaultValue: 'audio',
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
      enrollmentStatus: DataTypes.VIRTUAL,
      totalActivity: DataTypes.VIRTUAL,
      totalCompletedActivity: DataTypes.VIRTUAL,
      programCompletionDate: DataTypes.VIRTUAL,
      daysScheduler: DataTypes.VIRTUAL,
    },
    { tableName: "meditation_media" }
  );
  // MeditationCategory.hasMany(Activities);
  // MeditationMedia.belongsTo(MeditationCategory);
  MeditationMedia.selectFields = function () {
    return ["id", "meditationCategoryId", "meditationSubCategoryId", "title", "tagline", "content_category", "content_category_icon", "description", "thumbnail_image", "duration", "days", "type", "media", "is_potrait", "status"];
  };
  return MeditationMedia;
};
