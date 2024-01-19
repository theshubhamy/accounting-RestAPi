import {
  Group,
  Hands,
  Customer,
  BalSheet,
  CustomerBeedingEntry,
  Op,
  sequelize,
} from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";
export const createCustomerBeedingEntry = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const {
      groupId,
      payable_amount,
      handId,
      customerId,
      beedDate,
      taken_beed,
    } = req.body;
    const group = await Group.findByPk(groupId);
    const hand = await Hands.findByPk(handId);
    const customer = await Customer.findByPk(customerId);

    if (!group || !hand || !customer) {
      // If any of the customers already exists, return an error for that customer
      const error = new Error("Invalid input data.");
      error.statusCode = 401;
      return next(error);
    }

    // Check if the same entry already exists
    const existingEntry = await CustomerBeedingEntry.findOne({
      where: {
        HandId: handId,
        CustomerId: customerId,
        GroupId: groupId,
      },
    });

    if (existingEntry) {
      const error = new Error(
        "Beeding entry already exists for this Group and Hands."
      );
      error.statusCode = 400;
      return next(error);
    }

    const dueAmount =
      (parseFloat(group.taken_loan) - parseFloat(taken_beed)) /
      parseFloat(group.noofhands);

    // Create the main beeding entry
    const beedingEntry = await CustomerBeedingEntry.create({
      taken_beed,
      payable_amount,
      beedDate,
      CustomerId: customerId,
      HandId: handId,
      GroupId: groupId,
    });

    // Fetch rest customers that belong to the same group
    const restCustomers = await Customer.findAll({
      where: {
        id: { [Op.ne]: customerId },
      },
      include: [
        {
          model: Group,
          as: "Groups",
          where: {
            id: groupId,
          },
        },
      ],
    });
    // Calculate and create beeding entries for rest customers
    const restCustomersWithDueAmount = restCustomers.map((restCustomer) => ({
      CustomerBeedingEntryId: beedingEntry.id,
      HandId: handId,
      beedDate,
      CustomerId: restCustomer.id,
      GroupId: groupId,
      due_amount: dueAmount.toFixed(3),
    }));

    // Bulk create the rest customer entries with the calculated due amount
    await CustomerBeedingEntry.bulkCreate(restCustomersWithDueAmount);

    res.status(201).json({ message: "Beeding entry successful!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const listCustomerBeedingEntry = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { groupId, handId } = req.body;

    const group = await Group.findByPk(groupId);
    const hand = await Hands.findByPk(handId);

    if (!group || !hand) {
      return res.status(404).json({ error: "Invalid input data." });
    }

    const customerBeedingEntries = await CustomerBeedingEntry.findAll({
      where: {
        groupId: groupId,
        HandId: handId,
      },
      include: [{ model: Hands }, { model: Customer }, { model: Group }],
    });

    res.status(200).json(customerBeedingEntries);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const customerBeddingTransaction = async (req, res, next) => {
  validationErrorHandler(req, next);
  const { id, due_credit, payable_debit, status, remark, settle_due_date } =
    req.body;

  try {
    const beedingEntry = await CustomerBeedingEntry.findByPk(id);
    if (!beedingEntry) {
      const error = new Error("Beeding entry not found.");
      error.statusCode = 400;
      return next(error);
    }

    if (due_credit !== undefined) {
      beedingEntry.due_amount -= parseFloat(due_credit);
      beedingEntry.due_credit = parseFloat(due_credit);
    }
    if (payable_debit !== undefined) {
      beedingEntry.payable_amount -= parseFloat(payable_debit);
      beedingEntry.payable_debit = parseFloat(payable_debit);
    }
    if (status !== undefined) {
      beedingEntry.status = status;
    }
    if (remark !== undefined) {
      beedingEntry.remark = remark;
    }
    if (settle_due_date !== undefined) {
      beedingEntry.settle_due_date = settle_due_date;
    }
    await beedingEntry.save();
    // Fetch previous net_balance from BalSheet
    const previousBalSheet = await BalSheet.findOne({
      where: {},
      order: [["createdAt", "DESC"]],
    });
    // Create or update BalSheet entry with new net_balance
    let previousNetBalance = previousBalSheet
      ? previousBalSheet.net_balance
      : 0;
    // Calculate net_balance based on previous net_balance and changes in due_credit and payable_debit
    let net_balance =
      previousNetBalance - parseFloat(payable_debit) + parseFloat(due_credit);

    // Check if there is a BalSheet entry for the given CustomerBeedingEntryId
    const existingBalSheet = await BalSheet.findOne({
      where: { CustomerBeedingEntryId: id },
    });

    if (existingBalSheet) {
      // Update existing BalSheet entry
      existingBalSheet.net_balance = net_balance;
      existingBalSheet.payable_debit = payable_debit;
      existingBalSheet.due_credit = due_credit;
      existingBalSheet.settle_due_date = settle_due_date;
      await existingBalSheet.save();
    } else {
      // Create new BalSheet entry
      await BalSheet.create({
        CustomerBeedingEntryId: id,
        net_balance,
        payable_debit: parseFloat(payable_debit),
        due_credit: parseFloat(due_credit),
        settle_due_date,
      });
    }
    res.status(200).json({ message: "Beeding entry updated successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const updateCustomerBeddingById = async (req, res, next) => {
  try {
    validationErrorHandler(req, next);

    const {
      id,
      due_credit,
      payable_debit,
      due_amount,
      payable_amount,
      status,
      remark,
      settle_due_date,
    } = req.body;

    const entryToUpdate = await CustomerBeedingEntry.findByPk(id);
    if (!entryToUpdate) {
      const error = new Error("Beeding entry not found.");
      error.statusCode = 400;
      return next(error);
    }

    const transaction = await sequelize.transaction();

    try {
      // Find the existing BalSheet entry
      const existingBalanceSheet = await BalSheet.findOne({
        where: { CustomerBeedingEntryId: id },
      });

      if (!existingBalanceSheet) {
        const error = new Error("Didn't find any record.");
        error.statusCode = 400;
        return next(error);
      }

      const previousBalSheet = await BalSheet.findOne({
        where: {
          id: { [Op.lt]: existingBalanceSheet["id"] },
        },
        order: [["id", "DESC"]],
      });

      const previousNetBalance = previousBalSheet
        ? previousBalSheet.net_balance
        : 0;

      const newNetBalance =
        previousNetBalance -
        parseFloat(payable_debit || 0) +
        parseFloat(due_credit || 0);

      await entryToUpdate.update(
        {
          due_credit: parseFloat(due_credit),
          payable_debit: parseFloat(payable_debit),
          due_amount: parseFloat(due_amount),
          payable_amount: parseFloat(payable_amount),
          status,
          remark,
          settle_due_date,
        },
        { transaction }
      );

      await existingBalanceSheet.update(
        {
          net_balance: newNetBalance,
          payable_debit: parseFloat(payable_debit || 0),
          due_credit: parseFloat(due_credit || 0),
          settle_due_date,
        },
        { transaction }
      );

      const subsequentBalanceSheets = await BalSheet.findAll({
        where: {
          id: {
            [Op.gt]: existingBalanceSheet.id,
          },
        },
        order: [["id", "ASC"]],
        transaction,
      });

      let prevNetBalance = newNetBalance;

      for (const sheet of subsequentBalanceSheets) {
        const NetBalance =
          prevNetBalance +
          parseFloat(sheet["due_credit"] || 0) -
          parseFloat(sheet["payable_debit"] || 0);

        await sheet.update(
          {
            net_balance: NetBalance,
          },
          { transaction }
        );

        prevNetBalance = NetBalance;
      }

      await transaction.commit();

      res.status(200).json({
        message: "Beeding entry and net balances updated successfully.",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const updateCustomerBeedingEntry = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const {
      groupId,
      payable_amount,
      handId,
      customerId,
      beedDate,
      taken_beed,
    } = req.body;
    const group = await Group.findByPk(groupId);
    const hand = await Hands.findByPk(handId);
    const customer = await Customer.findByPk(customerId);

    if (!group || !hand || !customer) {
      const error = new Error("Invalid input data.");
      error.statusCode = 401;
      return next(error);
    }
    // Calculate due amount
    const dueAmount =
      (parseFloat(group.taken_loan) - parseFloat(taken_beed)) /
      parseFloat(group.noofhands);
    // Check if the same entry already exists
    const existingCustomerEntry = await CustomerBeedingEntry.findOne({
      where: {
        HandId: handId,
        CustomerId: customerId,
        GroupId: groupId,
      },
    });
    if (!existingCustomerEntry) {
      const error = new Error(
        "Beeding entry already not exists for this Group and Hands."
      );
      error.statusCode = 400;
      return next(error);
    }
    let newPayableAmount =
      parseFloat(payable_amount) +
      parseFloat(existingCustomerEntry["due_credit"]);
    existingCustomerEntry.taken_beed = taken_beed;
    existingCustomerEntry.payable_amount = newPayableAmount;
    existingCustomerEntry.beedDate = beedDate;
    existingCustomerEntry.taken_beed = taken_beed;
    existingCustomerEntry.due_amount = 0;
    existingCustomerEntry.due_credit = 0;
    await existingCustomerEntry.save();
    // Fetch rest customers that belong to the same group
    const restCustomers = await CustomerBeedingEntry.findAll({
      where: {
        CustomerId: { [Op.ne]: customerId },
        HandId: handId,
        GroupId: groupId,
      },
    });
    let newDueAmount = 0;
    for (const customer of restCustomers) {
      newDueAmount =
        dueAmount +
        parseFloat(customer["payable_debit"] || 0) -
        parseFloat(customer["due_credit"] || 0);

      await customer.update({
        due_amount: newDueAmount,
        taken_beed: 0,
        payable_amount: 0,
      });
    }

    res.status(201).json({ message: "Beeding entry update successful!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
