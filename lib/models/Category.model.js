module.exports = (sequelize, DataTypes) => {
  const Activities = sequelize.define("activities", {
    categoryId: { type: DataTypes.STRING },
  });

  const Categories = sequelize.define(
    "categories",
    {
      category_name: {
        type: DataTypes.STRING,
      },
      category_image: {
        type: DataTypes.TEXT,
        get: function () {
          const rawValue = this.getDataValue("category_image");
          return rawValue
            ? process.env.BASE_URL + rawValue
            : "/img/no-images/slider.png";
        },
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "categories" }
  );
  Categories.hasMany(Activities);
  Categories.selectFields = function () {
    return ["id", "category_name", "category_image", "status"];
  };
  return Categories;
};
