import Group from "./Group.js";
import Customer from "./Customer.js";
import Hands from "./Hands.js";
import CustomerBeedingEntry from "./CustomerBeedingEntry.js";
import User from "./User.js";
import BalSheet from "./BalSheet.js";
import { Op,Sequelize } from "sequelize";
import sequelize from "../utils/database.js";

// Define associations
const CustomerGroup = sequelize.define("CustomerGroup");
const GroupHand = sequelize.define("GroupHand");

// Define associations
Customer.belongsToMany(Group, { through: CustomerGroup, as: "Groups" });
Group.belongsToMany(Customer, { through: CustomerGroup, as: "Customers" });
Group.belongsToMany(Hands, { through: GroupHand, as: "Hands" });
Hands.belongsToMany(Group, { through: GroupHand, as: "Groups" });

Customer.hasMany(CustomerBeedingEntry, {
  foreignKey: "CustomerId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Hands.hasMany(CustomerBeedingEntry, {
  foreignKey: "HandId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

CustomerBeedingEntry.belongsTo(Group, {
  foreignKey: "GroupId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
CustomerBeedingEntry.belongsTo(Hands, {
  foreignKey: "HandId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
CustomerBeedingEntry.belongsTo(Customer, {
  foreignKey: "CustomerId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
// balSheet

BalSheet.belongsTo(CustomerBeedingEntry, {
  foreignKey: "CustomerBeedingEntryId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export {
  CustomerGroup,
  Group,
  GroupHand,
  Customer,
  sequelize,
  Sequelize,
  User,
  Hands,
  BalSheet,
  CustomerBeedingEntry,
  Op,
};
