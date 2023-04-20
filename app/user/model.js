import { Schema } from "redis-om";

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

const userModel = new UserModel();
export default userModel;
