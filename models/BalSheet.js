import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const BalSheet = sequelize.define("balsheet", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  payable_debit: {
    type: DataTypes.STRING,
    allowNull: true,
    default: 0,
  },
  due_credit: {
    type: DataTypes.STRING,
    allowNull: true,
    default: 0,
  },
  net_balance: {
    type:  DataTypes.DECIMAL(10, 3),
    allowNull: true,
    default: 0,
  },
  settle_due_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default BalSheet;
