const express = require("express");
const CategoryController = require("./categories.controller");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/get", verifyToken, CategoryController.getCategory);

module.exports = router;
