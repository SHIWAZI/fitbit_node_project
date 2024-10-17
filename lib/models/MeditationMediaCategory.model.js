module.exports = (sequelize, DataTypes) => {
  const media = sequelize.define('meditation_media', {as: 'media', foreignKey : 'id'});

  const MeditationMediaCategory = sequelize.define(
    "meditation_media_category",
    {
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      meditationCategoryId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "meditation_media_category" }
  );

  MeditationMediaCategory.hasMany(media);
  MeditationMediaCategory.selectFields = function () {
    return ["id", "meditationMediaId", "meditationCategoryId", "status"];
  };
  return MeditationMediaCategory;
};
