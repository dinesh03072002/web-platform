const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const Organization = sequelize.define(
    "Organization",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "organizations",
      timestamps: true,
    }
  );

  module.exports = Organization;