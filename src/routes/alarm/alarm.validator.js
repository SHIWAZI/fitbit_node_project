const { Joi } = require("../../utils/validators");

const addAlarm = Joi.object().keys({
  description: Joi.string().trim().required(),
  time: Joi.required(),
  date: Joi.required(),
  timezone: Joi.required(),
});
const updateAlarm = Joi.object().keys({
  id: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  time: Joi.required(),
  date: Joi.required(),
  timezone: Joi.required(),
});
const updateStatusAlarm = Joi.object().keys({
  id: Joi.string().trim().required(),
  status: Joi.required(),
});
module.exports = { addAlarm, updateAlarm, updateStatusAlarm };
