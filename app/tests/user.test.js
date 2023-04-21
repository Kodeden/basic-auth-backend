import bcrypt from "bcrypt";
import assert from "node:assert";
import { afterEach, before, describe, it, mock } from "node:test";
import request from "supertest";
import config from "../config.js";
import dbClient from "../db-client.js";
import { setupServer } from "../server.js";
import userController from "../user/controller.js";
import userSchema from "../user/model.js";

describe("User", () => {
  describe("User routes", () => {
    let app;

    before(() => {
      app = setupServer();
    });

    describe("POST /users/register", () => {
      // ⚠️ Make sure this is restored inside of the innermost `describe` block.
      afterEach(() => {
        mock.restoreAll();
      });

      it("should return a '201' and a token if the user is successfully registered", async () => {
        // Make these tokens unique to make sure it's asserting for reals.
        const token = "register user token";

        mock.method(userController, "registerUser", async () => {
          return token;
        });

        const happyPath = {
          username: "newRouteUser",
          password: "password",
        };

        const response = await request(app)
          .post("/users/register")
          .send(happyPath);

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.token, token);
      });

      it("should return a '400' with an appropriate error message if the password is too short", async () => {
        const sadPath = {
          username: "too-short",
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
      afterEach(() => {
        mock.restoreAll();
      });

      it("should return a '200' and a token if the user is successfully logged in", async () => {
        const token = "login user token";

        mock.method(userController, "loginUser", async () => {
          return token;
        });

        const happyPath = {
          username: "existingUser200",
          password: "password",
        };

        const response = await request(app)
          .post("/users/login")
          .send(happyPath);

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.token, token);
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
    describe("registerUser", () => {
      afterEach(() => {
        mock.restoreAll();
      });

      it("should successfully register the user", async () => {
        mock.method(dbClient, "exists", async () => {
          return 0;
        });

        mock.method(dbClient, "hSet", async () => {
          return 2;
        });

        const happyPath = {
          username: "newControllerUser",
          password: "password",
        };

        const token = await userController.registerUser(happyPath);

        assert.match(token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      it("should throw an error if the user already exists", async () => {
        mock.method(dbClient, "exists", async () => {
          return 1;
        });

        const sadPath = {
          username: "existingUserError",
          password: "password",
        };

        try {
          await userController.registerUser(sadPath);
        } catch (error) {
          assert.strictEqual(error.message, "User already exists");
        }
      });
    });

    describe("loginUser", () => {
      afterEach(() => {
        mock.restoreAll();
      });

      it("should successfully log the user in", async () => {
        const happyPath = {
          username: "log-me-in",
          password: "password",
        };

        mock.method(dbClient, "hGetAll", async () => {
          return {
            username: happyPath.username,
            password: await bcrypt.hash(happyPath.password, config.saltRounds),
          };
        });

        const token = await userController.loginUser(happyPath);
        assert.match(token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      it("should throw an error if the user doesn't exist", async () => {
        mock.method(dbClient, "hGetAll", async () => {
          return {};
        });

        const sadPath = {
          username: "nonExistingControllerUser",
          password: "password",
        };

        try {
          await userController.loginUser(sadPath);
        } catch (error) {
          assert.strictEqual(error.message, "Invalid credentials");
        }
      });

      it("should throw an error if the password is wrong", async () => {
        const sadPath = {
          username: "badPassword",
          password: "wrongPassword",
        };

        mock.method(dbClient, "hGetAll", async () => {
          return {
            username: sadPath.username,
            password: await bcrypt.hash("password", config.saltRounds),
          };
        });

        try {
          await userController.loginUser(sadPath);
        } catch (error) {
          assert.strictEqual(error.message, "Invalid credentials");
        }
      });
    });
  });
});
