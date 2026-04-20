"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import Loader from "@/components/feedback/Loader";
import UserForm from "@/components/forms/UserForm";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";

export default function EditAdminUserPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const response = await apiRequest<User>(`/admin/users/${params.id}`);
      setUser(response.data);
    }

    if (params.id) {
      void load();
    }
  }, [params.id]);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader
            title="Edit User"
            subtitle="Update profile fields and account status for an existing user."
          />

          {user ? <UserForm initialData={user} isEdit /> : <Loader label="Loading user..." />}
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
