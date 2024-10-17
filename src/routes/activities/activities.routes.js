const express = require("express");
const ActivitiesController = require("./activities.controller");

const validator = require("./activities.validator");
const { validate } = require("../../utils/validators");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/get-user", verifyToken, ActivitiesController.getUserActivities);
router.post("/get", verifyToken, ActivitiesController.getActivities);

router.post(
  "/add",
  verifyToken,
  validate(validator.addActivities),
  ActivitiesController.addActivities
);
router.post("/delete", verifyToken, ActivitiesController.deleteActivities);
router.post(
  "/update",
  verifyToken,
  validate(validator.updateActivities),
  ActivitiesController.updateActivities
);
router.post(
  "/status",
  verifyToken,
  validate(validator.updateStatusActivities),
  ActivitiesController.updateStatusActivities
);

router.get(
  "/wellness_score",
  verifyToken,
  ActivitiesController.getWellnessScore
);

router.get("/reward-winner", verifyToken, ActivitiesController.getRewardWinner);
router.get(
  "/reward-winner-notification",
  ActivitiesController.rewardWinnerNotification
);
module.exports = router;
