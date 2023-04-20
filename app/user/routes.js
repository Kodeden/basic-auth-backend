import { Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import { generateValidationErrorMessage } from "../utils.js";
import userSchema from "./model.js";

const router = new Router();

router.post(
  "/register",
  // Express provides the req, res, and next arguments to middleware functions.
  checkSchema(userSchema, ["body"]),
  (req, res, next) => {
    const reqValidationErrors = validationResult(req);
    if (reqValidationErrors.isEmpty()) res.json({ message: "User registered" });
    else
      next(
        new Error(generateValidationErrorMessage(reqValidationErrors.array()))
      );
  }
);

// router.post("/login", validateBody(userSchema), (req, res) => {
//   res.json({ message: "User logged in" });
// });

export default router;
