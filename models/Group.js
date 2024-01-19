import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const Group = sequelize.define("Group", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  groupDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  noofhands: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taken_loan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  beedingdate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

export default Group;
