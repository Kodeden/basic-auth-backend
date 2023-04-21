import bcrypt from "bcrypt";
import config from "../config.js";
import dbClient from "../db-client.js";
import { encodeToken } from "../utils.js";

export default {
  async registerUser(newUser) {
    const { username, password } = newUser;

    const isExistingUser = await dbClient.exists(username);

    if (isExistingUser) {
      throw new Error("User already exists");
    }

    const newUserWithEncryptedPassword = {
      username,
      password: await bcrypt.hash(password, config.saltRounds),
    };

    const numOfFieldsAdded = await dbClient.hSet(
      username,
      newUserWithEncryptedPassword
    );

    if (numOfFieldsAdded !== 2) {
      // TODO: Extend `Error` to account for 500 errors.
      throw new Error("Failed to register user 🤷🏾‍♀️.");
    }

    return encodeToken({ username });
  },

  async loginUser(credentials) {
    const { username, password } = credentials;

    const existingUser = await dbClient.hGetAll(username);
    console.log(existingUser);

    const isCorrectPassword =
      existingUser.password &&
      (await bcrypt.compare(password, existingUser.password));

    if (!existingUser || !isCorrectPassword) {
      throw new Error("Invalid credentials");
    }

    return encodeToken({ username });
  },
};
