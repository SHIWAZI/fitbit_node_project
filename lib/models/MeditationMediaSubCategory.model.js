module.exports = (sequelize, DataTypes) => {

  const MeditationMediaSubCategory = sequelize.define(
    "meditation_media_subcategory",
    {
      meditationMediaId: {
        type: DataTypes.INTEGER,
      },
      meditationSubCategoryId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "meditation_media_subcategory" }
  );
  MeditationMediaSubCategory.selectFields = function () {
    return ["id", "meditationMediaId", "meditationCategoryId", "status"];
  };
  return MeditationMediaSubCategory;
};
