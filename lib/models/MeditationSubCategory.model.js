module.exports = (sequelize, DataTypes) => {
  // const  MeditationCategory = sequelize.define('meditation_category',{meditationCategoryId:{ type: DataTypes.INTEGER}});
  // const Activities = sequelize.define("activities", {
  //   categoryId: { type: DataTypes.STRING },
  // });

  const MeditationSubCategory = sequelize.define(
    "meditation_sub_category",
    {
      meditationCategoryId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      image: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
        get: function () {
          const rawValue = this.getDataValue("image");
          return rawValue;
          // const imageUrl = rawValue ? rawValue : "/img/no-images/img.png";
          // return process.env.BASE_URL + imageUrl;
        },
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "meditation_sub_category" }
  );
  // MeditationCategory.hasMany(Activities);
  // MeditationSubCategory.belongsTo(MeditationCategory);
  MeditationSubCategory.selectFields = function () {
    return ["id", "meditationCategoryId", "title", "description", "image", "status"];
  };
  return MeditationSubCategory;
};
