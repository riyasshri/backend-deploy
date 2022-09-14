const router = require("express").Router();
const {
  login,
  create,
  verify,
  requestreset,
  confirm,
  updatePw,
} = require("../controllers/auth");
const User = require("../models/User");
const { decrypt } = require("../lib/tokenizer");
const sendEmail = require("../lib/sendEmail");
const crypto = require("crypto");

//Create user account-->HB
router.post("/create", create);

//Login a user-->HB
router.post("/login", login);

//Verify user by email-->HB
router.post("/verify", verify);

//Verify poassword forgot request-->HB
router.post("/requestreset", requestreset);

//Confirm password reset-->HB
router.post("/confirm", confirm);

//Update password alone-->RJS
router.post("/updatepassword", updatePw);


module.exports = router;
