import assert from "node:assert";
import { before, describe, it } from "node:test";
import request from "supertest";
import { setupServer } from "../server.js";
import userModel from "../user/model.js";

const sadPath = {
  username: "mark",
  password: "west",
};

describe("User routes", () => {
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
        new RegExp(userModel.validationSchema.password.isLength.errorMessage)
      );
    });
  });
});
