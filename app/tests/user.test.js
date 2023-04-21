import assert from "node:assert";
import { afterEach, before, describe, it, mock } from "node:test";
import request from "supertest";
import dbClient from "../db-client.js";
import { setupServer } from "../server.js";
import userController from "../user/controller.js";
import userSchema from "../user/model.js";

// Defaults to happy :) path
function setUpDBClientMocks({
  existsReturnValue = 0,
  hSetReturnValue = 2,
  hGetAllReturnValue = { username: "success" },
} = {}) {
  mock.method(dbClient, "exists", async () => {
    return existsReturnValue;
  });

  mock.method(dbClient, "hSet", async () => {
    return hSetReturnValue;
  });
}

describe("User", () => {
  afterEach(() => {
    mock.reset();
  });

  describe("User routes", () => {
    let app;

    before(() => {
      app = setupServer();
    });

    describe("POST /users/register", () => {
      it("should return a '201' and a token if the user is successfully registered", async () => {
        setUpDBClientMocks();

        const happyPath = {
          username: "newRouteUser",
          password: "password",
        };

        const response = await request(app)
          .post("/users/register")
          .send(happyPath);

        assert.equal(response.status, 201);
        assert.match(response.body.token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      it("should return a '400' with an appropriate error message if the password is too short", async () => {
        const sadPath = {
          username: "mark",
          password: "west",
        };

        const response = await request(app)
          .post("/users/register")
          .send(sadPath);

        assert.equal(response.status, 400);
        // Does the error message contains the expected keywords from the schema?
        assert.match(
          response.body.error,
          new RegExp(userSchema.password.isLength.errorMessage)
        );
      });
    });

    describe("POST /users/login", () => {});
  });

  describe("User controller", () => {
    it("should successfully register the user", async () => {
      setUpDBClientMocks();

      const happyPath = {
        username: "newControllerUser",
        password: "password",
      };

      const token = await userController.registerUser(happyPath);

      assert.match(token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it("should throw an error if the user already exists", async () => {
      setUpDBClientMocks({ existsReturnValue: 1 });

      const sadPath = {
        username: "existingUser",
        password: "password",
      };

      try {
        await userController.registerUser(sadPath);
      } catch (error) {
        assert.equal(error.message, "User already exists");
      }
    });
  });
});
