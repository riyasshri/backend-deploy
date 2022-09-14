const nodeMailer = require("nodemailer");

const sendEmail = async (emailId, data, subject) => {
  var transporter = nodeMailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: process.env.MAILID,
      pass: process.env.MAILPASS,
    },
  });
  var mailOptions = {
    from: process.env.MAILID,
    to: emailId,
    subject: subject,
    text: data,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error.message);
    } else {
      return;
    }
  });
};

module.exports = sendEmail;
