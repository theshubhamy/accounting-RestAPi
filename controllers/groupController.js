import {
  Group,
  Customer,
  Hands,
  CustomerGroup,
  GroupHand,
} from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";

export const createGroup = async (req, res, next) => {
  try {
    const {
      groupName,
      groupDate,
      beedingdate,
      noofhands,
      taken_loan,
      customerInfo,
      handsInfo,
    } = req.body;

    // Create the group
    const group = await Group.create({
      groupName,
      groupDate,
      beedingdate,
      noofhands,
      taken_loan,
      isActive: true,
    });

    // Add customers to the group
    if (customerInfo && customerInfo.length > 0) {
      const customers = await Customer.findAll({ where: { id: customerInfo } });
      await group.addCustomers(customers);
    }

    // Add hands to the group
    if (handsInfo && handsInfo.length > 0) {
      const hands = await Hands.findAll({ where: { id: handsInfo } });
      await group.addHands(hands);
    }

    res.status(201).json({ message: "Group created successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const updateGroup = async (req, res, next) => {
  try {
    const {
      id,
      groupName,
      groupDate,
      beedingdate,
      noofhands,
      taken_loan,
      customerInfo,
      handsInfo,
    } = req.body;

    // Find the group to update
    const group = await Group.findByPk(id);
 // Find the group to update

 if (!group) {
   const error = new Error('Group not found');
   error.statusCode = 404;
   throw error;
 }

 // Update the group properties if fields are not empty
 if (groupName) {
   group.groupName = req.body.groupName;
 }

 if (groupDate) {
   group.groupDate = req.body.groupDate;
 }

 if (beedingdate) {
   group.beedingdate = req.body.beedingdate;
 }

 if (noofhands) {
   group.noofhands = req.body.noofhands;
 }

 if (taken_loan) {
   group.taken_loan = req.body.taken_loan;
 }

 await group.save();

 // Update group's customers if customerInfo field is not empty
 if (customerInfo && customerInfo.length > 0) {
   const customers = await Customer.findAll({ where: { id: req.body.customerInfo } });
   await group.setCustomers(customers);
 }

 // Update group's hands if handsInfo field is not empty
 if (handsInfo && handsInfo.length > 0) {
   const hands = await Hands.findAll({ where: { id: req.body.handsInfo } });
   await group.setHands(hands);
 }

    res.status(200).json({ message: "Group updated successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const listGroups = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: Customer,
          as: "Customers",
          attributes: ["id", "name", "phone"],
          through: { attributes: [] }, // Exclude junction table attributes
        },
        {
          model: Hands,
          as: "Hands",
          attributes: ["id", "handnumber"],
          through: { attributes: [] }, // Exclude junction table attributes
        },
      ],
    });
    res.status(200).json(groups);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
