module.exports = (sequelize, DataTypes) => {
  const Quotes = sequelize.define(
    "quotes",
    {
      author_name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.TINYINT(1),
      },
    },
    { tableName: "quotes" }
  );
  Quotes.selectFields = function () {
    return ["id", "author_name", "status", "description"];
  };
  return Quotes;
};
