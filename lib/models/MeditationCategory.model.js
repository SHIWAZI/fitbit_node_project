module.exports = (sequelize, DataTypes) => {
  // const MeditationSubCategory = sequelize.define("meditation_sub_category", {
  //   meditationCategoryId: { type: DataTypes.INTEGER },
  // });
  // const subCategory = sequelize.define('meditation_sub_category',{meditationCategoryId:{ type: DataTypes.STRING}});
  const subCategories = sequelize.define('meditation_sub_category', {as: 'subCategories', foreignKey : 'meditationCategoryId'});
  const media = sequelize.define('meditation_media', {as: 'media', foreignKey : 'meditationCategoryId'});


  const MeditationCategory = sequelize.define(
    "meditation_category",
    {
      title: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.STRING,
      },
      module_type: {
        type: DataTypes.ENUM('meditation', 'sleep'),
        defaultValue: 'meditation',
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "meditation_category" }
  );
  MeditationCategory.hasMany(subCategories);
  MeditationCategory.hasMany(media);
  MeditationCategory.selectFields = function () {
    return ["id", "title", "description", "type", "module_type", "status"];
  };
  return MeditationCategory;
};
