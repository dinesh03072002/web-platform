const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async (to, subject, html) => {
  if (!to) {
    throw new Error("Email recipient is missing");
  }

  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;
