import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const CustomerBeedingEntry = sequelize.define("CustomerBeedingEntry", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  taken_beed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  beedDate: { type: DataTypes.DATE, allowNull: false },
  remaining_beed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payable_amount: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    default: 0,
  },
  payable_debit: {
    type: DataTypes.STRING,
    allowNull: true,
    default: 0,
  },
  due_amount: {
    type: DataTypes.STRING,
    allowNull: true,
    default: 0,
  },
  due_credit: {
    type: DataTypes.STRING,
    allowNull: true,
    default: 0,
  },
  settle_due_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default CustomerBeedingEntry;
