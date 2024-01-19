import express from "express";
import {
  createCustomer,
  listCustomers,
  listCustomersByGroupId,
  listDueCustomers,
  listPayableCustomers,
  searchAllCustomers,
  updateCustomersDetails,
} from "../controllers/customerController.js";

import {
  createGroup,
  listGroups,
  updateGroup,
} from "../controllers/groupController.js";

import {
  createHands,
  listHands,
  listHandsByGroupId,
  updateHandsDetails,
} from "../controllers/handsController.js";
import {
  createCustomerBeedingEntry,
  listCustomerBeedingEntry,
  customerBeddingTransaction,
  updateCustomerBeddingById,
  updateCustomerBeedingEntry,
} from "../controllers/customerBeedingEntryController.js";
import { getBalSheetWithSearch } from "../controllers/balSheetController.js";
import {
  userLogin,
  userSignup,
  deleteUser,
  listUser,
} from "../controllers/authController.js";
import { dashboardStats } from "../controllers/dashboardController.js";
const router = express.Router();

router.post("/login", userLogin);
router.post("/signup", userSignup);
router.get("/listuser", listUser);
router.delete("/deleteUser", deleteUser);
// hands
router.post("/hands", createHands);
router.get("/listhands", listHands);
router.patch("/updatehands", updateHandsDetails);
router.post("/listhandbyId", listHandsByGroupId);
// groups
router.post("/groups", createGroup);
router.get("/listgroups", listGroups);
router.patch("/updategroups", updateGroup);
// customers
router.post("/customers", createCustomer);
router.get("/listcustomers", listCustomers);
router.patch("/updatecustomers", updateCustomersDetails);
router.post("/listcustomerbyId", listCustomersByGroupId);
router.get("/all-payable-customers", listPayableCustomers);
// Route for All Due Customers with Due Amount Only
router.get("/all-due-customers", listDueCustomers);
// search all customer
router.get("/search-all-customers", searchAllCustomers);
// beed entry
router.post("/beeding-entries", createCustomerBeedingEntry);
router.post("/list-beeding-entries", listCustomerBeedingEntry);
router.patch("/beeding-entries-transaction", customerBeddingTransaction);
router.patch("/update-beeding-entries", updateCustomerBeedingEntry);
router.patch("/update-beeding-entriesbyId", updateCustomerBeddingById);
// bal Sheet
router.get("/listBalSheetWithDetails", getBalSheetWithSearch);
// dasboard report
router.get("/dashbaord-report", dashboardStats);
export default router;
