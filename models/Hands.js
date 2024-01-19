import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const Hands = sequelize.define("Hands", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  handnumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remaining_now: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export default Hands;
