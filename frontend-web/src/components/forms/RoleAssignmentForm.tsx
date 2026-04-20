"use client";

import { useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/feedback/Alert";
import { ApiRequestError } from "@/lib/api";

interface RoleAssignmentFormProps {
  availableRoles: string[];
  currentRoles: string[];
  onSubmit: (roles: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function RoleAssignmentForm({
  availableRoles,
  currentRoles,
  onSubmit,
  disabled = false
}: RoleAssignmentFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedRoles(currentRoles);
    setMessage(null);
  }, [currentRoles]);

  function toggleRole(role: string) {
    if (disabled) return;

    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setMessage(null);
      await onSubmit(selectedRoles);
      setMessage("Roles updated successfully.");
    } catch (error) {
      setMessage(error instanceof ApiRequestError ? error.message : "Unable to update roles.");
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

      <div className="full-span">
        <label>Assigned Roles</label>
        <div className="checkbox-grid">
          {availableRoles.map((role) => (
            <label key={role} className="checkbox-card">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                disabled={disabled}
                onChange={() => toggleRole(role)}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="full-span">
        <button className="btn btn-primary" type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? "Saving..." : "Update roles"}
        </button>
      </div>
    </form>
  );
}
