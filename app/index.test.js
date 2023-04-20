import assert from "node:assert";
import { test } from "node:test";
import { add2Nums } from "./index.js";

test("1 + 1 = 2", () => {
  assert.strictEqual(add2Nums(1, 1), 2);
});
