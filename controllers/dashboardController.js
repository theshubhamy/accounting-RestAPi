import {
    Group,
    Hands,
    Customer,
    CustomerBeedingEntry,
    BalSheet,
  } from "../models/Index.js";
  import { validationErrorHandler } from "../middleware/validation-error-handler.js";
  
  export const dashboardStats = async (req, res, next) => {
    validationErrorHandler(req, next);
    try {
      const customerBeedingEntries = await CustomerBeedingEntry.findAll();
  
      // Calculate total payable amount and total due amount
      let totalPayableAmount = 0;
      let totalDueAmount = 0;
      customerBeedingEntries.forEach((entry) => {
        totalPayableAmount += parseFloat(entry?.payable_amount) || 0;
        totalDueAmount += parseFloat(entry?.due_amount) || 0;
      });
  
      // Get the latest BalSheet entry
      const latestBalSheet = await BalSheet.findOne({
        order: [['createdAt', 'DESC']],
      });
  
      // Calculate net balance using the latest BalSheet entry
      let netBalance = 0;
      if (latestBalSheet) {
        netBalance = latestBalSheet.net_balance;
      }
  
      // Get total counts
      const totalGroupCount = await Group.count();
      const totalCustomerCount = await Customer.count();
      const totalHandsCount = await Hands.count();
  
      // Prepare the response
      const response = {
        totalPayableAmount,
        totalDueAmount,
        netBalance,
        totalGroupCount,
        totalCustomerCount,
        totalHandsCount,
      };
  
      res.status(200).json(response);
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  