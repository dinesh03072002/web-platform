const Contact = require("../models/contact_model");
const Newsletter = require("../models/newsletter_model");
const bcrypt = require("bcryptjs");
const db = require("../models");
const { Op } = require("sequelize");


//EXISTING
exports.getAllContacts = async () => {
  return await Contact.findAll({
    order: [["createdAt", "DESC"]],
  });
};

exports.getAllSubscribers = async () => {
  return await Newsletter.findAll({
    order: [["createdAt", "DESC"]],
  });
};

//ADD USER BY ADMIN 
exports.addUserByAdmin = async (adminId, data) => {
  const admin = await db.User.findByPk(adminId);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Only admin can add users");
  }

  const {
    name,
    email,
    contact,
    password,
    organization_name,
    role
  } = data;

 /* if (!name || !email || !password) {
    throw new Error("All fields are required");
  } */
  
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  let organizationId = admin.organization_id;

  if (!organizationId) {
    if (!organization_name) {
      throw new Error("Organization name is required");
    }

    const organization = await db.Organization.create({
      name: organization_name
    });

    organizationId = organization.id;
    await admin.update({ organization_id: organizationId });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const allowedRoles = ["ADMIN", "USER"];
  const userRole = allowedRoles.includes(role) ? role : "USER";

  await db.User.create({
    name,
    email,
    contact,
    password: hashedPassword,
    role: userRole,
    is_verified: true,
    organization_id: organizationId
  });

  return "User added successfully";
};


//GET ADMIN ORGANIZATION 
exports.getAdminOrganization = async (adminId) => {
  const admin = await db.User.findByPk(adminId, {
    include: {
      model: db.Organization,
      attributes: ["id", "name"]
    }
  });

  return admin.Organization || null;
};


//GET USERS 

exports.getUsers = async (adminId) => {
  const admin = await db.User.findByPk(adminId);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Unauthorized access");
  }

  return await db.User.findAll({
  where: {
    organization_id: admin.organization_id,
    id: { [Op.ne]: adminId },
  },
  include: [
    {
      model: db.Organization,
      attributes: ["name"],
    },
  ],
  attributes: [
    "id",
    "name",
    "email",
    "contact",
    "role",
    "createdAt",
  ],
  order: [["createdAt", "DESC"]],
});
};




exports.updateUser = async (adminId, userId, data) => {
  const admin = await db.User.findByPk(adminId);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const user = await db.User.findOne({
    where: {
      id: userId,
      organization_id: admin.organization_id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { name, email, contact, password, role } = data;

  const updateData = { name, email, contact };

  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  if (role && ["ADMIN", "USER"].includes(role)) {
    updateData.role = role;
  }

  await user.update(updateData);

  return "User updated successfully";
};


