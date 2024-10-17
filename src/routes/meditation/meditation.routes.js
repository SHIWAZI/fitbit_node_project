const express = require("express");
const MeditatoinController = require("./meditation.controller");
const validator = require("./meditation.validator");
const { validate } = require("../../utils/validators");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/dashboard", verifyToken, validate(validator.dashboard),MeditatoinController.dashboard);
router.post("/sub-category-detail", verifyToken, validate(validator.subcategoryDetail), MeditatoinController.subCategoryDetail);
router.post("/category-detail", verifyToken, validate(validator.categoryDetail), MeditatoinController.categoryDetail);
router.post("/meditation-enrolment", verifyToken, validate(validator.meditationEnrolment), MeditatoinController.meditationEnrolment);
router.post("/program-detail", verifyToken, validate(validator.programDetail), MeditatoinController.programDetail);
router.post("/day-detail", verifyToken, validate(validator.dayDetail), MeditatoinController.dayDetail);
router.post("/complete-day-task", verifyToken, validate(validator.completeDayTask), MeditatoinController.completeDayTask);
router.post("/leave-program", verifyToken, validate(validator.leaveProgram), MeditatoinController.leaveProgram);

module.exports = router;
