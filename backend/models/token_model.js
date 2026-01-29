const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserToken = sequelize.define("UserToken", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  token: {
    type: DataTypes.STRING,
    allowNull: false
  },

  type: {
    type: DataTypes.STRING, 
    allowNull: false
  },

  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = UserToken;
