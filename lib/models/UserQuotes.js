module.exports = (sequelize, DataTypes) => {
    const  Quotes = sequelize.define('quotes',{quoteId:{ type: DataTypes.STRING}});
 
  const UserQuotes = sequelize.define(
    "user_quotes",
    {
      userId: {
        type: DataTypes.STRING,
      },
      quoteId: {
        type: DataTypes.STRING,
      },
    },
    { tableName: "user_quotes" }
  );
  UserQuotes.belongsTo(Quotes);
  return UserQuotes;
};
