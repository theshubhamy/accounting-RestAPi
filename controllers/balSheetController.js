import {
  CustomerBeedingEntry,
  Group,
  Hands,
  Customer,
  BalSheet,
  Op,
} from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";

export const getBalSheetWithSearch = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    let whereClause = {};

    // Filter by customer name
    if (req.query.customerName) {
      whereClause["$CustomerBeedingEntry.Customer.name$"] = {
        [Op.like]: `%${req.query.customerName}%`,
      };
    }

    // Filter by customer phone
    if (req.query.customerPhone) {
      whereClause["$CustomerBeedingEntry.Customer.phone$"] = {
        [Op.like]: `%${req.query.customerPhone}%`,
      };
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      whereClause.createdAt = {
        [Op.between]: [req.query.startDate, req.query.endDate],
      };
    }

    // Filter by group
    if (req.query.group) {
      whereClause["$CustomerBeedingEntry.Group.groupName$"] = {
        [Op.like]: `%${req.query.group}%`,
      };
    }

    // Filter by hand
    if (req.query.hand) {
      whereClause["$CustomerBeedingEntry.Hand.handnumber$"] = {
        [Op.like]: `%${req.query.hand}%`,
      };
    }

    const balSheetEntries = await BalSheet.findAll({
      attributes: [
        "id",
        "payable_debit",
        "due_credit",
        "net_balance",
        "settle_due_date",
        "createdAt",
      ],
      include: [
        {
          model: CustomerBeedingEntry,
          include: [
            {
              model: Customer,
              attributes: ["id", "name", "phone"],
            },
            {
              model: Hands,
              attributes: ["id", "handnumber"],
            },
            {
              model: Group,
              attributes: ["id", "groupName"],
            },
          ],
        },
      ],
      where: whereClause, // Apply filters here
      order: [["createdAt", "ASC"]], // Order by entry_date in ascending order
    });

    res.status(200).json(balSheetEntries);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
