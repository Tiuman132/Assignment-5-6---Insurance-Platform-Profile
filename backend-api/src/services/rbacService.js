import { roleRepository } from "../repositories/roleRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/appError.js";
import { wouldRemoveLastActiveAdmin } from "../utils/rbacSafety.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

export const rbacService = {
  async listRoles() {
    return roleRepository.findAll();
  },

  async assignRoles(adminUserId, userId, roles) {
    if (String(adminUserId) === String(userId)) {
      throw new AppError("Admin users cannot change their own roles", 403);
    }

    const validRoles = await roleRepository.findByNames(roles);

    if (validRoles.length !== roles.length) {
      throw new AppError("One or more roles are invalid", 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const willRemainAdmin = roles.includes("ADMIN");

    if (!willRemainAdmin) {
      const remainingAdmins = await userRepository.findActiveAdmins(userId);
      if (wouldRemoveLastActiveAdmin(user, remainingAdmins.length)) {
        throw new AppError("At least one active Admin account must always exist", 400);
      }
    }

    const updatedUser = await userRepository.updateById(userId, {
      roles: validRoles.map((role) => role._id)
    });

    return stripSensitiveUserFields(updatedUser);
  }
};
