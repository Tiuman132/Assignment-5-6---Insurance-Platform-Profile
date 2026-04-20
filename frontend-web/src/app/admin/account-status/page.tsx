"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import Alert from "@/components/feedback/Alert";
import StatusBadge from "@/components/tables/StatusBadge";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/user";

const statusOptions = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export default function AdminAccountStatusPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [nextStatus, setNextStatus] = useState<(typeof statusOptions)[number]>("ACTIVE");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const response = await apiRequest<User[]>("/admin/users");
      const filteredUsers = response.data.filter((item) => item._id !== user?._id);
      setUsers(filteredUsers);

      const queryUserId = searchParams.get("userId");
      const initialUser = filteredUsers.find((item) => item._id === queryUserId) || filteredUsers[0];

      if (initialUser) {
        setSelectedUserId(initialUser._id);
        setNextStatus(initialUser.accountStatus as (typeof statusOptions)[number]);
      }
    }

    void load();
  }, [searchParams, user?._id]);

  const selectedUser = users.find((item) => item._id === selectedUserId) || null;

  useEffect(() => {
    if (selectedUser) {
      setNextStatus(selectedUser.accountStatus as (typeof statusOptions)[number]);
    }
  }, [selectedUserId, selectedUser]);

  async function handleSave() {
    if (!selectedUserId) return;

    try {
      setIsSaving(true);
      setMessage(null);
      await apiRequest<User>(`/admin/users/${selectedUserId}/status`, {
        method: "PUT",
        body: { accountStatus: nextStatus }
      });

      const refreshedUsers = await apiRequest<User[]>("/admin/users");
      const filteredUsers = refreshedUsers.data.filter((item) => item._id !== user?._id);
      setUsers(filteredUsers);
      setMessage("Account status updated successfully.");
    } catch (error) {
      setMessage(error instanceof ApiRequestError ? error.message : "Unable to update account status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader
            title="Account Status"
            subtitle="Activate, inactivate, or suspend user accounts while preserving Admin safety rules."
          />

          {message ? (
            <Alert
              variant={message.includes("successfully") ? "success" : "error"}
              message={message}
            />
          ) : null}

          <div className="profile-grid">
            <div className="panel">
              <label>Select User</label>
              <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                {users.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.username}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser ? (
              <div className="panel">
                <h3>{selectedUser.profile.firstName} {selectedUser.profile.lastName}</h3>
                <p>{selectedUser.profile.email}</p>
                <p>Roles: {selectedUser.roles.join(", ")}</p>
                <p>
                  Current Status: <StatusBadge value={selectedUser.accountStatus} />
                </p>
              </div>
            ) : null}
          </div>

          <div className="panel">
            <label>New Status</label>
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as (typeof statusOptions)[number])}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="actions-row">
              <button className="btn btn-primary" type="button" disabled={!selectedUserId || isSaving} onClick={() => void handleSave()}>
                {isSaving ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
