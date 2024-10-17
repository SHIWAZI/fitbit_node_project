const express = require("express");
const QuoteController = require("./quote.controller");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/get", verifyToken, QuoteController.getQuote);

router.post("/get-user", verifyToken, QuoteController.getUserQuote);
router.post("/add-user", verifyToken, QuoteController.addUserQuotes);
router.post("/delete-user", verifyToken, QuoteController.deleteUserQuotes);

module.exports = router;
