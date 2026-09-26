import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import PortalIcon from "./PortalIcon";
import { fetchStudentProfile, saveStudentTheme } from "../../services/studentProfileApi";
import { fetchStudentNotices, markAllStudentNoticesRead } from "../../services/studentNoticeApi";
import { logoutUser } from "../../services/authApi";
import "./portal-theme.css";

const portalNavigation = [
  ["dashboard", "Dashboard", "/portal/dashboard", "bg-sky-100 text-sky-900"],
  [
    "schedule",
    "Class Schedule",
    "/portal/schedule",
    "bg-violet-100 text-violet-900",
  ],
  [
    "attendance",
    "Attendance",
    "/portal/attendance",
    "bg-emerald-100 text-emerald-900",
  ],
  [
    "assignments",
    "Assignments",
    "/portal/assignments",
    "bg-amber-100 text-amber-900",
  ],
  ["fees", "Fee Records", "/portal/fees", "bg-rose-100 text-rose-900"],
  ["notice", "Updates", "/portal/notices", "bg-orange-100 text-orange-900"],
  ["profile", "Profile", "/portal/profile", "bg-slate-200 text-slate-900"],
];

function PortalLayout() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const portalStudentId = sessionStorage.getItem(
    "tuitionsphere_portal_student_id",
  );
  const [portalStudent, setPortalStudent] = useState(null);
  const [themeMode, setThemeMode] = useState("system");
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");
  const resolvedTheme = themeMode === "system" ? (systemDark ? "dark" : "light") : themeMode;
  const studentName = portalStudent?.name || "Student";
  const studentInitials = studentName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    let active = true;
    const refreshStudent = () => fetchStudentProfile()
      .then((profile) => {
        if (active) {
          setPortalStudent(profile);
          setThemeMode((profile.themePreference || "SYSTEM").toLowerCase());
        }
      })
      .catch(() => {});
    refreshStudent();
    window.addEventListener(
      "tuitionsphere:student-profile-updated",
      refreshStudent,
    );
    return () => {
      active = false;
      window.removeEventListener(
        "tuitionsphere:student-profile-updated",
        refreshStudent,
      );
    };
  }, [portalStudentId]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemDark(media.matches);
    media.addEventListener("change", syncSystemTheme);
    // Admin and tutor theme styles use a document attribute. Clear it while the student portal is open.
    document.documentElement.removeAttribute("data-admin-theme");
    document.documentElement.removeAttribute("data-admin-theme-mode");
    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);
  const toggleTheme = async () => {
    if (themeSaving || !portalStudent) return;
    const previous = themeMode;
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setThemeMode(next);
    setThemeError("");
    setThemeSaving(true);
    try {
      const saved = await saveStudentTheme(next.toUpperCase());
      setThemeMode(saved.themePreference.toLowerCase());
      setPortalStudent((student) => student ? { ...student, themePreference: saved.themePreference } : student);
    } catch {
      setThemeMode(previous);
      setThemeError("Could not save theme. Please try again.");
    } finally {
      setThemeSaving(false);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    let active = true;
    const refreshNotices = () => fetchStudentNotices()
      .then((result) => { if (active) setNotifications(result.notices); })
      .catch(() => {});
    refreshNotices();
    window.addEventListener("focus", refreshNotices);
    return () => { active = false; window.removeEventListener("focus", refreshNotices); };
  }, []);
  const unreadCount = notifications.filter((notice) => !notice.isRead).length;

  const markAllRead = async () => {
    try {
      const result = await markAllStudentNoticesRead();
      setNotifications(result.notices);
    } catch {
      /* Keep the unread state when the API is unavailable. */
    }
  };

  const logout = async () => {
    const token = sessionStorage.getItem("tuitionsphere_portal_token");
    try {
      await logoutUser(token);
    } catch {
      /* Clear local session even if the API is unavailable. */
    }
    sessionStorage.removeItem("tuitionsphere_portal_token");
    sessionStorage.removeItem("tuitionsphere_portal_session");
    sessionStorage.removeItem("tuitionsphere_portal_student_id");
    sessionStorage.removeItem("tuitionsphere_auth_role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="portal-shell min-h-screen bg-[#f3f6fb] text-slate-700" data-portal-theme={resolvedTheme}>
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close portal menu"
          className="fixed inset-0 z-40 bg-brand-navy/55 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[14px_0_45px_rgba(30,41,59,0.08)] transition-[width,transform] duration-300 lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[88px]" : ""} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-[76px] items-center border-b border-slate-200 ${sidebarCollapsed ? "justify-between px-5 lg:justify-center lg:px-2" : "justify-between px-5"}`}>
          <Link
            to="/portal/dashboard"
            className="flex items-center gap-3 text-brand-navy no-underline"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-md">
              <PortalIcon name="brand" className="h-6 w-6" />
            </span>
            <div className={sidebarCollapsed ? "lg:hidden" : ""}>
              <strong className="block font-heading text-base">
                TuitionSphere
              </strong>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Student Portal
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            aria-label={sidebarCollapsed ? "Expand student sidebar" : "Collapse student sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-brand-gold hover:text-brand-navy lg:flex"
          >
            <PortalIcon name={sidebarCollapsed ? "expand" : "collapse"} className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <PortalIcon name="close" />
          </button>
        </div>
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Portal navigation"
        >
          <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
            Learning
          </p>
          <div className="space-y-1">
            {portalNavigation.map(([icon, label, path, iconStyle]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex min-h-11 items-center rounded-xl text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
                }
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                >
                  <PortalIcon name={icon} className="h-4 w-4" />
                </span>
                <span className={sidebarCollapsed ? "lg:hidden" : ""}>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className={`border-t border-slate-200 ${sidebarCollapsed ? "p-4 lg:p-3" : "p-4"}`}>
          {/* <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gold text-xs font-bold text-brand-navy">
              {portalStudent?.profilePhoto ? (
                <img
                  src={portalStudent.profilePhoto}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                studentInitials
              )}
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-xs text-brand-navy">
                {studentName}
              </strong>
              <span className="text-[10px] text-slate-400">{studentMeta}</span>
            </div>
          </div> */}
          <div className={`flex gap-2 ${sidebarCollapsed ? "lg:flex-col" : ""}`}>
            <button
              type="button"
              onClick={toggleTheme}
              disabled={themeSaving || !portalStudent}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              className={`flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-brand-navy disabled:opacity-60 ${sidebarCollapsed ? "w-10 gap-2 lg:gap-0 lg:px-0" : "flex-1 gap-2 px-3"}`}
            >
              <PortalIcon name={resolvedTheme === "dark" ? "sun" : "moon"} className="h-4 w-4" />
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              title={sidebarCollapsed ? "Log Out" : undefined}
              className={`flex min-h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 ${sidebarCollapsed ? "w-10 gap-2 lg:gap-0 lg:px-0" : "flex-1 gap-2 px-3"}`}
            >
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>Log Out</span> <PortalIcon name="logout" className="h-4 w-4" />
            </button>
          </div>
          {themeError && <p role="alert" className="mt-2 text-xs text-rose-700">{themeError}</p>}
        </div>
      </aside>
      <div className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open portal menu"
            className="rounded-xl border border-slate-200 p-2.5 text-brand-navy lg:hidden"
          >
            <PortalIcon name="menu" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Portal notifications"
                aria-expanded={notificationsOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-navy"
              >
                <PortalIcon name="bell" className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <section className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.2)]">
                  <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <strong className="block text-xs text-brand-navy">
                        Notifications
                      </strong>
                      <span className="text-[9px] text-slate-400">
                        {unreadCount} unread{" "}
                        {unreadCount === 1 ? "update" : "updates"}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-[9px] font-bold text-sky-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </header>
                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((notice) => (
                      <article
                        key={notice.id}
                        className={`relative px-4 py-3 ${notice.isRead ? "bg-white" : "bg-sky-50/70"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <strong className="text-[11px] text-brand-navy">
                            {notice.title}
                          </strong>
                          {!notice.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                          {notice.message}
                        </p>
                      </article>
                    ))}
                    {notifications.length === 0 && (
                      <p className="p-6 text-center text-xs text-slate-400">
                        No active notifications.
                      </p>
                    )}
                  </div>
                  <Link
                    to="/portal/notices"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex min-h-10 items-center justify-center border-t border-slate-100 text-[10px] font-bold text-brand-navy no-underline"
                  >
                    Open updates →
                  </Link>
                </section>
              )}
            </div>
            <span className="hidden text-right sm:block">
              <strong className="block text-xs text-brand-navy">
                {studentName}
              </strong>
              <span className="text-[10px] text-slate-400">
                Student account
              </span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-navy text-[10px] font-bold text-brand-gold">
              {portalStudent?.profilePhoto ? (
                <img
                  src={portalStudent.profilePhoto}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                studentInitials
              )}
            </span>
          </div>
        </header>
        <div className="p-4 md:p-6 xl:p-8">
          <div className="mx-auto max-w-[1450px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalLayout;
