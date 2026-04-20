import test from "node:test";
import assert from "node:assert/strict";
import { isActiveAdmin, wouldRemoveLastActiveAdmin } from "../src/utils/rbacSafety.js";

test("active admin is recognized correctly", () => {
  const user = {
    accountStatus: "ACTIVE",
    roles: [{ name: "ADMIN" }]
  };

  assert.equal(isActiveAdmin(user), true);
});

test("inactive admin is not counted as active admin", () => {
  const user = {
    accountStatus: "SUSPENDED",
    roles: [{ name: "ADMIN" }]
  };

  assert.equal(isActiveAdmin(user), false);
});

test("suspending the last active admin is rejected by safety rule", () => {
  const user = {
    accountStatus: "ACTIVE",
    roles: [{ name: "ADMIN" }]
  };

  assert.equal(wouldRemoveLastActiveAdmin(user, 0), true);
});

test("status changes are allowed when another active admin remains", () => {
  const user = {
    accountStatus: "ACTIVE",
    roles: [{ name: "ADMIN" }]
  };

  assert.equal(wouldRemoveLastActiveAdmin(user, 1), false);
});
