const express = require("express");
const AlarmController = require("./alarm.controller");

const validator = require("./alarm.validator");
const { validate } = require("../../utils/validators");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/get", verifyToken, AlarmController.getAlarm);
router.post(
  "/add",
  verifyToken,
  validate(validator.addAlarm),
  AlarmController.addAlarm
);
router.post("/delete", verifyToken, AlarmController.deleteAlarm);
router.post(
  "/update",
  verifyToken,
  validate(validator.updateAlarm),
  AlarmController.updateAlarm
);
router.post(
  "/status",
  verifyToken,
  validate(validator.updateStatusAlarm),
  AlarmController.updateStatusAlarm
);

module.exports = router;
