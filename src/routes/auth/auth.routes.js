const express = require("express");
const AuthController = require("./auth.controller");
const validator = require("./auth.validator");
const { validate } = require("../../utils/validators");
var { verifyToken } = require("../../utils/authentication");

const router = express.Router();

router.post("/register", validate(validator.signup), AuthController.sendOTP);
router.post(
  "/verify-otp",
  validate(validator.verifyotp),
  AuthController.verifyOtp
);
router.post(
  "/resend-otp",
  validate(validator.signup),
  AuthController.reSendOTP
);
router.post("/user-details", verifyToken, AuthController.getUserDetails);
router.get("/user-avatars", AuthController.getUserAvatars);
router.post("/update-user-details", verifyToken, AuthController.updateUserDetails);
router.get("/get-streaks", verifyToken, AuthController.getStreaks);
router.get("/delete-user", verifyToken, AuthController.deleteUser);

router.post("/logout", verifyToken, AuthController.logout);
router.post(
  "/social-login",
  validate(validator.socialValidator),
  AuthController.socialLogin
);
module.exports = router;
