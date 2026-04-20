import { body } from "express-validator";
import { ACCOUNT_STATUS_VALUES } from "../constants/accountStatuses.js";

export const updateUserStatusValidator = [
  body("accountStatus")
    .notEmpty()
    .isIn(ACCOUNT_STATUS_VALUES)
    .withMessage(`accountStatus must be one of: ${ACCOUNT_STATUS_VALUES.join(", ")}`)
];

export const createUserValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("phone").optional().isString(),
  body("city").optional().isString(),
  body("country").optional().isString(),
  body("userType").trim().notEmpty().withMessage("User type is required"),
  body("roles").isArray({ min: 1 }).withMessage("At least one role is required"),
  body("roles.*").isString().withMessage("Role names must be strings"),
  body("accountStatus")
    .notEmpty()
    .isIn(ACCOUNT_STATUS_VALUES)
    .withMessage(`accountStatus must be one of: ${ACCOUNT_STATUS_VALUES.join(", ")}`)
];

export const updateUserValidator = [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("A valid email is required"),
  body("phone").optional().isString(),
  body("city").optional().isString(),
  body("country").optional().isString(),
  body("userType").optional().trim().notEmpty().withMessage("User type cannot be empty"),
  body("accountStatus")
    .optional()
    .isIn(ACCOUNT_STATUS_VALUES)
    .withMessage(`accountStatus must be one of: ${ACCOUNT_STATUS_VALUES.join(", ")}`)
];
