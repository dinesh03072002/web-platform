const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
    },

    message: {
      type: DataTypes.TEXT,
    },

    source_page: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);

module.exports = Contact;
