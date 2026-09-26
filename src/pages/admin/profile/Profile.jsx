import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../../services/adminProfileApi";
import { authenticatedRequest } from "../../../services/authApi";
import ChangePassword from "./ChangePassword";
import ProfileForm from "./ProfileForm";
import Preferences from "./Preferences";
import ActiveSessions from "./ActiveSessions";
import "./profile.css";
export default function Profile() {
  const [profile, setProfile] = useState(null),
    [tab, setTab] = useState("Profile"),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [toast, setToast] = useState("");
  useEffect(() => {
    let active = true;
    getProfile()
      .then((p) => {
        if (active) {
          setProfile(p);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function save(data) {
    const p = await updateProfile(data);
    setProfile(p);
    sessionStorage.setItem("tuitionsphere_admin_name", p.name);
    window.dispatchEvent(new Event("admin-profile-updated"));
    setToast("Profile saved successfully.");
    return p;
  }
  async function settings(data) {
    const r = await authenticatedRequest("/admin-profile/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setProfile(r.data);
    setToast("Changes saved successfully.");
    return r.data;
  }
  const tabs = ["Profile", "Security", "Preferences"];
  return (
    <section className="profile-page">
      <header className="profile-heading">
        <h1>My Profile</h1>
      </header>
      {toast && (
        <div className="profile-toast" role="status">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="profile-error">
          {error}{" "}
          <button onClick={() => setAttempt((v) => v + 1)}>Retry</button>
        </p>
      )}
      {!profile && !error && <p role="status">Loading your account…</p>}
      {profile && (
        <div className="profile-shell">
          <div
            className="profile-tabs"
            role="tablist"
            aria-label="Account settings"
          >
            {tabs.map((name, i) => (
              <button
                key={name}
                role="tab"
                id={"tab-" + name}
                aria-selected={tab === name}
                aria-controls={"panel-" + name}
                tabIndex={tab === name ? 0 : -1}
                onClick={() => setTab(name)}
                onKeyDown={(e) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const n =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 2
                          : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                    setTab(tabs[n]);
                    document.getElementById("tab-" + tabs[n]).focus();
                  }
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="panel-Profile"
            aria-labelledby="tab-Profile"
            hidden={tab !== "Profile"}
          >
            <ProfileForm
              profile={profile}
              onSave={save}
              onSettings={settings}
            />
          </div>
          <div
            role="tabpanel"
            id="panel-Security"
            aria-labelledby="tab-Security"
            hidden={tab !== "Security"}
          >
            <ChangePassword notify={setToast} />
            <ActiveSessions visible={tab === "Security"} notify={setToast} />
          </div>
          <div
            role="tabpanel"
            id="panel-Preferences"
            aria-labelledby="tab-Preferences"
            hidden={tab !== "Preferences"}
          >
            <Preferences profile={profile} onSave={settings} />
          </div>
        </div>
      )}
    </section>
  );
}
