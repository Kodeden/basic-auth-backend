import { Repository, Schema } from "redis-om";
import dbClient from "../db-client.js";

class UserModel {
  constructor() {
    this.schema = new Schema("user", {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      password: {
        type: "string",
        required: true,
      },
    });

    this.repository = new Repository(dbClient, this.schema);

    this.validationSchema = {
      password: {
        isLength: {
          options: { min: 8 },
          errorMessage: "Password should be at least 8 chars",
        },
      },
    };
  }
}

export default new UserModel();
