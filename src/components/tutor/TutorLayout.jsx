import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import PortalIcon from "../portal/PortalIcon";
import { getAuthenticatedUser, logoutUser } from "../../services/authApi";
import { applyTheme, getThemeMode, resolveTheme } from "../../services/themeService";
import { saveTutorSettings } from "../../services/tutorProfileApi";

const clearTutorSession = () => {
  [
    "tuitionsphere_tutor_token",
    "tuitionsphere_tutor_session",
    "tuitionsphere_tutor_id",
    "tuitionsphere_tutor_user_id",
    "tuitionsphere_tutor_name",
    "tuitionsphere_tutor_email",
    "tuitionsphere_auth_role",
  ].forEach((key) => sessionStorage.removeItem(key));
};

function TutorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getThemeMode()));
  const navigate = useNavigate();
  const tutorName =
    sessionStorage.getItem("tuitionsphere_tutor_name") || "Tutor";
  const tutorInitials = tutorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const logout = async () => {
    const token = sessionStorage.getItem("tuitionsphere_tutor_token");
    try {
      await logoutUser(token);
    } catch {
      /* Local logout still completes if the API is unavailable. */
    }
    clearTutorSession();
    navigate("/login", { replace: true });
  };
  const toggleSidebar = () => setSidebarCollapsed((collapsed) => !collapsed);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setResolvedTheme(resolveTheme(getThemeMode()));
    applyTheme(getThemeMode());
    const token = sessionStorage.getItem("tuitionsphere_tutor_token");
    if (token) {
      getAuthenticatedUser(token)
        .then((user) => applyTheme((user.themePreference || "SYSTEM").toLowerCase()))
        .catch(() => {});
    }
    window.addEventListener("admin-theme-change", syncTheme);
    media.addEventListener("change", syncTheme);
    return () => {
      window.removeEventListener("admin-theme-change", syncTheme);
      media.removeEventListener("change", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTutorSettings({ themePreference: next }).catch(() => {});
  };

  return (
    <div className="admin-theme-root min-h-screen bg-[#f3f6fb] text-slate-700">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close tutor menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-brand-navy/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[14px_0_45px_rgba(30,41,59,0.08)] transition-[width,transform] duration-300 lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[88px]" : ""} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-[76px] items-center border-b border-slate-200 ${sidebarCollapsed ? "justify-between px-5 lg:justify-center lg:px-2" : "justify-between px-5"}`}
        >
          <Link
            to="/tutor"
            className="flex items-center gap-3 text-brand-navy no-underline"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-md">
              <PortalIcon name="brand" className="h-6 w-6" />
            </span>
            <div className={sidebarCollapsed ? "lg:hidden" : ""}>
              <strong className="block font-heading text-base">
                TuitionSphere
              </strong>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Tutor Portal
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed
                ? "Expand tutor sidebar"
                : "Collapse tutor sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-brand-gold hover:text-brand-navy lg:flex"
          >
            <PortalIcon
              name={sidebarCollapsed ? "expand" : "collapse"}
              className="h-4 w-4"
            />
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
          aria-label="Tutor navigation"
        >
          <p
            className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 ${sidebarCollapsed ? "lg:hidden" : ""}`}
          >
            Teaching workspace
          </p>
          <div className="space-y-1">
            <NavLink
              to="/tutor/dashboard"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "Dashboard" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${
                  isActive
                    ? "bg-brand-navy text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"
                }`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                <PortalIcon name="dashboard" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                Dashboard
              </span>
            </NavLink>

            <NavLink
              to="/tutor/my-schedule"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "My Schedule" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-800">
                <PortalIcon name="schedule" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                My Schedule
              </span>
            </NavLink>

            <NavLink
              to="/tutor/students"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "My Students" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
                <PortalIcon name="profile" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                My Students
              </span>
            </NavLink>

            {/* <NavLink
              to="attendance"
              onClick={() => setSidebarOpen(false)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-brand-navy"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <PortalIcon name="attendance" className="h-4 w-4" />
              </span>
              <span>Attendance</span>
            </NavLink> */}

            <NavLink
              to="/tutor/notices"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "Updates" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-800">
                <PortalIcon name="notice" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                Updates
              </span>
            </NavLink>

            <NavLink
              to="/tutor/assignments"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "Assignments" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <PortalIcon name="assignments" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                Assignments
              </span>
            </NavLink>

            <NavLink
              to="/tutor/profile"
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "My Profile" : undefined}
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-xl text-left text-sm font-semibold no-underline transition ${sidebarCollapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3"} ${isActive ? "bg-brand-navy text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"}`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-800">
                <PortalIcon name="profile" className="h-4 w-4" />
              </span>
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                My Profile
              </span>
            </NavLink>
          </div>
        </nav>

        <div
          className={`border-t border-slate-200 ${sidebarCollapsed ? "p-4 lg:p-3" : "p-4"}`}
        >
          {/* <div
            className={`mb-3 flex items-center rounded-xl bg-slate-50 ${sidebarCollapsed ? "gap-3 p-3 lg:justify-center lg:gap-0 lg:p-2" : "gap-3 p-3"}`}
            title={sidebarCollapsed ? tutorName : undefined}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-navy">
              {tutorInitials}
            </span>
            <div className={sidebarCollapsed ? "lg:hidden" : ""}>
              <strong className="block max-w-36 truncate text-xs text-brand-navy">
                {tutorName}
              </strong>
              <span className="text-[10px] text-slate-400">
                Teaching account
              </span>
            </div>
          </div> */}
          <div className={`flex gap-2 ${sidebarCollapsed ? "lg:flex-col" : ""}`}>
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              className={`flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-brand-navy ${sidebarCollapsed ? "w-10 gap-2 lg:gap-0" : "flex-1 gap-2 px-3"}`}
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
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>Log Out</span>{" "}
              <PortalIcon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"}`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open tutor menu"
            className="rounded-xl border border-slate-200 p-2.5 text-brand-navy lg:hidden"
          >
            <PortalIcon name="menu" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Tutor notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-navy"
            >
              <PortalIcon name="bell" className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden text-right sm:block">
              <strong className="block max-w-40 truncate text-xs text-brand-navy">
                {tutorName}
              </strong>
              <span className="text-[10px] text-slate-400">
                Teaching account
              </span>
            </span>
            <button
              type="button"
              onClick={() => navigate("/tutor/profile")}
              aria-label="Open tutor profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-brand-gold"
            >
              {tutorInitials}
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 xl:p-8">
          <div className="mx-auto max-w-[1450px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TutorLayout;
