import { Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import { generateValidationErrorMessage, validateToken } from "../utils.js";
import userController from "./controller.js";
import userSchema from "./model.js";

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
          res.status(201).json({ token });
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

router.post("/login", (req, res, next) => {
  userController
    .loginUser(req.body)
    .then((token) => {
      res.json({ token });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/verify", (req, res) => {
  const { token } = req.body;
  const decodedToken = validateToken(token);

  if (decodedToken) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

export default router;
