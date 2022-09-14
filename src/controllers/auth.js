const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const { encrypt, decrypt } = require("../lib/tokenizer");
const sendEmail = require("../lib/sendEmail");
const crypto = require("crypto");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "Incorrect password or email",
      });
    }
    const status = await bcryptjs.compare(password, user.password);
    console.log(status);
    if (!status) {
      return res.status(401).json({
        status: "failure",
        msg: "Incorrect password or email",
      });
    }
    else if (status) {
      return res.status(200).json({
        status: "success",
        user,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    const dupuser = await User.findOne({
      email: data.email,
    });
    if (!dupuser) {
      const password = data.password;
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      const user = new User({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        ethAddr: data.ethAddr,
      });
      await user.save();
      const eData = encrypt(data.email);
      const url = `${process.env.FRONTEND_URL}?token=${eData.encryptedData}&id=${eData.iv}`;
      console.log(url);
      sendEmail(
        user.email,
        `Please verify your email for further access of the applications.\nVerify using the link give below.\nURL:${url}`,
        "Verify you email id"
      );
      res.status(200).json({
        status: "success",
        msg: "email for verification sent",
      });
    } else {
      res.status(401).json({
        status: "failure",
        msg: "Email already exists",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const data = req.body;
    const email = decrypt(data);
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(401).json({
        status: "failure",
        msg: "invalid verification token",
      });
    }
    user.verified = true;
    await user.save();
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.requestreset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "Invalid email address",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    const url = `${process.env.FRONTEND_URL}/reset?token=${token}`;
    console.log(url);
    sendEmail(
      user.email,
      `You have made an request to reset your password.Please click the below click to continue.\nURL: ${url}`,
      "Reset Password"
    );
    await user.save();
    res.status(200).json({
      status: "success",
      msg: "Reset link sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
    });
    if (!user) {
      return res.status(401).json({
        status: "failure",
        msg: "Invalid reset token",
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    user.password = hashedPassword;
    const newToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = newToken;
    await user.save();
    res.status(200).json({
      status: "success",
      msg: "password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePw = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email })
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    if (!user) {
      return res.status(400).json({
        status: "failure",
        msg: "user not found"
      })
    }
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      status: "success",
      msg: "Password succesfully updated"
    })
  } catch (error) {
    next(error);
  }
}