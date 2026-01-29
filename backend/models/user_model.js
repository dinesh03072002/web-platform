const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  remember_token: {
    type: DataTypes.STRING,
    allowNull: true
  },

  role: {                       
    type: DataTypes.ENUM("ADMIN", "USER"),
    allowNull: false,
    defaultValue: "ADMIN"
  },

  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "organizations",
      key: "id"
    }
  }
});

module.exports = User;
