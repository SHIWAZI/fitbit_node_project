module.exports = (sequelize, DataTypes) => {
  const WellnessScore = sequelize.define(
    "wellness_score",
    {
      title: {
        type: DataTypes.STRING,
      },
      start_point: {
        type: DataTypes.INTEGER,
      },
      end_point: {
        type: DataTypes.INTEGER,
      },
      image: {
        type: DataTypes.TEXT,
        get: function () {
          const rawValue = this.getDataValue("image");
          return rawValue
            ? process.env.BASE_URL + rawValue
            : "/img/no-images/slider.png";
        },
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "wellness_score" }
  );
  return WellnessScore;
};
