import test from "node:test";
import assert from "node:assert/strict";
import { canSelfSuspend } from "../src/utils/rbacSafety.js";

test("non-admin roles can suspend their own account", () => {
  const user = {
    accountStatus: "ACTIVE",
    roles: [{ name: "CUSTOMER" }]
  };

  assert.equal(canSelfSuspend(user), true);
});

test("admin cannot suspend their own account", () => {
  const user = {
    accountStatus: "ACTIVE",
    roles: [{ name: "ADMIN" }]
  };

  assert.equal(canSelfSuspend(user), false);
});
