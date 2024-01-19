import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";
export const userSignup = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { username, password, email, phone } = req.body;
    let existingUser = await User.findOne({
      where: {
        phone,
      },
    });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        username,
        password: hashedPassword,
        email,
        phone,
        isAdmin: false,
      });
    } else {
      const error = new Error("User Already Exist!");
      error.statusCode = 404;
      return next(error);
    }

    res.status(201).json({
      message: "user Created Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const listUser = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    let Users = await User.findAll();
    if (!Users) {
      const error = new Error("User Not found!");
      error.statusCode = 404;
      return next(error);
    }

    res.status(201).json(Users);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { id } = req.body; // Assuming you are passing the userId in the URL parameter

    // Find the user by ID and delete it
    const user = await User.findByPk(id);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const userLogin = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({
      where: { phone },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    const id = user["id"];
    const username = user["username"];
    const email = user["email"];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 40;
      return next(error);
    }
    const token = jwt.sign(
      { id, email, phone, username },
      " process.env.TOKEN_SIGNING_KEY",
      {
        expiresIn: "1 day",
      }
    );
    const refreshToken = jwt.sign(
      { id, email, phone, username },
      "process.env.REFRESH_TOKEN_SIGNING_KEY"
    );
    await User.update(
      {
        token: token,
        refreshToken: refreshToken,
      },
      { where: { phone } }
    );
    res.status(200).json({
      message: `User Login Successfully`,
      userDetails: {
        username,
        email,
        phone,
        token,
        refreshToken,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
