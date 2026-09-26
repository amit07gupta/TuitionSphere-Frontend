import { useRef, useState } from "react";
const names = (items, key = "name") =>
  items?.map((x) => x[key]).join(", ") || "Not assigned";
export default function ProfileForm({ profile, onSave, onSettings }) {
  const [form, setForm] = useState({
      name: profile.name,
      phone: profile.phone || "",
    }),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const picker = useRef(null);
  const phone = form.phone.replace(/[\s()-]/g, "");
  const dirty =
    form.name.trim() !== profile.name ||
    phone !== (profile.phone || "");
  const valid =
    form.name.trim().length >= 2 &&
    (!phone || /^\d{10}$/.test(phone));
  async function submit(e) {
    e.preventDefault();
    if (!dirty || !valid) return;
    setSaving(true);
    setError("");
    try {
      const p = await onSave({
        ...form,
        name: form.name.trim(),
        phone,
      });
      setForm({
        name: p.name,
        phone: p.phone || "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function photo(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 130000
    )
      return setError("Choose a PNG, JPG or WebP image under 130 KB.");
    const avatar = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    try {
      await onSettings({ avatar });
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="profile-panel">
      <div className="profile-identity">
        <button
          type="button"
          className="profile-avatar"
          onClick={() => picker.current.click()}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="" />
          ) : (
            profile.name
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)
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
            <span className="profile-role">Tutor</span>
            <span>{profile.employeeCode}</span>
            <span>
              Joined{" "}
              {new Date(profile.joiningDate).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p>{profile.designation}</p>
        </div>
      </div>
      <form onSubmit={submit}>
        {error && <p className="profile-error">{error}</p>}
        <div className="profile-fields">
          <label>
            Full name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Phone number
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Availability
            <input readOnly value={profile.availability || "Not provided"} />
          </label>
          <label>
            Email
            <input readOnly value={profile.email} />
          </label>
          <label>
            Designation
            <input readOnly value={profile.designation} />
          </label>
          <label>
            Qualification
            <input readOnly value={profile.qualification || "Not provided"} />
          </label>
          <label className="profile-wide">
            Grades
            <input readOnly value={names(profile.grades, "gradeName")} />
          </label>
          <label className="profile-wide">
            Subjects
            <input readOnly value={names(profile.subjects)} />
          </label>
          <div className="profile-tutor-assignment-row">
            <label>
              Experience
              <input readOnly value={profile.experience == null ? "Not provided" : `${profile.experience} years`} />
            </label>
            <label>
              Boards
              <input readOnly value={names(profile.boards, "code")} />
            </label>
            <label>
              Teaching modes
              <input readOnly value={profile.modes?.join(", ") || "Not assigned"} />
            </label>
            <label>
              Streams
              <input readOnly value={profile.streams?.join(", ") || "Not applicable"} />
            </label>
          </div>
        </div>
        <div className="profile-footer">
          <span>
            {dirty ? "You have unsaved changes" : "All changes saved"}
          </span>
          <button
            className="profile-primary"
            disabled={!dirty || !valid || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
