module.exports = (sequelize, DataTypes) => {
  const  User = sequelize.define('users',{userId:{ type: DataTypes.STRING}});
 
  const RewardWinners = sequelize.define(
    "reward_winners",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      couponCardId: {
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "reward_winners" }
  );
  RewardWinners.belongsTo(User);
  return RewardWinners;
};
