"use client";

import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import UserForm from "@/components/forms/UserForm";

export default function CreateUserPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader
            title="Create User"
            subtitle="Provision a new user account with roles, profile details, and initial status."
          />

          <div>
            <UserForm />
          </div>
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
