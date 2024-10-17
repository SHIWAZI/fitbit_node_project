module.exports = (sequelize, DataTypes) => {

  const CouponCards = sequelize.define(
    "coupon_cards",
    {
      product_name: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      amount: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      reference_id:{
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      expiry_date:{
        type: DataTypes.DATE,
        defaultValue: null,
      },
      gift_card_code:{
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      term_condition:{
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      currency_code:{
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      status:{
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
      },
    },
    { tableName: "coupon_cards" }
  );
  return CouponCards;
};
