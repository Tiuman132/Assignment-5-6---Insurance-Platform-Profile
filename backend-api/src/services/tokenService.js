import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function normalizeRoles(roles) {
  return (roles || []).map((role) => {
    if (typeof role === "string") {
      return role;
    }

    if (role && typeof role === "object" && role.name) {
      return role.name;
    }

    return String(role);
  });
}

export const tokenService = {
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: String(user._id || user.userId || ""),
        username: user.username || "",
        email: user.email || user.profile?.email || "",
        roles: normalizeRoles(user.roles),
        authSource: user.authSource || "LOCAL"
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn || "8h"
      }
    );
  },

  verifyAccessToken(token) {
    return jwt.verify(token, env.jwtSecret);
  }
};