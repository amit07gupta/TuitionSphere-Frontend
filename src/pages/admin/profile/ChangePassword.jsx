import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedRequest } from "../../../services/authApi";

export default function ChangePassword({ notify }) {
  const navigate = useNavigate();
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);
  const [shown, setShown] = useState({});
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const mismatch =
    Boolean(form.confirmPassword) && form.newPassword !== form.confirmPassword;
  const score = [
    form.newPassword.length >= 8,
    form.newPassword.length >= 12,
    /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword),
    /[0-9]/.test(form.newPassword) && /[^a-zA-Z0-9]/.test(form.newPassword),
  ].filter(Boolean).length;
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (new TextEncoder().encode(form.newPassword).length > 72) {
      setError("New password must be at most 72 UTF-8 bytes.");
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await authenticatedRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      [
        "tuitionsphere_admin_token",
        "tuitionsphere_admin_session",
        "tuitionsphere_admin_id",
        "tuitionsphere_admin_name",
        "tuitionsphere_admin_role",
        "tuitionsphere_auth_role",
      ].forEach((key) => sessionStorage.removeItem(key));
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setChanged(true);
      notify("Password changed. Please sign in again.");
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return (
    <section>
      <div className="profile-panel">
        <h2 className="text-lg font-semibold text-slate-900">
          Change Password
        </h2>
        {changed ? (
          <div role="status" className="mt-4 space-y-4">
            <p className="text-green-700">
              Password changed successfully. All previous sessions have expired.
              Please sign in again.
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/login", { replace: true })}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="profile-security-form mt-4 space-y-4">
            <p className="text-sm text-slate-500">
              Use at least 8 characters (maximum 72 UTF-8 bytes). After changing
              your password, sign in again on every device.
            </p>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            {[
              ["currentPassword", "Current Password"],
              ["newPassword", "New Password"],
              ["confirmPassword", "Confirm New Password"],
            ].map(([key, label]) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <div className="profile-password">
                  <input
                    id={key}
                    name={key}
                    type={shown[key] ? "text" : "password"}
                    aria-invalid={key === "confirmPassword" && mismatch}
                    aria-describedby={
                      key === "confirmPassword" && mismatch
                        ? "password-mismatch"
                        : undefined
                    }
                    autoComplete={
                      key === "currentPassword"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                    minLength={key === "currentPassword" ? undefined : 8}
                    disabled={saving}
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                  <button
                    type="button"
                    aria-label={`${shown[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                    aria-pressed={Boolean(shown[key])}
                    onClick={() => setShown({ ...shown, [key]: !shown[key] })}
                  >
                    {shown[key] ? "Hide" : "Show"}
                  </button>
                </div>
                {key === "newPassword" && form.newPassword && (
                  <div className="profile-strength" aria-live="polite">
                    <div className="profile-strength-bars">
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          key={n}
                          style={{
                            background:
                              n <= score
                                ? [
                                    "#dc2626",
                                    "#dc2626",
                                    "#d97706",
                                    "#2563eb",
                                    "#15803d",
                                  ][score]
                                : "#e2e8f0",
                          }}
                        />
                      ))}
                    </div>
                    <small>
                      Password strength:{" "}
                      {["Weak", "Weak", "Fair", "Good", "Strong"][score]} · Use
                      a unique password.
                    </small>
                  </div>
                )}
              </div>
            ))}
            {mismatch && (
              <p id="password-mismatch" role="alert" className="profile-error">
                Passwords do not match.
              </p>
            )}
            <button
              disabled={
                saving ||
                !form.currentPassword ||
                form.newPassword.length < 8 ||
                !form.confirmPassword ||
                mismatch ||
                new TextEncoder().encode(form.newPassword).length > 72
              }
              className="profile-primary"
            >
              {saving ? "Changing Password…" : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
