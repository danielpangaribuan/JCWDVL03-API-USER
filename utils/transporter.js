const nodemailer = require("nodemailer");

// Create transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jcwdvl02.warehouse@gmail.com",
    pass: process.env.GOOGLE_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Karena nodemailernya masih datang dari localhost, makanya supaya ga di reject maka rejectUnauthorized dibuat alse
  },
});

module.exports = transporter;
