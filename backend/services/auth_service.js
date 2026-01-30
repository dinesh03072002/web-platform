const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const db = require("../models");
const sendMail = require("../config/mail");

const JWT_SECRET = process.env.JWT_SECRET;

//REGISTER 
exports.register = async (data) => {
  const {
    name,
    email,
    contact,
    password,
    confirmPassword,
    organization_name
  } = data;

  if (!name || !email || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Password and confirm password do not match");
  }

  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let organizationId = null;

  if (organization_name && organization_name.trim() !== "") {
    const organization = await db.Organization.create({
      name: organization_name
    });
    organizationId = organization.id;
  }

  const user = await db.User.create({
    name,
    email,
    contact,
    password: hashedPassword,
    is_verified: false,
    organization_id: organizationId
  });

  // Create email verification token
  const token = uuidv4();

  await db.UserToken.create({
    user_id: user.id,
    token,
    type: "VERIFY_EMAIL",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });

  const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  await sendMail(
    email,
    "Verify your email",
    `
Hi ${name},

Thank you for registering.

Please verify your email by clicking the link below:
${verifyLink}

If you did not create this account, please ignore this email.
    `
  );

  return "Verification email sent";
};

// VERIFY EMAIL 
exports.verifyEmail = async (token) => {
  const record = await db.UserToken.findOne({
    where: { token, type: "VERIFY_EMAIL" }
  });

  if (!record) {
    throw new Error("Invalid verification token");
  }

  if (record.expires_at < new Date()) {
    throw new Error("Verification token expired");
  }

  await db.User.update(
    { is_verified: true },
    { where: { id: record.user_id } }
  );

  await db.UserToken.destroy({ where: { id: record.id } });

  return "Email verified successfully";
};

/* ================= LOGIN ================= */
exports.login = async (data) => {
  const { email, password, rememberMe } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.is_verified) {
    throw new Error("Email not verified");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Only admin can login here");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role   
    },
    JWT_SECRET,
    { expiresIn: rememberMe ? "7d" : "1d" }
  );

  if (rememberMe) {
    user.remember_token = token;
    await user.save();
  }

  return token;
};

// FORGOT PASSWORD 
exports.forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Email not registered");
  }

  await db.UserToken.destroy({
    where: { user_id: user.id, type: "RESET_PASSWORD" }
  });

  const token = uuidv4();

  await db.UserToken.create({
    user_id: user.id,
    token,
    type: "RESET_PASSWORD",
    expires_at: new Date(Date.now() + 15 * 60 * 1000)
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendMail(
    user.email,
    "Reset your password",
    `
Hi ${user.name},

You requested to reset your password.

Click the link below to reset it:
${resetLink}

This link will expire in 15 minutes.
If you did not request this, please ignore this email.
    `
  );

  return "Password reset link sent to your email";
};

// RESET PASSWORD 
exports.resetPassword = async (data) => {
  const { token, newPassword, confirmPassword } = data;

  if (!token || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const record = await db.UserToken.findOne({
    where: { token, type: "RESET_PASSWORD" }
  });

  if (!record) {
    throw new Error("Invalid or expired reset token");
  }

  if (record.expires_at < new Date()) {
    throw new Error("Reset token expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.User.update(
    { password: hashedPassword },
    { where: { id: record.user_id } }
  );

  await db.UserToken.destroy({ where: { id: record.id } });

  return "Password reset successfully";
};
