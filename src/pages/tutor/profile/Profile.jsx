import { useEffect, useState } from "react";
import {
  getTutorProfile,
  saveTutorSettings,
  updateTutorProfile,
} from "../../../services/tutorProfileApi";
import ProfileForm from "./ProfileForm";
import Security from "./Security";
import Preferences from "./Preferences";
import "../../admin/profile/profile.css";
export default function TutorProfile() {
  const [profile, setProfile] = useState(null),
    [tab, setTab] = useState("Profile"),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  useEffect(() => {
    let active = true;
    getTutorProfile()
      .then((p) => active && setProfile(p))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  async function save(data) {
    const p = await updateTutorProfile(data);
    setProfile(p);
    sessionStorage.setItem("tuitionsphere_tutor_name", p.name);
    setToast("Profile saved successfully.");
    return p;
  }
  async function settings(data) {
    const p = await saveTutorSettings(data);
    setProfile(p);
    setToast("Changes saved successfully.");
    return p;
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
          <button onClick={() => setToast("")}>×</button>
        </div>
      )}
      {error && <p className="profile-error">{error}</p>}
      {!profile && !error && <p>Loading your account…</p>}
      {profile && (
        <div className="profile-shell">
          <div className="profile-tabs" role="tablist">
            {tabs.map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div hidden={tab !== "Profile"}>
            <ProfileForm
              profile={profile}
              onSave={save}
              onSettings={settings}
            />
          </div>
          <div hidden={tab !== "Security"}>
            <Security visible={tab === "Security"} notify={setToast} />
          </div>
          <div hidden={tab !== "Preferences"}>
            <Preferences profile={profile} onSave={settings} />
          </div>
        </div>
      )}
    </section>
  );
}
