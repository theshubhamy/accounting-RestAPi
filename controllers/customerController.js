import {
  Customer,
  Group,
  Hands,
  CustomerBeedingEntry,
  Op,
  Sequelize,
} from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";
// Controller functions for customers
export const createCustomer = async (req, res, next) => {
  validationErrorHandler(req, next);
  const customersData = req.body;

  try {
    const bulkCreateData = [];

    for (const customerData of customersData) {
      const { name, phone } = customerData;

      const existingCustomer = await Customer.findOne({ where: { phone } });
      if (existingCustomer) {
        const error = new Error(
          `Customer with phone number ${phone} already exists.`
        );
        error.statusCode = 401;
        return next(error);
      }

      bulkCreateData.push({
        name,
        phone,
        isActive: true,
      });
    }
    // Create all the customers in bulk
    await Customer.bulkCreate(bulkCreateData);

    res.status(201).json({ message: "Customers Created successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const listCustomers = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const updateCustomersDetails = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { id, name, phone, isActive } = req.body;

    // Find the customer by ID
    const customer = await Customer.findOne({
      where: {
        id: id,
      },
    });

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    // Update customer details if fields are not empty
    if (name) {
      customer.name = name;
    }

    if (phone) {
      customer.phone = phone;
    }

    if (isActive) {
      customer.isActive = isActive;
    }

    await customer.save();

    res.status(200).json({ message: "Customer details updated successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const listCustomersByGroupId = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { groupId } = req.body;

    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 401;
      return next(error);
    }
    // Fetch customers associated with the group
    const customers = await group.getCustomers();

    res.status(200).json(customers);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const listPayableCustomers = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const customersWithPayable = await Customer.findAll({
      include: {
        model: CustomerBeedingEntry,
        include: [{ model: Hands }, { model: Group }],
        where: {
          payable_amount: { [Op.gt]: 0 },
        },
      },
    });// Calculate the total due amount and total due credit for each customer
    const customersWithTotals = await Promise.all(
      customersWithPayable.map(async (customer) => {
        const sumpayableAmount = await CustomerBeedingEntry.sum("payable_amount", {
          where: {
            CustomerId: customer.id,
          },
        });
        // Add the totalDueAmount and totalDueCredit properties to the customer object
        customer.dataValues.totalPayableAmount = sumpayableAmount;
        return customer;
      })
    );

    res.status(200).json(customersWithTotals);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const listDueCustomers = async (req, res, next) => {
  try {
    // Validate the request
    validationErrorHandler(req, next);

    // Find all customers with due_amount greater than 0 along with their CustomerBeedingEntry entries
    const customersWithDue = await Customer.findAll({
      include: [
        {
          model: CustomerBeedingEntry,
          include: [{ model: Hands }, { model: Group }],
          where: {
            due_amount: { [Op.gt]: 0 },
          },
        },
      ],
    });

    // Calculate the total due amount and total due credit for each customer
    const customersWithTotals = await Promise.all(
      customersWithDue.map(async (customer) => {
        const sumDueAmount = await CustomerBeedingEntry.sum("due_amount", {
          where: {
            CustomerId: customer.id,
          },
        });
        // Add the totalDueAmount and totalDueCredit properties to the customer object
        customer.dataValues.totalDueAmount = sumDueAmount;
        return customer;
      })
    );
    res.status(200).json(customersWithTotals);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const searchAllCustomers = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    let customers = await Customer.findAll({
      include: [
        {
          model: CustomerBeedingEntry,
          include: [{ model: Hands }, { model: Group }],
        },
      ],
    });
    const { search } = req.query;
    if (search) {
      customers = await Customer.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        },
        include: [
          {
            model: CustomerBeedingEntry,
            include: [{ model: Hands }, { model: Group }],
          },
        ],
      });
    }

    res.status(200).json(customers);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
