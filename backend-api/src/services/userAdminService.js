import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { roleRepository } from "../repositories/roleRepository.js";
import { AppError } from "../utils/appError.js";
import { wouldRemoveLastActiveAdmin } from "../utils/rbacSafety.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

async function getRoleIds(roleNames) {
  const validRoles = await roleRepository.findByNames(roleNames);

  if (validRoles.length !== roleNames.length) {
    throw new AppError("One or more roles are invalid", 400);
  }

  return validRoles.map((role) => role._id);
}

async function ensureAnotherActiveAdminExists(excludeUserId) {
  const remainingAdmins = await userRepository.findActiveAdmins(excludeUserId);

  if (remainingAdmins.length === 0) {
    throw new AppError("At least one active Admin account must always exist", 400);
  }
}

export const userAdminService = {
  async listUsers() {
    const users = await userRepository.findAll();
    return users.map(stripSensitiveUserFields);
  },

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return stripSensitiveUserFields(user);
  },

  async listCustomers() {
    const users = await userRepository.findCustomers();
    return users.map(stripSensitiveUserFields);
  },

  async createUser(payload) {
    const existingUser = await userRepository.findByUsername(payload.username);
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }

    const roleIds = await getRoleIds(payload.roles);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await userRepository.create({
      username: payload.username,
      passwordHash,
      roles: roleIds,
      accountStatus: payload.accountStatus,
      profile: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone || "",
        city: payload.city || "",
        country: payload.country || "",
        userType: payload.userType
      }
    });

    const createdUser = await userRepository.findById(user._id);
    return stripSensitiveUserFields(createdUser);
  },

  async updateUser(adminUserId, userId, payload) {
    if (String(adminUserId) === String(userId)) {
      throw new AppError("Admin users cannot update their own account from the admin console", 403);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (payload.accountStatus && payload.accountStatus !== "ACTIVE") {
      const remainingActiveAdmins = await userRepository.findActiveAdmins(userId);

      if (wouldRemoveLastActiveAdmin(user, remainingActiveAdmins.length)) {
        await ensureAnotherActiveAdminExists(userId);
      }
    }

    if (
      payload.email !== undefined &&
      payload.email !== user.profile.email &&
      (await userRepository.findByEmail(payload.email))
    ) {
      throw new AppError("Email already exists", 409);
    }

    if (payload.firstName !== undefined) user.profile.firstName = payload.firstName;
    if (payload.lastName !== undefined) user.profile.lastName = payload.lastName;
    if (payload.email !== undefined) user.profile.email = payload.email;
    if (payload.phone !== undefined) user.profile.phone = payload.phone;
    if (payload.city !== undefined) user.profile.city = payload.city;
    if (payload.country !== undefined) user.profile.country = payload.country;
    if (payload.userType !== undefined) user.profile.userType = payload.userType;
    if (payload.accountStatus !== undefined) user.accountStatus = payload.accountStatus;

    await user.save();

    const refreshedUser = await userRepository.findById(userId);
    return stripSensitiveUserFields(refreshedUser);
  },

  async updateUserStatus(adminUserId, userId, accountStatus) {
    if (String(adminUserId) === String(userId)) {
      throw new AppError("Admin users cannot change their own account status", 403);
    }

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    if (
      accountStatus !== "ACTIVE" &&
      wouldRemoveLastActiveAdmin(existingUser, (await userRepository.findActiveAdmins(userId)).length)
    ) {
      await ensureAnotherActiveAdminExists(userId);
    }

    const user = await userRepository.updateById(userId, { accountStatus });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripSensitiveUserFields(user);
  }
};
