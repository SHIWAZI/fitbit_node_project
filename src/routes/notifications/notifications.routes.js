const express = require("express");
const NotificationsController = require("./notifications.controller");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/get", verifyToken, NotificationsController.getNotifications);

router.post("/delete", verifyToken, NotificationsController.deleteNotifications);

router.post("/read-status",verifyToken,NotificationsController.readStatusNotifications);

module.exports = router;
