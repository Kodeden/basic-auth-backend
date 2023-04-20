import assert from "node:assert";
import { afterEach, before, describe, it, mock } from "node:test";
import request from "supertest";
import dbClient from "../db-client.js";
import { setupServer } from "../server.js";
import userController from "../user/controller.js";
import userSchema from "../user/model.js";

describe("User routes", () => {
  const sadPath = {
    username: "mark",
    password: "west",
  };

  let app;

  before(() => {
    app = setupServer();
  });

  describe("POST /users/register", () => {
    it("should return a '400' with an appropriate error message if the password is too short", async () => {
      const response = await request(app).post("/users/register").send(sadPath);

      assert.equal(response.status, 400);
      // Does the error message contains the expected keywords from the schema?
      assert.match(
        response.body.error,
        new RegExp(userSchema.password.isLength.errorMessage)
      );
    });
  });
});

describe("User controller", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should throw an error if the user already exists", async () => {
    const sadPath = {
      username: "existingUser",
      password: "password",
    };

    mock.method(dbClient, "exists", async () => {
      return 1;
    });

    try {
      await userController.registerUser(sadPath);
    } catch (error) {
      assert.equal(error.message, "User already exists");
    }
  });
});
