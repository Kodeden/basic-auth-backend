import { Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import userSchema from "./model.js";
import { generateValidationErrorMessage } from "../utils.js";
import userController from "./controller.js";

const router = new Router();

router.post(
  "/register",
  // Express provides the req, res, and next arguments to middleware functions.
  checkSchema(userSchema, ["body"]),
  (req, res, next) => {
    const reqValidationErrors = validationResult(req);

    if (reqValidationErrors.isEmpty()) {
      userController
        .registerUser(req.body)
        .then((token) => {
          res.json({ token });
        })
        .catch((err) => {
          next(err);
        });
    } else
      next(
        new Error(generateValidationErrorMessage(reqValidationErrors.array()))
      );
  }
);

router.post("/login", (req, res) => {
  res.json({ message: "User logged in" });
});

export default router;
