"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/feedback/Alert";
import { apiRequest, ApiRequestError } from "@/lib/api";
import type { User } from "@/types/user";

interface UserFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  userType: string;
  roles: string[];
  accountStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

interface UserFormProps {
  initialData?: User | null;
  isEdit?: boolean;
}

const roleOptions = ["ADMIN", "AGENT", "CUSTOMER", "UNDERWRITER", "CLAIMS_ADJUSTER"];

export default function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<UserFormData>({
    username: initialData?.username || "",
    password: "",
    firstName: initialData?.profile.firstName || "",
    lastName: initialData?.profile.lastName || "",
    email: initialData?.profile.email || "",
    phone: initialData?.profile.phone || "",
    city: initialData?.profile.city || "",
    country: initialData?.profile.country || "",
    userType: initialData?.profile.userType || "",
    roles: initialData?.roles || [],
    accountStatus:
      (initialData?.accountStatus as UserFormData["accountStatus"] | undefined) || "ACTIVE"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!isEdit && !form.username.trim()) nextErrors.username = "Username is required.";
    if (!isEdit && form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.userType.trim()) nextErrors.userType = "User type is required.";
    if (!isEdit && form.roles.length === 0) nextErrors.roles = "Select at least one role.";

    return nextErrors;
  }

  function toggleRole(role: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role]
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEdit && initialData?._id) {
        await apiRequest<User>(`/admin/users/${initialData._id}`, {
          method: "PUT",
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            city: form.city,
            country: form.country,
            userType: form.userType,
            accountStatus: form.accountStatus
          }
        });
        setMessage("User updated successfully. Redirecting...");
      } else {
        await apiRequest<User>("/admin/users", {
          method: "POST",
          body: form
        });
        setMessage("User created successfully. Redirecting...");
      }

      window.setTimeout(() => {
        router.push("/admin/users");
      }, 700);
    } catch (error) {
      setMessage(error instanceof ApiRequestError ? error.message : "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {message ? (
        <div className="full-span">
          <Alert
            variant={message.includes("successfully") ? "success" : "error"}
            message={message}
          />
        </div>
      ) : null}

      {!isEdit ? (
        <div>
          <label>Username</label>
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
          {errors.username ? <p className="form-error">{errors.username}</p> : null}
        </div>
      ) : null}

      {!isEdit ? (
        <div>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {errors.password ? <p className="form-error">{errors.password}</p> : null}
        </div>
      ) : null}

      <div>
        <label>First Name</label>
        <input
          value={form.firstName}
          onChange={(event) => setForm({ ...form, firstName: event.target.value })}
        />
        {errors.firstName ? <p className="form-error">{errors.firstName}</p> : null}
      </div>

      <div>
        <label>Last Name</label>
        <input
          value={form.lastName}
          onChange={(event) => setForm({ ...form, lastName: event.target.value })}
        />
        {errors.lastName ? <p className="form-error">{errors.lastName}</p> : null}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        {errors.email ? <p className="form-error">{errors.email}</p> : null}
      </div>

      <div>
        <label>Phone</label>
        <input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
      </div>

      <div>
        <label>City</label>
        <input
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
        />
      </div>

      <div>
        <label>Country</label>
        <input
          value={form.country}
          onChange={(event) => setForm({ ...form, country: event.target.value })}
        />
      </div>

      <div>
        <label>User Type</label>
        <input
          value={form.userType}
          onChange={(event) => setForm({ ...form, userType: event.target.value })}
        />
        {errors.userType ? <p className="form-error">{errors.userType}</p> : null}
      </div>

      {!isEdit ? (
        <div className="full-span">
          <label>Roles</label>
          <div className="checkbox-grid">
            {roleOptions.map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => toggleRole(role)}
                className={`role-chip ${form.roles.includes(role) ? "role-chip-selected" : ""}`}
              >
                {role}
              </button>
            ))}
          </div>
          {errors.roles ? <p className="form-error">{errors.roles}</p> : null}
        </div>
      ) : null}

      <div>
        <label>Account Status</label>
        <select
          value={form.accountStatus}
          onChange={(event) =>
            setForm({
              ...form,
              accountStatus: event.target.value as UserFormData["accountStatus"]
            })
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="full-span actions-row">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}
