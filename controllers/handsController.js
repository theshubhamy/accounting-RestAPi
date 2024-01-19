import { Hands, Group } from "../models/Index.js";
import { validationErrorHandler } from "../middleware/validation-error-handler.js";
// Controller functions for hands
export const createHands = async (req, res, next) => {
  validationErrorHandler(req, next);
  const handsentries = req.body;

  try {
    const bulkCreateData = [];
    for (const handentries of handsentries) {
      const { handnumber } = handentries;

      // Check if the hands exists
      const existingHands = await Hands.findOne({ where: { handnumber } });
      if (existingHands) {
        // If any of the hands already exists, return an error for that hands
        const error = new Error(
          `Hands with  handsnumber ${handnumber} already exists.`
        );
        error.statusCode = 401;
        return next(error);
      }

      // Add the Hands data to the bulkCreateData array
      bulkCreateData.push({
        handnumber,
        isActive: true,
      });
    }
    // Create all the Hands in bulk
    await Hands.bulkCreate(bulkCreateData);

    res.status(201).json({ message: "Hands Created successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const listHands = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const hands = await Hands.findAll();
    res.status(200).json(hands);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const updateHandsDetails = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { id, handnumber, isActive } = req.body;

    // Find the hand by ID
    const hand = await Hands.findOne({
      where: {
        id: id,
      },
    });

    if (!hand) {
      const error = new Error("Hand not found");
      error.statusCode = 404;
      throw error;
    }

    // Update hand details if fields are not empty
    if (handnumber) {
      hand.handnumber = handnumber;
    }

    if (isActive) {
      hand.isActive = isActive;
    }

    await hand.save();

    res.status(200).json({ message: "Hand details updated successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const listHandsByGroupId = async (req, res, next) => {
  validationErrorHandler(req, next);
  try {
    const { groupId } = req.body;

    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    // Fetch hands associated with the group
    const hands = await group.getHands();
    res.status(200).json(hands);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
