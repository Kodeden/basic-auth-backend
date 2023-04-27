import jwt from "jsonwebtoken";
import config from "./config.js";

export const encodeToken = (payload) => {
  return jwt.sign({ data: payload }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateValidationErrorMessage = (validationErrors) => {
  return validationErrors
    .map(
      (error) => `
      ${error.msg}.
      '${error.path}' had a value of '${error.value}.' 🥅
    `
    )
    .join();
};

export const validateToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return false;
  }
};
