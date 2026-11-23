import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../../services/dashboardApi";
import "./dashboard/dashboard.css";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
const dateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
function Icon({ kind = "grid" }) {
  const paths = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    money: "M4 5h16v14H4z M4 9h16 M8 14h3 M16 14h1",
    message: "M4 4h16v13H9l-5 4z M8 8h8 M8 12h5",
    arrow: "M7 17 17 7 M7 7h10v10",
    clock: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}
function Heading({ eyebrow, title, to }) {
  return (
    <div className="db-panel-heading">
      <div>
        <p className="db-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {to && (
        <Link to={to} className="db-icon-link" aria-label={`View ${title}`}>
          <Icon kind="arrow" />
        </Link>
      )}
    </div>
  );
}
function Empty({ text }) {
  return (
    <div className="db-empty">
      <span>
        <Icon kind="clock" />
      </span>
      <p>{text}</p>
    </div>
  );
}
export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState("all");
  const [month, setMonth] = useState(() => dateKey(new Date()).slice(0, 7));
  useEffect(() => {
    let active = true;
    fetchDashboard(month, session)
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setData({ failed: true });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt, month, session]);
  const value = (_key, count) => (loading ? "…" : data.failed ? "—" : count);
  const collected = data.collection?.total || 0;
  const outstanding = data.collection?.outstanding || 0;
  const classes = data.schedule?.classes || [];
  const cards = [
    [
      "Total students",
      value("students", data.students || 0),
      "Student directory",
      "students",
      "people",
    ],
    [
      "Active batches",
      value("batches", data.batches || 0),
      "Running academic batches",
      "courses",
      "grid",
    ],
    [
      "Monthly collection",
      value("invoices", money(collected)),
      "Recorded payments · selected month",
      "fees",
      "money",
    ],
    [
      "Pending inquiries",
      value("inquiries", data.pendingInquiries || 0),
      "Open inquiries · all sessions",
      "inquiries",
      "message",
    ],
  ];
  const buckets = data.collection?.daily || [];
  const days = buckets.length;
  const maximum = Math.max(1, ...buckets);
  const admissionCounts = [
    ["Inquiries", data.admissions?.inquiries, "/admin/inquiries"],
    ["Demo requests", data.admissions?.demos, "/admin/demo-requests"],
    ["Enrolled admissions", data.admissions?.enrolled, "/admin/admissions"],
  ];
  const failure = !loading && data.failed;
  return (
    <div className="db-shell">
      <header className="db-header">
        <div className="db-welcome">
          <span className="db-welcome-icon" aria-hidden="true">
            <Icon kind="grid" />
          </span>
          <div>
            <p className="db-eyebrow">TUITIONSPHERE / ADMIN WORKSPACE</p>
            <h1>
              Welcome, Admin<span>.</span>
            </h1>
          </div>
        </div>
        <div className="db-header-actions">
          <select
            aria-label="Academic session"
            value={session}
            onChange={(event) => {
              setLoading(true);
              setSession(event.target.value);
            }}
          >
            <option value="all">All academic sessions</option>
            {(data.sessions || []).map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
          <details className="db-quick">
            <summary>＋ Quick add</summary>
            <nav aria-label="Quick actions">
              <Link to="/admin/admissions?manual=1">New admission</Link>
              <Link to="/admin/schedule">Schedule a class</Link>
              <Link to="/admin/fees">Create invoice</Link>
              <Link to="/admin/notices">Publish update</Link>
            </nav>
          </details>
        </div>
      </header>
      <div className="db-date">
        <span className="db-dot" />
        {new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }).format(new Date())}
        <span>All times in IST</span>
      </div>
      {failure && (
        <div role="alert" className="db-error">
          Dashboard could not load. Please retry.
          <button
            onClick={() => {
              setLoading(true);
              setAttempt(attempt + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      <section className="db-cards" aria-label="Institute overview">
        {cards.map(([label, number, detail, path, icon]) => (
          <Link
            to={`/admin/${path}`}
            className="db-stat"
            key={label}
          >
            <div className="db-stat-top">
              <span>{label}</span>
              <span className="db-stat-icon">
                <Icon kind={icon} />
              </span>
            </div>
            <strong>{number}</strong>
            <div className="db-stat-footer">
              <span>{detail}</span>
              <Icon kind="arrow" />
            </div>
          </Link>
        ))}
      </section>
      <div className="db-main-grid">
        <section className="db-panel db-collection">
          <Heading  title="Fee collection" />
          <div className="db-chart-top">
            <div>
              <strong>{value("invoices", money(collected))}</strong>
              <span>Collected in selected month</span>
            </div>
            <input
              aria-label="Collection month"
              type="month"
              value={month}
              onChange={(event) => {
                if (event.target.value) {
                  setLoading(true);
                  setMonth(event.target.value);
                }
              }}
            />
          </div>
          {loading || data.failed ? (
            <Empty
              text={
                loading
                  ? "Loading collection data…"
                  : "Collection data is unavailable."
              }
            />
          ) : (
            <>
              <div
                className="db-chart"
                aria-label="Daily recorded fee collection"
              >
                <div className="db-chart-grid">
                  <span>{money(maximum === 1 ? 0 : maximum)}</span>
                  <span>{money(maximum === 1 ? 0 : maximum / 2)}</span>
                  <span>₹0</span>
                </div>
                <div className="db-bars">
                  {buckets.map((amount, index) => (
                    <button
                      key={index}
                      className="db-bar-slot"
                      aria-label={`${month}-${index + 1}: ${money(amount)}`}
                      style={{ "--bar-height": `${(amount / maximum) * 100}%` }}
                    >
                      <span
                        className={`db-bar ${amount ? "" : "db-bar-zero"}`}
                      />
                      <span className="db-tooltip">
                        Day {index + 1}
                        <b>{money(amount)}</b>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="db-axis">
                <span>01</span>
                <span>{String(Math.ceil(days / 2)).padStart(2, "0")}</span>
                <span>{days}</span>
              </div>
              <p className="db-chart-note">
                <i />
                {data.collection?.paymentCount
                  ? "Recorded collections by payment date"
                  : "No recorded payments in this month"}
              </p>
            </>
          )}
          <div className="db-finance-footer">
            <div>
              <span>Total outstanding</span>
              <strong>{value("invoices", money(outstanding))}</strong>
            </div>
            <div>
              <span>Overdue · included in outstanding</span>
              <strong>
                {value("invoices", money(data.collection?.overdueAmount || 0))}
              </strong>
            </div>
            <Link to="/admin/fees">View invoices ↗</Link>
          </div>
        </section>
        <section className="db-panel db-schedule">
          <Heading
      
            title="Today’s schedule"
            to="/admin/schedule"
          />
          <div className="db-schedule-caption">
            <span>
              {value("schedule", data.schedule?.total || 0)} classes scheduled
            </span>
            <span className="db-pill">Today</span>
          </div>
          {loading || data.failed || !classes.length ? (
            <Empty
              text={
                loading
                  ? "Loading your schedule…"
                  : data.failed
                    ? "Schedule is unavailable."
                    : "No classes scheduled today."
              }
            />
          ) : (
            <div className="db-timeline">
              {classes.slice(0, 4).map((row, index) => (
                <Link to="/admin/schedule" className="db-class" key={row.id}>
                  <div className="db-time">
                    {row.startTime}
                    <span>{row.endTime}</span>
                  </div>
                  <div
                    className={`db-class-body ${index === 0 ? "db-class-first" : ""}`}
                  >
                    <span className="db-class-mode">{row.mode}</span>
                    <h3>{row.subject || row.topic || "Class session"}</h3>
                    <p>{row.batchName}</p>
                    <small>{row.mentor || "Tutor not assigned"}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link className="db-schedule-link" to="/admin/schedule">
            Open full schedule <span>→</span>
          </Link>
        </section>
      </div>
      <div className="db-bottom-grid">
        <section className="db-panel">
          <Heading
          
            title="Admissions overview"
            to="/admin/admissions"
          />
          <p className="db-section-note">
            All-time records across all sessions. Counts represent separate
            modules.
          </p>
          <div className="db-admissions">
            {admissionCounts.map(([label, count, path], index) => (
              <Link to={path} key={label}>
                <span className="db-step">0{index + 1}</span>
                <strong>{loading ? "…" : (count ?? "—")}</strong>
                <span>{label}</span>
                <div className="db-progress">
                  <i
                    style={{
                      width: `${count ? Math.max(4, (count / Math.max(1, ...admissionCounts.map((row) => row[1] || 0))) * 100) : 0}%`,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="db-panel">
          <Heading  title="Needs attention" />
          <div className="db-attention">
            {[
              [
                "inquiries",
                "Open inquiries",
                "Follow up with interested families",
                data.pendingInquiries || 0,
                "/admin/inquiries",
              ],
              [
                "invoices",
                "Overdue invoices",
                "Review pending fee collections",
                data.collection?.overdueCount || 0,
                "/admin/fees",
              ],
              [
                "attention",
                "Attendance pending",
                "Today’s completed classes with missing records",
                data.attention?.pendingAttendance || 0,
                "/admin/attendance",
              ],
              [
                "leaves",
                "Leave approvals",
                "Requests awaiting a decision",
                data.attention?.pendingLeaves || 0,
                "/admin/attendance",
              ],
            ].map(([key, title, detail, count, path]) => (
              <Link key={key} to={path}>
                <span
                  className={`db-attention-icon ${key === "invoices" ? "db-amber" : ""}`}
                >
                  <Icon kind={key === "invoices" ? "money" : "message"} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <strong>{value(key, count)}</strong>
                <span>›</span>
              </Link>
            ))}
          </div>
          <p className="db-attention-note">
            Review these queues to plan your next action.
          </p>
        </section>
      </div>
    </div>
  );
}
