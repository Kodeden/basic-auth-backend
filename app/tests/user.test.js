import assert from "node:assert";
import { afterEach, before, describe, it, mock } from "node:test";
import request from "supertest";
import dbClient from "../db-client.js";
import { setupServer } from "../server.js";
import userController from "../user/controller.js";
import userSchema from "../user/model.js";

function setUpDBClientMocks({
  // Defaults to happy :)
  existsReturnValue = 0,
  hSetReturnValue = 2,

  // Defaults to sad :(
  hGetAllReturnValue = {},
} = {}) {
  mock.method(dbClient, "exists", async () => {
    return existsReturnValue;
  });

  mock.method(dbClient, "hSet", async () => {
    return hSetReturnValue;
  });

  mock.method(dbClient, "hGetAll", async () => {
    return hGetAllReturnValue;
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
        mock.method(userController, "registerUser", async () => {
          return "token";
        });

        const happyPath = {
          username: "newRouteUser",
          password: "password",
        };

        const response = await request(app)
          .post("/users/register")
          .send(happyPath);

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.token, "token");
      });

      it("should return a '400' with an appropriate error message if the password is too short", async () => {
        const sadPath = {
          username: "mark",
          password: "west",
        };

        const response = await request(app)
          .post("/users/register")
          .send(sadPath);

        assert.strictEqual(response.status, 400);
        // Does the error message contains the expected keywords from the schema?
        assert.match(
          response.body.error,
          new RegExp(userSchema.password.isLength.errorMessage)
        );
      });
    });

    describe("POST /users/login", () => {
      it("should return a '200' and a token if the user is successfully logged in", async () => {
        mock.method(userController, "loginUser", async () => {
          return "token";
        });

        const happyPath = {
          username: "existingUser",
          password: "password",
        };

        const response = await request(app)
          .post("/users/login")
          .send(happyPath);

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.token, "token");
      });

      /**
       * It doesn't matter if the user doesn't exist or the password is wrong.
       * The error message should be the same,
       * and we only care about the response status.
       */
      it("should return a '400' with an appropriate error message if credentials are invalid", async () => {
        mock.method(userController, "loginUser", async () => {
          throw new Error("Invalid credentials");
        });

        const sadPath = {
          username: "nonExistingUser",
          password: "password",
        };

        const response = await request(app).post("/users/login").send(sadPath);

        assert.strictEqual(response.status, 400);
        assert.match(response.body.error, /Invalid credentials/);
      });
    });
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
        assert.strictEqual(error.message, "User already exists");
      }
    });
  });
});
