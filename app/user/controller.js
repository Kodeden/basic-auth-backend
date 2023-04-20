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

    await dbClient.hSet(username, newUserWithEncryptedPassword);

    return encodeToken({ username });
  },

  async login(credentials) {
    const { username, password } = credentials;

    const existingUser = await dbClient.hGetAll(username);

    const isCorrectPassword =
      existingUser.password &&
      (await bcrypt.compare(password, existingUser.password));

    if (!existingUser || !isCorrectPassword) {
      throw new Error("Invalid credentials");
    }

    return encodeToken({ username });
  },
};
