const { Joi } = require("../../utils/validators");

const signup = Joi.object().keys({
  email: Joi.string().trim().required(),
});

const verifyotp = Joi.object().keys({
  email: Joi.string().trim().required(),
  otp: Joi.number().required(),
  
  device_token: Joi.string().trim().optional().allow(""),
  device_type: Joi.string().trim().optional().allow(""),
});

const resend = Joi.object().keys({
  email: Joi.string().trim().required(),
});
const socialValidator = Joi.object().keys({
  email: Joi.string().trim().required(),
  name: Joi.string().optional().allow(""),
  social_type: Joi.string().required(),
  social_id: Joi.string().required(),
  
  device_token: Joi.string().trim().optional().allow(""),
  device_type: Joi.string().trim().optional().allow(""),
});

module.exports = { signup, verifyotp, resend, socialValidator };
