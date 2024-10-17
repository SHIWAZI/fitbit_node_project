module.exports = (sequelize, DataTypes) => {
	const UserOTP = sequelize.define('userOTPs', {
	  email_mobile: {
		type: DataTypes.STRING
	  },
	  otp:{
          type: DataTypes.DOUBLE
      },
	}, { tableName: 'userOTPs' });
	
	return UserOTP;
}