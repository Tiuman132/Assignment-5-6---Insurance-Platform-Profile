"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import DataTable, { type DataTableColumn } from "@/components/tables/DataTable";
import StatusBadge from "@/components/tables/StatusBadge";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const response = await apiRequest<User[]>("/admin/users");
      setUsers(response.data);
    }

    void load();
  }, []);

  const columns: DataTableColumn<User>[] = [
    { key: "username", label: "Username", render: (row) => row.username },
    { key: "fullName", label: "Full Name", render: (row) => `${row.profile.firstName} ${row.profile.lastName}` },
    { key: "email", label: "Email", render: (row) => row.profile.email },
    { key: "roles", label: "Roles", render: (row) => row.roles.join(", ") },
    { key: "accountStatus", label: "Status", render: (row) => <StatusBadge value={row.accountStatus} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const isSelf = row._id === user?._id;

        return (
          <div className="actions-row">
            <Link href={`/admin/users/${row._id}/edit`} className={`btn btn-secondary ${isSelf ? "btn-disabled" : ""}`}>
              Edit
            </Link>
            <Link href={`/admin/rbac?userId=${row._id}`} className={`btn btn-secondary ${isSelf ? "btn-disabled" : ""}`}>
              Manage Roles
            </Link>
            <Link href={`/admin/account-status?userId=${row._id}`} className={`btn btn-secondary ${isSelf ? "btn-disabled" : ""}`}>
              Manage Status
            </Link>
          </div>
        );
      }
    }
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="Admin Users" subtitle="Create, review, and manage platform user accounts." />
          <div className="actions-row page-actions">
            <Link href="/admin/users/create" className="btn btn-primary">
              Create User
            </Link>
          </div>
          <DataTable columns={columns} data={users} rowKey={(row) => row._id} />
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
