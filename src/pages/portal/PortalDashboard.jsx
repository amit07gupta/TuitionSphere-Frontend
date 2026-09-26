import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchStudentAttendance } from "../../services/studentAttendanceApi";
import { fetchStudentFees } from "../../services/studentFeeApi";
import { fetchStudentProfile } from "../../services/studentProfileApi";
import { fetchStudentSchedule } from "../../services/studentScheduleApi";
import { fetchStudentAssignments } from "../../services/studentAssignmentApi";
import { fetchStudentNotices } from "../../services/studentNoticeApi";

const pad = (value) => String(value).padStart(2, "0");
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date, count) => { const result = new Date(date); result.setDate(result.getDate() + count); return result; };
const occursOn = (item, date) => {
  const key = dateKey(date);
  if (item.status === "Cancelled" || key < item.startDate || key > item.endDate) return false;
  if (item.scheduleType === "SINGLE") return key === item.startDate;
  return item.repeatDays.includes(date.toLocaleDateString("en-IN", { weekday: "long" }).toLowerCase());
};
const upcomingClasses = (schedules, today = new Date()) => {
  const rows = [];
  for (let offset = 0; offset <= 60; offset += 1) {
    const date = addDays(today, offset);
    schedules.filter((item) => occursOn(item, date)).forEach((item) => rows.push({ ...item, date: dateKey(date) }));
  }
  return rows.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
};

function PortalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const results = await Promise.allSettled([
        fetchStudentProfile(), fetchStudentSchedule(), fetchStudentAttendance(),
        fetchStudentAssignments(), fetchStudentFees(), fetchStudentNotices(),
      ]);
      if (!active) return;
      const failed = results.filter((result) => result.status === "rejected");
      setData({
        profile: results[0].status === "fulfilled" ? results[0].value : null,
        schedule: results[1].status === "fulfilled" ? results[1].value : null,
        attendance: results[2].status === "fulfilled" ? results[2].value : null,
        assignments: results[3].status === "fulfilled" ? results[3].value : null,
        fees: results[4].status === "fulfilled" ? results[4].value : null,
        notices: results[5].status === "fulfilled" ? results[5].value : null,
      });
      setError(failed.length ? "Some dashboard information could not be loaded. Refresh to try again." : "");
      setLoading(false);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);
  if (loading) return <section className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Loading dashboard…</section>;
  const student = data?.profile;
  if (!student)
    return (
      <section className="rounded-2xl border bg-white p-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-navy">
          Student profile not connected
        </h1>
        <Link
          to="/login"
          className="mt-5 inline-flex rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white no-underline"
        >
          Return to login
        </Link>
      </section>
    );

  const classes = upcomingClasses(data.schedule?.schedules || []);
  const attendanceRecords = data.attendance?.records || [];
  const present = attendanceRecords.filter((item) => item.status === "Present").length;
  const absent = attendanceRecords.filter((item) => item.status === "Absent").length;
  const rate = present + absent ? Math.round((present / (present + absent)) * 100) : 0;
  const feeRecords = data.fees?.records || [];
  const pendingFees = feeRecords.filter(
    (item) => item.outstandingAmount > 0 && !["Draft", "Cancelled"].includes(item.status),
  );
  const allNotices = data.notices?.notices || [];
  const notices = allNotices.slice(0, 3);
  const pendingAssignments = (data.assignments?.assignments || []).filter((item) => !item.submission).length;
  const cards = [
    [
      "Upcoming Classes",
      classes.length,
      "schedule",
      "/portal/schedule",
      "bg-sky-50 border-sky-200",
    ],
    [
      "Attendance",
      data.attendance ? `${rate}%` : "—",
      "attendance",
      "/portal/attendance",
      "bg-emerald-50 border-emerald-200",
    ],
    [
      "Assignments",
      data.assignments ? pendingAssignments : "—",
      "assignments",
      "/portal/assignments",
      "bg-violet-50 border-violet-200",
    ],
    [
      "Pending Fees",
      data.fees ? pendingFees.length : "—",
      "fees",
      "/portal/fees",
      "bg-rose-50 border-rose-200",
    ],
    [
      "Active Updates",
      data.notices ? allNotices.length : "—",
      "notice",
      "/portal/notices",
      "bg-orange-50 border-orange-200",
    ],
  ];

  return (
    <div>
      {error && <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">{error}</p>}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
          Student dashboard
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy">
          Welcome, {student.name.split(" ")[0]}
        </h1>

      </section>
      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, icon, path, tone]) => (
          <Link
            key={label}
            to={path}
            className={`flex items-center justify-between rounded-xl border p-4 text-brand-navy no-underline shadow-sm ${tone}`}
          >
            <div>
              <p className="text-[10px] font-semibold text-slate-500">
                {label}
              </p>
              <strong className="mt-1 block font-heading text-2xl">
                {value}
              </strong>
            </div>
            <PortalIcon name={icon} className="h-6 w-6" />
          </Link>
        ))}
      </section>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Upcoming Classes
            </h2>
            <Link
              to="/portal/schedule"
              className="text-xs font-semibold text-brand-navy no-underline"
            >
              View schedule →
            </Link>
          </header>
          <div className="divide-y">
            {classes.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <strong className="text-sm text-brand-navy">
                    {item.subject}
                  </strong>
                  <p className="text-xs text-slate-500">
                    {item.topic} ·{" "}
                    {item.tutorName || item.mentor || "Tutor assigned"}
                  </p>
                </div>
                <span className="text-right text-xs text-slate-500">
                  {item.date}
                  <br />
                  {item.startTime}–{item.endTime}
                </span>
              </article>
            ))}
            {!classes.length && (
              <p className="p-6 text-center text-xs text-slate-400">
                No upcoming class scheduled.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-brand-navy">
            Updates
          </h2>
          <div className="mt-2 divide-y">
            {notices.map((notice) => (
              <article key={notice.id} className="py-3">
                <strong className="text-xs text-brand-navy">
                  {notice.title}
                </strong>
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                  {notice.message}
                </p>
              </article>
            ))}
            {!notices.length && (
              <p className="py-5 text-center text-xs text-slate-400">
                No active updates.
              </p>
            )}
          </div>
          <Link
            to="/portal/notices"
            className="mt-3 inline-flex text-xs font-semibold text-brand-navy no-underline"
          >
            Open updates →
          </Link>
        </section>
      </div>
    </div>
  );
}

export default PortalDashboard;
