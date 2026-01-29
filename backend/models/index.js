const sequelize = require("../config/db");


const User = require("./user_model");
const Organization = require("./organization_model");
const UserToken = require("./token_model");

// Associations
Organization.hasMany(User, {
  foreignKey: "organization_id",
});

User.belongsTo(Organization, {
  foreignKey: "organization_id",
});

module.exports = {
  sequelize,
  User,
  Organization,
  UserToken,
};
