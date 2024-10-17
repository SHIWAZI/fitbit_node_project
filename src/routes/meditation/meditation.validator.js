const { Joi } = require("../../utils/validators");

const dashboard = Joi.object().keys({
  module_type: Joi.required(),
});

const subcategoryDetail = Joi.object().keys({
  subCatId: Joi.required(),
});

const categoryDetail = Joi.object().keys({
  catId: Joi.required(),
});

const meditationEnrolment = Joi.object().keys({
  meditationMediaId: Joi.required(),
});

const programDetail = Joi.object().keys({
  meditationMediaId: Joi.required(),
});

const dayDetail = Joi.object().keys({
  meditationProgramSchedulerId: Joi.required(),
});

const completeDayTask = Joi.object().keys({
  meditationProgramSchedulerCategoryTaskId: Joi.required(),
});

const leaveProgram = Joi.object().keys({
  meditationMediaId: Joi.required(),
});

module.exports = { dashboard, subcategoryDetail, categoryDetail, meditationEnrolment, programDetail, dayDetail, completeDayTask, leaveProgram };
