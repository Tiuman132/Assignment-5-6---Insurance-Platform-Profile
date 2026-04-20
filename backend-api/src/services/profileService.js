import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { canSelfSuspend } from "../utils/rbacSafety.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

const OWN_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "city",
  "country"
];

export const profileService = {
  async getOwnProfile(userId) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripSensitiveUserFields(user);
  },

  async updateOwnProfile(userId, updates) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    for (const field of OWN_PROFILE_FIELDS) {
      if (Object.hasOwn(updates, field)) {
        user.profile[field] = updates[field];
      }
    }

    await user.save();

    const refreshedUser = await User.findById(userId).populate("roles");
    return stripSensitiveUserFields(refreshedUser);
  },

  async suspendOwnProfile(userId) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!canSelfSuspend(user)) {
      throw new AppError("Admin users cannot suspend their own account", 403);
    }

    user.accountStatus = "SUSPENDED";
    await user.save();

    return stripSensitiveUserFields(user);
  }
};
