import { useEffect, useMemo, useState } from "react";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchStudentSchedule } from "../../services/studentScheduleApi";

const pad = (value) => String(value).padStart(2, "0");
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date, count) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};
const formatDate = (date, options = { day: "numeric", month: "short", year: "numeric" }) =>
  date.toLocaleDateString("en-IN", options);
const minutes = (value) => {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
};

function scheduleOccursOn(item, date) {
  const key = dateKey(date);
  if (key < item.startDate || key > item.endDate) return false;
  if (item.scheduleType === "SINGLE") return key === item.startDate;
  return item.repeatDays.includes(formatDate(date, { weekday: "long" }).toLowerCase());
}

function classStatus(item, date, today) {
  if (item.status === "Cancelled") return "Cancelled";
  if (dateKey(date) < dateKey(today)) return "Completed";
  if (dateKey(date) > dateKey(today)) return "Scheduled";
  return today.getHours() * 60 + today.getMinutes() >= minutes(item.endTime)
    ? "Completed" : "Scheduled";
}

const statusStyle = {
  Scheduled: "bg-sky-100 text-sky-700",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-rose-100 text-rose-700",
};
const subjectStyles = [
  "border-blue-200 bg-blue-50 text-blue-900",
  "border-emerald-200 bg-emerald-50 text-emerald-900",
  "border-violet-200 bg-violet-50 text-violet-900",
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-cyan-200 bg-cyan-50 text-cyan-900",
  "border-rose-200 bg-rose-50 text-rose-900",
  "border-indigo-200 bg-indigo-50 text-indigo-900",
];
const canJoinClass = (item, date, today, status) =>
  item.mode === "Online" && item.meetingUrl &&
  dateKey(date) === dateKey(today) && status === "Scheduled";

