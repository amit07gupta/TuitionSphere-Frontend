import { useEffect, useState } from "react";
import { authenticatedRequest } from "../../../services/authApi";
export default function ActiveSessions({ visible, notify }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let active = true;
    authenticatedRequest("/admin-profile/sessions")
      .then((r) => {
        if (active) {
          setData(r.data);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [visible, attempt]);
  async function revoke(id) {
    if (busy) return;
    setBusy(id);
    setError("");
    try {
      await authenticatedRequest("/admin-profile/sessions/" + id, {
        method: "DELETE",
      });
      setData({ ...data, sessions: data.sessions.filter((r) => r.id !== id) });
      notify("Session signed out.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  function device(a) {
    const b = /Edg\//.test(a)
      ? "Edge"
      : /Chrome\//.test(a)
        ? "Chrome"
        : /Firefox\//.test(a)
          ? "Firefox"
          : /Safari\//.test(a)
            ? "Safari"
            : "Unknown browser";
    const os = /iPhone|iPad/.test(a)
      ? "iOS"
      : /Android/.test(a)
        ? "Android"
        : /Windows/.test(a)
          ? "Windows"
          : /Mac/.test(a)
            ? "macOS"
            : /Linux/.test(a)
              ? "Linux"
              : "Unknown device";
    return b + " · " + os;
  }
  return (
    <section className="profile-sessions">
      <h2>Active sessions</h2>
      <p>Browsers currently signed in to your account.</p>
      {error && (
        <p role="alert" className="profile-error">
          {error}{" "}
          <button onClick={() => setAttempt((v) => v + 1)}>Retry</button>
        </p>
      )}
      {!data && !error && <p role="status">Loading sessions…</p>}
      {data && (
        <>
          {!data.trackedCurrentSession && (
            <p className="profile-note">
              Your current login predates session tracking. Sign in again to
              include this browser. Changing your password signs out older
              sessions too.
            </p>
          )}
          {data.sessions.map((r) => (
            <div className="profile-session-row" key={r.id}>
              <div>
                <h3>
                  {device(r.userAgent)}{" "}
                  {r.current && (
                    <span className="profile-role">This device</span>
                  )}
                </h3>
                <p>Signed in {new Date(r.createdAt).toLocaleString("en-IN")}</p>
              </div>
              {!r.current && (
                <button
                  className="profile-secondary"
                  disabled={Boolean(busy)}
                  onClick={() => revoke(r.id)}
                >
                  {busy === r.id ? "Signing out…" : "Sign out"}
                </button>
              )}
            </div>
          ))}
          {!data.sessions.length && <p>No tracked active sessions.</p>}
        </>
      )}
    </section>
  );
}
