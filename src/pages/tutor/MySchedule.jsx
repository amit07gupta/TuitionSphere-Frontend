import { useEffect, useMemo, useState } from "react";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchTutorSchedule } from "../../services/tutorScheduleApi";
import "./dashboard.css";

const pad = (value) => String(value).padStart(2, "0");
const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date, count) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};
const dayKey = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
const scheduleOccursOn = (item, date) => {
  if (!item || !date) return false;
  if (item.date) return item.date === date;
  if (item.startDate && date < item.startDate) return false;
  if (item.endDate && date > item.endDate) return false;
  return (item.repeatDays || []).includes(dayKey(new Date(`${date}T00:00:00`)));
};
const parseTime = (value) => {
  const match = String(value || "")
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  if (match[3] === "AM" && hours === 12) hours = 0;
  if (match[3] === "PM" && hours !== 12) hours += 12;
  return hours * 60 + Number(match[2]);
};
const resolveStatus = (item) => {
  if (item.status === "Cancelled") return "Cancelled";
  const minutes = parseTime(item.endTime);
  if (minutes === null) return item.status || "Scheduled";
  const end = new Date(`${item.date}T00:00:00`);
  end.setMinutes(minutes);
  return Date.now() >= end.getTime() ? "Completed" : "Scheduled";
};
const statusTone = {
  Scheduled: "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function MySchedule() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const [view, setView] = useState("today");
  const [grade, setGrade] = useState("all");
  const [board, setBoard] = useState("all");
  const [mode, setMode] = useState("all");
  const [search, setSearch] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchTutorSchedule()
      .then((result) => {
        if (active) setSchedule(result.schedules);
      })
      .catch((requestError) => {
        if (active) {
          setSchedule([]);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const tutorSchedule = schedule;
  const range = useMemo(() => {
    if (view === "today") return [today, today];
    const tomorrow = addDays(today, 1);
    return [tomorrow, tomorrow];
  }, [today, view]);
  const occurrences = useMemo(() => {
    const records = [];
    for (
      let cursor = new Date(range[0]);
      cursor <= range[1];
      cursor = addDays(cursor, 1)
    ) {
      const date = dateKey(cursor);
      tutorSchedule.forEach((item) => {
        if (scheduleOccursOn(item, date)) {
          const record = { ...item, date };
          records.push({ ...record, resolvedStatus: resolveStatus(record) });
        }
      });
    }
    return records.sort((a, b) =>
      `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
    );
  }, [range, tutorSchedule]);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return occurrences.filter(
      (item) =>
        (grade === "all" || item.grade === grade) &&
        (board === "all" || item.board === board) &&
        (mode === "all" || item.mode === mode) &&
        (!query ||
          [
            item.batchName,
            item.subject,
            item.topic,
            item.location,
            item.board,
            item.grade,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          )),
    );
  }, [board, grade, mode, occurrences, search]);
  const uniqueOptions = (key, labelKey = key) =>
    [
      ...new Map(
        tutorSchedule.map((item) => [
          item[key],
          { value: item[key], label: item[labelKey] },
        ]),
      ).values(),
    ].filter((item) => item.value);
  const todayCount = tutorSchedule.filter(
    (item) =>
      item.status !== "Cancelled" && scheduleOccursOn(item, dateKey(today)),
  ).length;
  const completed = occurrences.filter(
    (item) => item.resolvedStatus === "Completed",
  ).length;
  const upcoming = occurrences.filter(
    (item) => item.resolvedStatus === "Scheduled",
  ).length;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="tutor-page-heading-icon is-schedule">
              <PortalIcon name="schedule" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                Teaching schedule
              </p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
                My Schedule
              </h1>
            </div>
          </div>
          <div className="w-fit rounded-2xl bg-violet-50 px-5 py-3">
            <p className="text-xs font-semibold text-violet-600">
              Today&apos;s classes
            </p>
            <strong className="mt-1 block text-2xl text-brand-navy">
              {todayCount}
            </strong>
          </div>
        </div>
      </section>
      <section className="tutor-dashboard-metrics" aria-label="Schedule summary">
        {[
          ["Assigned series", tutorSchedule.length, "schedule", "is-sky"],
          ["In selected view", occurrences.length, "view", "is-violet"],
          ["Completed", completed, "check", "is-emerald"],
          ["Upcoming", upcoming, "clock", "is-orange"],
        ].map(([label, value, icon, tone]) => (
          <article key={label} className={`tutor-summary-card tutor-static-metric ${tone}`}>
            <div className="tutor-summary-card-top">
              <div><p>{label}</p><strong>{value}</strong></div>
              <i><PortalIcon name={icon} className="h-5 w-5" /></i>
            </div>
          </article>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-semibold text-slate-500">
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Batch, subject or topic"
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-brand-navy outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Grade
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy"
            >
              <option value="all">Grade</option>
              {uniqueOptions("grade").map((item) => (
                <option key={item.value} value={item.value}>
                  Grade {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Board
            <select
              value={board}
              onChange={(event) => setBoard(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy"
            >
              <option value="all">Board</option>
              {uniqueOptions("board").map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Mode
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy"
            >
              <option value="all">Mode</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Schedule View
            <select
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
          </label>
        </div>
        {(search || grade !== "all" || board !== "all" || mode !== "all") && (
          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setGrade("all");
                setBoard("all");
                setMode("all");
              }}
              className="text-xs font-bold text-slate-600 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-brand-navy">
              Assigned Classes
            </h2>
            <p className="text-xs text-slate-500">
              Published by the administrator
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {visible.length} classes
          </span>
        </header>
        {error && (
          <div className="m-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setRefreshKey((value) => value + 1);
              }}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-xs">
            <thead className="bg-[#f6f7fb] text-slate-700">
              <tr>
                {[
                  "S.N.",
                  "Date & Day",
                  "Time",
                  "Batch",
                  "Grade & Board",
                  "Subject & Topic",
                  "Mode & Location",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border border-slate-300 px-4 py-3 font-bold tracking-wide"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item, index) => (
                <tr
                  key={`${item.id}-${item.date}`}
                  className="hover:bg-slate-50"
                >
                  <td className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-500">
                    {index + 1}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="block text-brand-navy">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </strong>
                    <span className="text-slate-400">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { weekday: "long" },
                      )}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border border-slate-200 px-4 py-3">
                    {item.startTime}–{item.endTime}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">
                      {item.batchName}
                    </strong>
                    <span className="block text-slate-400">
                      {item.academicSession?.name || "Academic session"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">
                      Grade {item.grade || "—"}
                    </strong>
                    <span className="block text-slate-400">
                      {item.board || "—"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">{item.subject}</strong>
                    <span className="block text-slate-400">
                      {item.topic || "Topic not added"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">{item.mode}</strong>
                    {item.mode === "Online" && item.meetingUrl ? (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-semibold text-sky-600"
                      >
                        Open meeting link
                      </a>
                    ) : (
                      <span className="block text-slate-400">
                        {item.location || "Location pending"}
                      </span>
                    )}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[item.resolvedStatus]}`}
                    >
                      {item.resolvedStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="px-6 py-14 text-center text-sm font-semibold text-slate-500">
              Loading your assigned classes...
            </div>
          )}
          {!loading && !error && !visible.length && (
            <div className="px-6 py-14 text-center">
              <h3 className="font-heading text-lg font-bold text-brand-navy">
                No assigned classes found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Change the view or ask the administrator to assign this tutor to
                a published class.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MySchedule;
