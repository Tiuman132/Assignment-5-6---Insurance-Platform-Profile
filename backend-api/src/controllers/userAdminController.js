import { userAdminService } from "../services/userAdminService.js";
import { successResponse } from "../utils/apiResponse.js";

export const userAdminController = {
  async listUsers(req, res, next) {
    try {
      const data = await userAdminService.listUsers();
      return successResponse(res, data, "Users loaded");
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const data = await userAdminService.getUserById(req.params.userId);
      return successResponse(res, data, "User loaded");
    } catch (error) {
      next(error);
    }
  },

  async listCustomers(req, res, next) {
     try {
       const data = await userAdminService.listCustomers();
       return successResponse(res, data, "Customers loaded");
     } catch (error) {
       next(error);
     }
  },

  async createUser(req, res, next) {
    try {
      const data = await userAdminService.createUser(req.body);
      return successResponse(res, data, "User created", 201);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const data = await userAdminService.updateUser(req.user._id, req.params.userId, req.body);
      return successResponse(res, data, "User updated");
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const data = await userAdminService.updateUserStatus(
        req.user._id,
        req.params.userId,
        req.body.accountStatus
      );
      return successResponse(res, data, "User status updated");
    } catch (error) {
      next(error);
    }
  }
};
