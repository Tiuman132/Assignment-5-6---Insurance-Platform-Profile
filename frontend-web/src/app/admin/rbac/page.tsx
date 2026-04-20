"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import RoleAssignmentForm from "@/components/forms/RoleAssignmentForm";
import Alert from "@/components/feedback/Alert";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRbacPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiRequest<User[]>("/admin/users"),
        apiRequest<Role[]>("/admin/rbac/roles")
      ]);

      const filteredUsers = usersResponse.data.filter((item) => item._id !== user?._id);
      setUsers(filteredUsers);
      setRoles(rolesResponse.data);

      const queryUserId = searchParams.get("userId");
      const initialUser = filteredUsers.find((item) => item._id === queryUserId) || filteredUsers[0];

      if (initialUser) {
        setSelectedUserId(initialUser._id);
      }
    }

    void load();
  }, [searchParams, user?._id]);

  const selectedUser = users.find((user) => user._id === selectedUserId);

  async function handleRoleUpdate(nextRoles: string[]) {
    if (!selectedUserId) return;

    await apiRequest(`/admin/rbac/users/${selectedUserId}/roles`, {
      method: "PUT",
      body: { roles: nextRoles }
    });

    const refreshedUsers = await apiRequest<User[]>("/admin/users");
    setUsers(refreshedUsers.data.filter((item) => item._id !== user?._id));
    setMessage("Roles saved and refreshed successfully.");
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="RBAC Management" subtitle="Assign and manage user roles centrally." />

          {message ? <Alert variant="success" message={message} /> : null}

          <div className="panel">
            <label>Select User</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {selectedUser ? (
            <RoleAssignmentForm
              availableRoles={roles.map((role) => role.name)}
              currentRoles={selectedUser.roles}
              onSubmit={handleRoleUpdate}
            />
          ) : null}
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
