const { Joi } = require("../../utils/validators");

const addActivities = Joi.object().keys({
  activitiesId: Joi.string().optional().allow(""),
  name: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
  time: Joi.required(),
  date: Joi.required(),
  timezone: Joi.required(),
  weeks_slug: Joi.string().optional().allow(""),
  weekdays: Joi.string().optional().allow(""),
  reminder: Joi.string().optional().allow(""),
  repeat: Joi.string().optional().allow(""),
  schedule: Joi.string().optional().allow(""),
});
const updateActivities = Joi.object().keys({
  id: Joi.string().trim().required(),
  activitiesId: Joi.string().optional().allow(""),
  name: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
  time: Joi.required(),
  date: Joi.required(),
  timezone: Joi.required(),
  weeks_slug: Joi.string().optional().allow(""),
  weekdays: Joi.string().optional().allow(""),
  reminder: Joi.string().optional().allow(""),
  repeat: Joi.string().optional().allow(""),
  schedule: Joi.string().optional().allow(""),
});
const updateStatusActivities = Joi.object().keys({
  id: Joi.string().trim().optional().allow(""),
  userActivitiesId: Joi.string().trim().required(),
  status: Joi.required(),
  date: Joi.string().optional().allow(""),
});
module.exports = { addActivities, updateActivities, updateStatusActivities };
