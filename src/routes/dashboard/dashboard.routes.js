const express = require("express");
const DashboardController = require("./dashboard.controller");

var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.get("/get", verifyToken, DashboardController.get);


module.exports = router;
