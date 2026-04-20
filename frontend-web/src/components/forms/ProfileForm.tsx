"use client";

import { useState, type FormEvent } from "react";
import type { UserProfile } from "@/types/user";
import Alert from "@/components/feedback/Alert";
import { ApiRequestError } from "@/lib/api";

interface ProfileFormProps {
  initialValue: UserProfile;
  onSubmit: (payload: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileForm({ initialValue, onSubmit }: ProfileFormProps) {
  const [form, setForm] = useState<Partial<UserProfile>>(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.firstName?.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName?.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email?.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    return nextErrors;
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
      await onSubmit(form);
      setMessage("Profile updated successfully. Redirecting...");
    } catch (error) {
      setMessage(error instanceof ApiRequestError ? error.message : "Unable to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {message ? (
        <div className="full-span">
          <Alert
            variant={message.includes("successfully") ? "success" : "error"}
            message={message}
          />
        </div>
      ) : null}

      <div>
        <label>First Name</label>
        <input
          value={form.firstName ?? ""}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        {errors.firstName ? <p className="form-error">{errors.firstName}</p> : null}
      </div>

      <div>
        <label>Last Name</label>
        <input
          value={form.lastName ?? ""}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        {errors.lastName ? <p className="form-error">{errors.lastName}</p> : null}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email ? <p className="form-error">{errors.email}</p> : null}
      </div>

      <div>
        <label>Phone</label>
        <input
          value={form.phone ?? ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label>City</label>
        <input
          value={form.city ?? ""}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>

      <div>
        <label>Country</label>
        <input
          value={form.country ?? ""}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
      </div>

      <div className="full-span">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save profile changes"}
        </button>
      </div>
    </form>
  );
}