function WeeklyClassCard({ entry, today, tone }) {
  const { item, date, status } = entry;
  return (
    <div className={`rounded-xl border p-2.5 shadow-sm ${tone}`}>
      <strong className="block break-words text-xs font-bold leading-5">{item.subject}</strong>
      <span className="mt-0.5 block break-words text-[11px] leading-4 opacity-80">
        {item.mentor || "Academic Team"}
      </span>
      {item.topic && <span className="mt-1 block break-words text-[10px] leading-4 opacity-70">{item.topic}</span>}
      <span className="mt-1.5 block break-words text-[10px] leading-4 opacity-75">
        {item.mode}{item.mode !== "Online" && item.location ? ` · ${item.location}` : ""}
      </span>
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[status]}`}>
        {status}
      </span>
      {canJoinClass(item, date, today, status) && (
        <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer"
          className="mt-2 block rounded-lg bg-brand-navy px-2 py-1.5 text-center text-[10px] font-bold text-white no-underline">
          Join class
        </a>
      )}
    </div>
  );
}

function ClassSchedule() {
  const [view, setView] = useState("weekly");
  const [today, setToday] = useState(() => new Date());
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      setToday(new Date());
      try {
        const result = await fetchStudentSchedule();
        if (active) {
          setContext(result);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const weekDays = useMemo(() => {
    const weekday = today.getDay();
    const monday = addDays(today, weekday === 0 ? -6 : 1 - weekday);
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [today]);
  const visibleDays = view === "weekly" ? weekDays : [addDays(today, view === "tomorrow" ? 1 : 0)];
  const schedules = context?.schedules || [];
  const rows = visibleDays.flatMap((date) =>
    schedules
      .filter((item) => scheduleOccursOn(item, date))
      .sort((a, b) => minutes(a.startTime) - minutes(b.startTime))
      .map((item) => ({ item, date, status: classStatus(item, date, today) }))
  );
  const timeSlots = [...new Map(rows.map(({ item }) => [
    `${item.startTime}|${item.endTime}`,
    { startTime: item.startTime, endTime: item.endTime },
  ])).values()].sort((a, b) =>
    minutes(a.startTime) - minutes(b.startTime) || minutes(a.endTime) - minutes(b.endTime)
  );
  const subjects = [...new Set(rows.map(({ item }) => item.subject))].sort();
  const subjectTone = (subject) => subjectStyles[subjects.indexOf(subject) % subjectStyles.length];
  const enrollment = context?.enrollment;
  const heading = view === "weekly" ? "Weekly schedule"
    : view === "tomorrow" ? "Tomorrow’s classes" : "Today’s classes";
  const period = view === "weekly"
    ? `${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`
    : formatDate(visibleDays[0], { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading class schedule…</div>;
  if (!context) return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error || "Unable to load class schedule."}</div>;

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}

      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
            <PortalIcon name="schedule" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-dark">Learning schedule</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-brand-navy">Class Schedule</h1>
            <p className="mt-1 text-xs text-slate-500">
              {enrollment ? `${enrollment.batchName} · ${enrollment.board} · ${enrollment.learningMode}` : "Batch not assigned"}
            </p>
          </div>
        </div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Schedule view
          <select value={view} onChange={(event) => setView(event.target.value)}
            className="mt-1.5 block h-10 w-full min-w-40 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold normal-case tracking-normal text-brand-navy outline-none focus:border-violet-400 sm:w-40">
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Class schedule table">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-brand-navy">{heading}</h2>
            <p className="mt-1 text-xs text-slate-500">{period}</p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-bold text-violet-700">
            {rows.length} {rows.length === 1 ? "class" : "classes"}
          </span>
        </div>

        {view === "weekly" ? (
          <>
            <p className="border-b border-slate-100 px-5 py-2 text-[11px] text-slate-500 lg:hidden">
              Scroll sideways to see the full week.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-xs">
                <caption className="sr-only">Classes by time and day for {period}</caption>
                <colgroup>
                  <col className="w-32" />
                  {weekDays.map((date) => <col key={dateKey(date)} />)}
                </colgroup>
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 border-r border-white/20 bg-brand-navy px-4 py-3.5">Time</th>
                    {weekDays.map((date) => (
                      <th key={dateKey(date)} scope="col" className="border-r border-white/20 px-3 py-3.5 last:border-r-0">
                        <span className="block font-bold">{formatDate(date, { weekday: "short" })}</span>
                        <span className="mt-0.5 block font-normal text-white/70">{formatDate(date)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!enrollment || !timeSlots.length ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      {enrollment ? "No classes scheduled this week." : "Your batch is not assigned yet."}
                    </td></tr>
                  ) : timeSlots.map(({ startTime, endTime }) => (
                    <tr key={`${startTime}-${endTime}`}>
                      <th scope="row" className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-4 py-4 align-top text-brand-navy">
                        <span className="block font-bold">{startTime}</span>
                        <span className="mt-0.5 block text-[11px] font-medium text-slate-500">to {endTime}</span>
                      </th>
                      {weekDays.map((date) => {
                        const classes = rows.filter(({ item, date: classDate }) =>
                          dateKey(classDate) === dateKey(date) &&
                          item.startTime === startTime && item.endTime === endTime
                        );
                        return (
                          <td key={dateKey(date)} className={`border-b border-r border-slate-200 p-2 align-top last:border-r-0 ${dateKey(date) === dateKey(today) ? "bg-amber-50/50" : "bg-white"}`}>
                            {classes.length ? (
                              <div className="space-y-2">
                                {classes.map((entry) => (
                                  <WeeklyClassCard key={entry.item.id} entry={entry} today={today} tone={subjectTone(entry.item.subject)} />
                                ))}
                              </div>
                            ) : <span className="block py-5 text-center text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-4">
                <span className="mr-1 text-[11px] font-bold text-slate-500">Subjects</span>
                {subjects.map((subject) => (
                  <span key={subject} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${subjectTone(subject)}`}>{subject}</span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="border-r border-slate-200 px-5 py-3">Day & date</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">Time</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">Subject & topic</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">Tutor</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">Mode / location</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Class link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!enrollment || rows.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">
                  {enrollment ? "No classes scheduled for this selection." : "Your batch is not assigned yet."}
                </td></tr>
              ) : rows.map(({ item, date, status }) => {
                const canJoin = canJoinClass(item, date, today, status);
                return (
                  <tr key={`${item.id}-${dateKey(date)}`} className={dateKey(date) === dateKey(today) ? "bg-amber-50/40" : "hover:bg-slate-50/70"}>
                    <td className="whitespace-nowrap border-r border-slate-200 px-5 py-4 align-top">
                      <strong className="block text-brand-navy">{formatDate(date, { weekday: "long" })}</strong>
                      <span className="mt-1 block text-[11px] text-slate-500">{formatDate(date)}</span>
                    </td>
                    <td className="whitespace-nowrap border-r border-slate-200 px-4 py-4 font-semibold text-slate-700 align-top">{item.startTime} – {item.endTime}</td>
                    <td className="min-w-40 border-r border-slate-200 px-4 py-4 align-top">
                      <strong className="block text-brand-navy">{item.subject}</strong>
                      <span className="mt-1 block text-[11px] text-slate-500">{item.topic || "Class session"}</span>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4 text-slate-700 align-top">{item.mentor || "Academic Team"}</td>
                    <td className="border-r border-slate-200 px-4 py-4 text-slate-700 align-top">
                      <span className="font-semibold">{item.mode}</span>
                      {item.mode !== "Online" && item.location && <span className="mt-1 block text-[11px] text-slate-500">{item.location}</span>}
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[status]}`}>{status}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {canJoin ? <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-bold text-white no-underline hover:bg-brand-navy-light">
                        Join class <PortalIcon name="arrow" className="h-3 w-3" />
                      </a> : <span className="text-[11px] text-slate-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </section>

      <p className="px-1 text-xs text-slate-500">
        <strong className="text-brand-navy">Your batch:</strong> {enrollment?.batchName || "Not assigned"}
        {enrollment && ` · Grade ${enrollment.grade} ${enrollment.board} · ${enrollment.learningMode}`}
        {context.studentCode && ` · Student ID ${context.studentCode}`}
      </p>
    </div>
  );
}

export default ClassSchedule;
