import jwt from "jsonwebtoken";
import config from "./config.js";

function generateErrorInfoDetailsIfNotPassword(error) {
  return error.path.includes("password")
    ? null
    : `${error.path} had a value of '${error.value}.`;
}

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
      ${generateErrorInfoDetailsIfNotPassword(error)}
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
