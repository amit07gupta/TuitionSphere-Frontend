import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  applyTheme,
  getThemeMode,
  resolveTheme,
} from "../../services/themeService";
import {
  authenticatedRequest,
  getAuthenticatedUser,
} from "../../services/authApi";

const navigationSections = [
  {
    label: "",
    items: [
      [
        "dashboard",
        "Dashboard",
        "/admin/dashboard",
        "bg-sky-400/20 text-sky-300",
      ],
    ],
  },
  {
    label: "Initial Setup",
    highlight: true,
    items: [
      [
        "academicSession",
        "Academic Sessions",
        "/admin/academic-sessions",
        "bg-lime-400/20 text-lime-300",
      ],
      ["boards", "Boards", "/admin/boards", "bg-teal-400/20 text-teal-300"],
      ["grades", "Grades", "/admin/grades", "bg-yellow-400/20 text-yellow-300"],
      [
        "subjects",
        "Subjects",
        "/admin/subjects",
        "bg-cyan-400/20 text-cyan-300",
      ],
      ["tutor", "Tutors", "/admin/tutors", "bg-rose-400/20 text-rose-300"],
      [
        "courses",
        "Batches",
        "/admin/courses",
        "bg-indigo-400/20 text-indigo-300",
      ],
      [
        "feeConfig",
        "Fee Configuration",
        "/admin/fee-configuration",
        "bg-sky-400/20 text-sky-300",
      ],
      [
        "demo",
        "Demo Setup",
        "/admin/demo-setup",
        "bg-amber-400/20 text-amber-300",
      ],
    ],
  },
  {
    label: "Admissions",
    items: [
      [
        "demo",
        "Demo Requests",
        "/admin/demo-requests",
        "bg-violet-400/20 text-violet-300",
      ],
      [
        "inquiry",
        "Inquiries",
        "/admin/inquiries",
        "bg-cyan-400/20 text-cyan-300",
      ],
      [
        "admissions",
        "Admissions",
        "/admin/admissions",
        "bg-purple-400/20 text-purple-300",
      ],
      [
        "students",
        "Students",
        "/admin/students",
        "bg-amber-400/20 text-amber-300",
      ],
    ],
  },
  {
    label: "Academic Work",
    items: [
      [
        "schedule",
        "Class Schedule",
        "/admin/schedule",
        "bg-blue-400/20 text-blue-300",
      ],
      [
        "attendance",
        "Attendance",
        "/admin/attendance",
        "bg-emerald-400/20 text-emerald-300",
      ],
      [
        "assignments",
        "Assignments",
        "/admin/assignments",
        "bg-amber-400/20 text-amber-300",
      ],
    ],
  },
  {
    label: "Finance",
    items: [
      [
        "fees",
        "Fees & Invoices",
        "/admin/fees",
        "bg-emerald-400/20 text-emerald-300",
      ],
    ],
  },
  {
    label: "Communication",
    items: [
      [
        "notices",
        "Updates",
        "/admin/notices",
        "bg-orange-400/20 text-orange-300",
      ],
    ],
  },
  {
    label: "Administration",
    items: [
      [
        "tutor",
        "My Profile",
        "/admin/profile",
        "bg-indigo-400/20 text-indigo-300",
      ],
      [
        "students",
        "Admin Users",
        "/admin/admin-users",
        "bg-fuchsia-400/20 text-fuchsia-300",
      ],
    ],
  },
];

function AdminIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    demo: (
      <>
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    inquiry: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    students: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    courses: (
      <>
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6" />
      </>
    ),
    fees: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M7 15h2" />
      </>
    ),
    feeConfig: (
      <>
        <path d="M4 4h16v16H4zM8 8h8M8 12h4" />
        <circle cx="16" cy="16" r="3" />
        <path d="M16 14.5v3M14.5 16h3" />
      </>
    ),
    tutor: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0M18 4l2-2M6 4 4 2" />
      </>
    ),
    admissions: (
      <>
        <path d="M4 4h16v16H4zM8 8h8M8 12h5M8 16h3" />
        <path d="m15 16 2 2 3-4" />
      </>
    ),
    academicSession: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18M8 14h3M8 18h8" />
        <circle cx="17" cy="14" r="1" />
      </>
    ),
    boards: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H14v18a3 3 0 0 1 3-3h3Z" />
      </>
    ),
    grades: (
      <>
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 13v4c3 2 7 2 10 0v-4" />
        <path d="M21 10v6" />
      </>
    ),
    subjects: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H14v18a3 3 0 0 1 3-3h3Z" />
        <path d="M7 8h4M7 12h4" />
      </>
    ),
    schedule: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </>
    ),
    materials: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" />
        <path d="M4 5.5v14" />
      </>
    ),
    assignments: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 3V1h6v2M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    attendance: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m17 11 2 2 4-5" />
      </>
    ),
    results: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V2M2 19h22" />
      </>
    ),
    doubts: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M10 9a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.8m0 3h.01" />
      </>
    ),
    notices: (
      <>
        <path d="m3 11 14-6v14L3 13Z" />
        <path d="M7 14v5a2 2 0 0 0 2 2h2v-5M20 9v6" />
      </>
    ),
    notifications: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    reviews: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="m8 11 2 2 5-5" />
      </>
    ),
    reports: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    content: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.1h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4h-.1v-4H3a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1v-.1h4V3a1.7 1.7 0 0 0 1.1 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.35.7.6 1 .27.3.62.43 1 .4h.1v4H21a1.7 1.7 0 0 0-1.6.6Z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    collapse: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    expand: (
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </>
    ),
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
    brand: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H14v18a3 3 0 0 1 3-3h3Z" />
        <path d="m7 9 1.25 1.25L11 7.5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    resolveTheme(getThemeMode()),
  );
  const isDashboard = location.pathname === "/admin/dashboard";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setResolvedTheme(resolveTheme(getThemeMode()));
    applyTheme(getThemeMode());
    const token = sessionStorage.getItem("tuitionsphere_admin_token");
    if (token) {
      getAuthenticatedUser(token)
        .then((user) =>
          applyTheme((user.themePreference || "SYSTEM").toLowerCase()),
        )
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
    authenticatedRequest("/admin-profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ themePreference: next }),
    }).catch(() => {});
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tuitionsphere_admin_token");
    sessionStorage.removeItem("tuitionsphere_admin_session");
    sessionStorage.removeItem("tuitionsphere_admin_id");
    sessionStorage.removeItem("tuitionsphere_admin_name");
    sessionStorage.removeItem("tuitionsphere_admin_role");
    sessionStorage.removeItem("tuitionsphere_auth_role");
    navigate("/admin/login", { replace: true });
  };

  const toggleSidebar = () => setSidebarCollapsed((collapsed) => !collapsed);

  return (
    <div className="admin-theme-root min-h-screen bg-[#eef2f8] text-slate-700">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-brand-navy/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col overflow-hidden border-r border-blue-400/15 bg-[linear-gradient(165deg,#070f24_0%,#0b1b3f_55%,#101b37_100%)] text-white shadow-[18px_0_55px_rgba(3,7,18,0.3)] transition-[width,transform] duration-300 lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[88px]" : ""} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full border-[48px] border-blue-400/[0.07]"
        />
        <div
          className={`flex h-[76px] items-center border-b border-blue-300/15 bg-[#08132b]/60 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
        >
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 text-white no-underline"
            title="TuitionSphere"
            
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-navy shadow-lg">
              <AdminIcon name="brand" className="h-6 w-6" />
            </span>
            {!sidebarCollapsed && (
              <span className="block min-w-0">
                <strong className="block font-heading text-lg leading-tight">
                  TuitionSphere
                </strong>
                <small className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Admin Portal
                </small>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-300/25 bg-blue-400/10 text-blue-100 transition hover:border-blue-300 hover:bg-blue-600 hover:text-white lg:flex"
            aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            <AdminIcon
              name={sidebarCollapsed ? "expand" : "collapse"}
              className="h-4 w-4"
            />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <AdminIcon name="close" />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.16)_transparent]"
          aria-label="Admin navigation"
        >
          <div>
            {navigationSections.map((section, sectionIndex) => (
              <section
                key={section.label || "overview"}
                className={
                  sectionIndex > 0
                    ? "mt-3 border-t border-blue-300/15 pt-3"
                    : ""
                }
              >
                {section.label && !sidebarCollapsed && (
                  <p
                    className={`mb-2 px-2.5 text-[9px] font-bold uppercase tracking-[0.18em] ${section.highlight ? "text-amber-300" : "text-slate-400"}`}
                  >
                    {section.label}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map(
                    ([icon, label, path, iconStyle], itemIndex) => (
                      <NavLink
                        key={path}
                        to={path}
                        title={sidebarCollapsed ? label : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `group flex min-h-10 items-center rounded-xl text-xs font-semibold no-underline transition ${sidebarCollapsed ? "justify-center px-2" : "gap-2.5 px-2.5"} ${isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.38)] ring-1 ring-blue-300/40" : "text-slate-200 hover:bg-white/10 hover:text-white"}`
                        }
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/15 shadow-sm ${iconStyle}`}
                        >
                          <AdminIcon name={icon} className="h-4 w-4" />
                        </span>
                        {!sidebarCollapsed && (
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                            <span className="truncate whitespace-nowrap">
                              {label}
                            </span>
                            {section.highlight && (
                              <span className="text-[9px] font-bold text-amber-300/80">
                                {String(itemIndex + 1).padStart(2, "0")}
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="space-y-2 border-t border-blue-300/15 bg-[#071126]/70 p-4">
          {!sidebarCollapsed && (
            <Link
              to="/"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-300/25 bg-blue-400/[0.06] text-xs font-semibold text-slate-200 no-underline transition hover:border-blue-300/50 hover:bg-blue-500/15 hover:text-white"
            >
              <span>View Public Website</span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <div
            className={`flex items-center gap-2 ${sidebarCollapsed ? "flex-col" : ""}`}
          >
            {/* <button
              type="button"
              title="My profile"
              onClick={() => navigate("/admin/profile")}
              aria-label="Admin profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-gold/35 bg-brand-gold/10 transition hover:border-brand-gold hover:bg-brand-gold/20"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-brand-navy">
                {adminName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </button> */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              className={`flex min-h-10 items-center justify-center rounded-xl border border-blue-300/25 bg-blue-400/[0.08] text-xs font-semibold text-slate-200 transition hover:border-blue-300/50 hover:bg-blue-500/15 hover:text-white ${sidebarCollapsed ? "w-10 px-0" : "flex-1 gap-2 px-3"}`}
            >
              <AdminIcon
                name={resolvedTheme === "dark" ? "sun" : "moon"}
                className="h-4 w-4"
              />
              {!sidebarCollapsed && (
                <span>{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out"
              className={`flex min-h-10 items-center justify-center rounded-xl border border-slate-500/20 bg-slate-400/10 text-xs font-semibold text-slate-200 transition hover:border-rose-400/30 hover:bg-rose-500/20 hover:text-rose-100 ${sidebarCollapsed ? "w-10 px-0" : "flex-1 gap-2 px-3"}`}
            >
              {!sidebarCollapsed && <span>Log Out</span>}
              <AdminIcon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[278px]"}`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/80 bg-white/80 px-4 shadow-[0_8px_30px_rgba(30,41,59,0.06)] backdrop-blur-xl md:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-slate-200 p-2.5 text-brand-navy hover:bg-slate-50 lg:hidden"
            aria-label="Open admin menu"
          >
            <AdminIcon name="menu" />
          </button>
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 font-heading text-sm font-bold text-brand-navy no-underline md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-[10px] text-brand-gold">
              TS
            </span>
            <span>Admin</span>
          </Link>
          {!isDashboard && (
            <div className="relative hidden max-w-sm flex-1 md:block">
              <AdminIcon
                name="search"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="Search students, requests..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-brand-navy"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
            >
              <AdminIcon name={resolvedTheme === "dark" ? "sun" : "moon"} />
            </button>
            {!isDashboard && (
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-brand-navy"
                aria-label="Notifications"
              >
                <AdminIcon name="bell" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            )}
          </div>
        </header>

        <div
          className={`relative overflow-hidden p-4 md:p-6 xl:p-8 ${isDashboard ? "dashboard-content" : ""}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/[0.055] blur-3xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-sky-300/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-[1540px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
