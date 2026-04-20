export function isAdminRole(role) {
  if (typeof role === "string") {
    return role === "ADMIN";
  }

  if (role && typeof role === "object" && "name" in role) {
    return role.name === "ADMIN";
  }

  return false;
}

export function isActiveAdmin(user) {
  return user?.accountStatus === "ACTIVE" && (user?.roles || []).some(isAdminRole);
}

export function canSelfSuspend(user) {
  return !isActiveAdmin(user) && !(user?.roles || []).some(isAdminRole);
}

export function wouldRemoveLastActiveAdmin(targetUser, remainingActiveAdminCount) {
  return isActiveAdmin(targetUser) && remainingActiveAdminCount <= 0;
}
