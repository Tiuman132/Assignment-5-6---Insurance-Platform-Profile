"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import Alert from "@/components/feedback/Alert";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const response = await apiRequest<User>("/profile/me");
      setProfile(response.data);
    }

    void load();
  }, []);

  async function handleSuspend() {
    try {
      setIsSuspending(true);
      await apiRequest<User>("/profile/me/suspend", {
        method: "PUT"
      });
      await logout();
      router.push("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to suspend account.");
      setShowSuspendConfirm(false);
    } finally {
      setIsSuspending(false);
    }
  }

  const isAdmin = profile?.roles.includes("ADMIN");

  return (
    <ProtectedRoute>
      <PageShell>
        <SectionHeader
          title="Profile"
          subtitle="Review your account information and manage your profile securely."
        />

        {profile ? (
          <>
            {message ? <Alert variant="error" message={message} /> : null}

            <div className="profile-grid">
              <div className="panel">
                <h3>Account Overview</h3>
                <dl className="detail-list">
                  <div>
                    <dt>Username</dt>
                    <dd>{profile.username}</dd>
                  </div>
                  <div>
                    <dt>Full Name</dt>
                    <dd>{profile.profile.firstName} {profile.profile.lastName}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{profile.profile.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{profile.profile.phone || "-"}</dd>
                  </div>
                  <div>
                    <dt>Roles</dt>
                    <dd>{profile.roles.join(", ")}</dd>
                  </div>
                </dl>
              </div>

              <div className="panel">
                <h3>Location and Status</h3>
                <dl className="detail-list">
                  <div>
                    <dt>Account Status</dt>
                    <dd>{profile.accountStatus}</dd>
                  </div>
                  <div>
                    <dt>User Type</dt>
                    <dd>{profile.profile.userType}</dd>
                  </div>
                  <div>
                    <dt>City</dt>
                    <dd>{profile.profile.city || "-"}</dd>
                  </div>
                  <div>
                    <dt>Country</dt>
                    <dd>{profile.profile.country || "-"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="panel">
              <h3>Profile Actions</h3>
              <div className="actions-row">
                <Link href="/profile/edit" className="btn btn-primary">
                  Edit Profile
                </Link>
                {!isAdmin ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={isSuspending}
                    onClick={() => setShowSuspendConfirm(true)}
                  >
                    {isSuspending ? "Suspending..." : "Deactivate Account"}
                  </button>
                ) : (
                  <p className="muted-copy">
                    Admin accounts cannot suspend themselves.
                  </p>
                )}
              </div>
            </div>

            {showSuspendConfirm ? (
              <ConfirmDialog
                title="Confirm account suspension"
                description="Suspending your account will immediately log you out and prevent future login until an Admin reactivates it."
                onCancel={() => setShowSuspendConfirm(false)}
                onConfirm={() => void handleSuspend()}
              />
            ) : null}
          </>
        ) : null}
      </PageShell>
    </ProtectedRoute>
  );
}
