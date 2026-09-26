import { useRef, useState } from "react";
export default function ProfileForm({ profile, onSave, onSettings }) {
  const [form, setForm] = useState({
      name: profile.name,
      phone: profile.phone || "",
    }),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  const busy = useRef(false),
    picker = useRef(null);
  const phone = form.phone.replace(/[\s()-]/g, ""),
    dirty =
      form.name.trim() !== profile.name || phone !== (profile.phone || ""),
    valid = form.name.trim().length >= 2 && (!phone || /^\d{10}$/.test(phone));
  async function submit(e) {
    e.preventDefault();
    if (busy.current || !dirty || !valid) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const p = await onSave({ name: form.name.trim(), phone });
      setForm({ name: p.name, phone: p.phone || "" });
    } catch (e) {
      setError(e.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  async function photo(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 130000
    ) {
      setError("Choose a PNG, JPG or WebP image under 130 KB.");
      return;
    }
    setUploading(true);
    try {
      const avatar = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(new Error("Unable to read image"));
        r.readAsDataURL(file);
      });
      await onSettings({ avatar });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="profile-panel">
      <div className="profile-identity">
        <button
          type="button"
          className="profile-avatar"
          aria-label="Upload profile photo"
          disabled={uploading || saving}
          onClick={() => picker.current.click()}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="" />
          ) : (
            profile.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((v) => v[0])
              .join("")
              .toUpperCase()
          )}
          <span className="profile-camera">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 7h4l2-3h6l2 3h4v13H3z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
        </button>
        <input
          hidden
          ref={picker}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={photo}
        />
        <div>
          <h2>{profile.name}</h2>
          <div className="profile-meta">
            <span className="profile-role">
              {profile.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </span>
            <span>
              Member since{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p>
            {uploading
              ? "Uploading photo…"
              : "Click your avatar to change your photo."}
          </p>
        </div>
      </div>
      <form onSubmit={submit}>
        <div className="profile-section-title">
          <h2>Personal information</h2>
          <p>Keep your contact details up to date.</p>
        </div>
        {error && (
          <p role="alert" className="profile-error">
            {error}
          </p>
        )}
        <div className="profile-fields">
          {[
            ["name", "Full name"],
            ["phone", "Phone number (optional)"],
          ].map(([key, label]) => (
            <label key={key} htmlFor={"profile-" + key}>
              {label}
              <input
                id={"profile-" + key}
                required={key === "name"}
                autoComplete={key === "name" ? "name" : "tel-national"}
                type={key === "phone" ? "tel" : "text"}
                maxLength={key === "name" ? 100 : 20}
                disabled={saving}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <label htmlFor="profile-email">
            Email address
            <input
              id="profile-email"
              type="email"
              readOnly
              value={profile.email}
            />
            <small>Your sign-in email is managed by your administrator.</small>
          </label>
        </div>
        <div className="profile-footer">
          <span>
            {dirty ? "You have unsaved changes" : "All changes saved"}
          </span>
          <button
            className="profile-primary"
            disabled={!dirty || !valid || saving || uploading}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
