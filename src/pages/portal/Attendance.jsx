import { Fragment, useEffect, useMemo, useState } from "react";
import PortalIcon from "../../components/portal/PortalIcon";
import useAccessibleModal from "../../hooks/useAccessibleModal";
import { scheduledSessions } from "../../services/attendanceApi";
import { cancelStudentLeave, fetchStudentAttendance, submitStudentLeave } from "../../services/studentAttendanceApi";

const attendanceTone = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-rose-100 text-rose-700",
  Leave: "bg-violet-100 text-violet-700",
};
const leaveTone = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Cancelled: "bg-slate-100 text-slate-600",
};
const EMPTY_ROWS = [];
const formatDate = (
  value,
  options = { day: "numeric", month: "short", year: "numeric" },
) => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", options);
const formatMonth = (value) => {
  const [year, month] = value.split("-");
  return new Date(+year, +month - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

function SessionSummary({ sessions }) {
  return (
    <div className="mx-auto grid max-w-xl divide-y divide-slate-200 text-center">
      {sessions.map((session) => (
        <div
          key={session.id ?? session.classId}
          className="px-1 py-2 first:pt-0 last:pb-0"
        >
          <strong className="text-xs text-brand-navy">{session.subject}</strong>
          <span className="ml-2 text-[10px] text-slate-500">
            ({session.topic || "Scheduled class"})
          </span>
        </div>
      ))}
    </div>
  );
}

function SessionTimes({ sessions }) {
  return (
    <div className="grid divide-y divide-slate-200">
      {sessions.map((session) => (
        <div
          key={session.id ?? session.classId}
          className="flex min-h-8 items-center justify-center px-1 py-2 text-[10px] font-semibold text-brand-navy first:pt-0 last:pb-0"
        >
          <span>
            {session.startTime || "Not set"}
            {session.endTime ? ` – ${session.endTime}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function ViewDetailsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditRequestIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function Attendance() {
  const [attendanceContext, setAttendanceContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const enrollment = attendanceContext?.enrollment;
  const batchId = enrollment?.batchId || "";
  const records = attendanceContext?.records || EMPTY_ROWS;
  const requests = attendanceContext?.requests || EMPTY_ROWS;
  const [activeTab, setActiveTab] = useState("attendance");
  const months = useMemo(
    () =>
      [...new Set(records.map((item) => item.date.slice(0, 7)))]
        .sort()
        .reverse(),
    [records],
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("all");
  const [leaveMonthFilter, setLeaveMonthFilter] = useState("all");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [form, setForm] = useState({
    duration: "Single Day",
    fromDate: "",
    toDate: "",
    type: "Medical",
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const leaveRef = useAccessibleModal(leaveOpen, () => setLeaveOpen(false));
  const detailsRef = useAccessibleModal(Boolean(detailsRequest), () =>
    setDetailsRequest(null),
  );
  const toDate = form.duration === "Single Day" ? form.fromDate : form.toDate;
  const previewSessions =
    form.fromDate && toDate && toDate >= form.fromDate &&
    new Date(toDate) - new Date(form.fromDate) <= 366 * 86400000
      ? scheduledSessions(attendanceContext?.schedules || [], batchId, form.fromDate, toDate)
      : [];
  const monthRecords = records.filter((item) =>
    item.date.startsWith(selectedMonth),
  );
  const groupsByDate = monthRecords.reduce((groups, item) => {
    const group = groups[item.date] ?? {
      date: item.date,
      sessions: [],
      statuses: [],
    };
    group.sessions.push(item);
    if (!group.statuses.includes(item.status)) group.statuses.push(item.status);
    groups[item.date] = group;
    return groups;
  }, {});
  const groupedRecords = Object.values(groupsByDate)
    .filter(
      (group) =>
        statusFilter === "all" || group.statuses.includes(statusFilter),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const present = monthRecords.filter(
    (item) => item.status === "Present",
  ).length;
  const absent = monthRecords.filter((item) => item.status === "Absent").length;
  const leaveSessions = monthRecords.filter(
    (item) => item.status === "Leave",
  ).length;
  const attendanceRate =
    present + absent ? Math.round((present / (present + absent)) * 100) : 0;
  const leaveMonths = [
    ...new Set(requests.map((request) => request.fromDate.slice(0, 7))),
  ]
    .sort()
    .reverse();
  const visibleLeaveRequests = requests
    .filter(
      (request) =>
        (leaveStatusFilter === "all" || request.status === leaveStatusFilter) &&
        (leaveMonthFilter === "all" ||
          request.fromDate.startsWith(leaveMonthFilter)),
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const leaveCounts = ["Pending", "Approved", "Rejected"].reduce(
    (summary, status) => ({
      ...summary,
      [status]: requests.filter((request) => request.status === status).length,
    }),
    {},
  );

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const result = await fetchStudentAttendance();
        if (!active) return;
        setAttendanceContext(result);
        setPageError("");
        const availableMonths = [...new Set(result.records.map((item) => item.date.slice(0, 7)))].sort().reverse();
        setSelectedMonth((current) => availableMonths.includes(current) ? current : availableMonths[0] || current);
      } catch (error) {
        if (active) setPageError(error.message);
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

  const openNewRequest = () => {
    setEditingRequestId(null);
    setForm({
      duration: "Single Day",
      fromDate: "",
      toDate: "",
      type: "Medical",
      reason: "",
    });
    setFormError("");
    setLeaveOpen(true);
  };
  const openEditRequest = (request) => {
    if (request.status !== "Pending") return;
    setEditingRequestId(request.id);
    setForm({
      duration:
        request.fromDate === request.toDate ? "Single Day" : "Multiple Days",
      fromDate: request.fromDate,
      toDate: request.fromDate === request.toDate ? "" : request.toDate,
      type: request.type,
      reason: request.reason,
    });
    setFormError("");
    setDetailsRequest(null);
    setLeaveOpen(true);
  };

  const submitLeave = async (event) => {
    event.preventDefault();
    if (saving) return;
    setFormError("");
    if (!form.fromDate || !toDate || toDate < form.fromDate)
      return setFormError("Select a valid leave date or date range.");
    if (form.reason.trim().length < 10)
      return setFormError("Please enter a reason of at least 10 characters.");
    setSaving(true);
    try {
      const values = {
        fromDate: form.fromDate,
        toDate,
        type: form.type,
        reason: form.reason.trim(),
      };
      const updated = await submitStudentLeave(values, editingRequestId);
      setAttendanceContext(updated);
      setLeaveOpen(false);
      setEditingRequestId(null);
      setForm({
        duration: "Single Day",
        fromDate: "",
        toDate: "",
        type: "Medical",
        reason: "",
      });
      setMessage(
        editingRequestId
          ? "Leave request updated and sent for admin review."
          : "Leave request sent for admin approval.",
      );
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };
  const cancelRequest = async (id) => {
    if (saving) return;
    setSaving(true);
    setPageError("");
    try {
      setAttendanceContext(await cancelStudentLeave(id));
      setDetailsRequest(null);
      setMessage("Leave request cancelled.");
    } catch (error) {
      setDetailsRequest(null);
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading attendance…</div>;
  if (!attendanceContext) return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{pageError || "Unable to load attendance."}</div>;

  return (
    <div className="-mt-1">
      {pageError && <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{pageError}</p>}
      <header className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="portal-attendance-heading-icon">
            <PortalIcon name="attendance" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
              Attendance & Leave
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy">
              {activeTab === "attendance" ? "My Attendance" : "My Leave Requests"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {activeTab === "attendance"
                ? `${enrollment?.batchName || "Batch not assigned"} · ${formatMonth(selectedMonth)}`
                : "Request leave and track approval status"}
            </p>
          </div>
        </div>
        {activeTab === "leave" && (
          <button
            type="button"
            onClick={openNewRequest}
            disabled={!batchId || saving}
            className="min-h-11 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white disabled:opacity-40"
          >
            + Request Leave
          </button>
        )}
      </header>
      {message && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          ✓ {message}
        </div>
      )}
      <nav
        className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        aria-label="Attendance views"
      >
        {[
          ["attendance", "Attendance Records"],
          ["leave", `Leave Requests (${leaveCounts.Pending})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`rounded-lg px-4 py-2.5 text-xs font-bold transition ${activeTab === value ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {activeTab === "attendance" ? (
        <>
          <section className="portal-attendance-metrics mt-3" aria-label="Attendance summary">
            {[
              ["Attendance", `${attendanceRate}%`, "attendance", "portal-metric-sky"],
              ["Classes Held", monthRecords.length, "schedule", "portal-metric-violet"],
              ["Present", present, "check", "portal-metric-emerald"],
              ["Absent", absent, "close", "portal-metric-rose"],
              ["Leave Taken", leaveSessions, "clock", "portal-metric-orange"],
            ].map(([label, value, icon, tone]) => (
              <article key={label} className={`portal-attendance-metric ${tone}`}>
                <div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
                <i><PortalIcon name={icon} className="h-5 w-5" /></i>
              </article>
            ))}
          </section>
          <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-lg font-semibold text-brand-navy">
                Attendance Records
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 px-3 text-xs font-semibold"
                >
                  {months.length ? (
                    months.map((month) => (
                      <option key={month} value={month}>
                        {formatMonth(month)}
                      </option>
                    ))
                  ) : (
                    <option value={selectedMonth}>
                      {formatMonth(selectedMonth)}
                    </option>
                  )}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 px-3 text-xs font-semibold"
                >
                  <option value="all">Records</option>
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Leave</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[940px] border-collapse text-center text-xs">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[11%]" />
                  <col className="w-[40%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-[#102044] text-white">
                  <tr>
                    {[
                      "Date",
                      "Day",
                      "Scheduled Sessions",
                      "Time",
                      "Attendance",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border border-blue-300/25 px-4 py-3 text-center"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedRecords.map((group) => {
                    const mixed = group.statuses.length > 1;
                    const expanded = expandedDate === group.date;
                    return (
                      <Fragment key={group.date}>
                        <tr className="hover:bg-slate-50/70">
                          <td className="border border-slate-200 px-4 py-4 text-center font-semibold text-brand-navy">
                            {formatDate(group.date, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="border border-slate-200 px-4 py-4 text-center font-semibold text-slate-600">
                            {formatDate(group.date, { weekday: "long" })}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            <SessionSummary sessions={group.sessions} />
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center">
                            <SessionTimes sessions={group.sessions} />
                          </td>
                          <td className="border border-slate-200 px-4 py-4 text-center">
                            {mixed ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold text-amber-800">
                                Mixed
                              </span>
                            ) : (
                              group.statuses.map((status) => (
                                <span
                                  key={status}
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${attendanceTone[status] ?? "bg-slate-100 text-slate-600"}`}
                                >
                                  {status}
                                </span>
                              ))
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDate(expanded ? null : group.date)
                              }
                              aria-expanded={expanded}
                              title="View session details"
                              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-brand-navy"
                            >
                              {expanded ? "−" : "+"}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td
                              colSpan="6"
                              className="border border-slate-200 bg-slate-50 px-5 py-3"
                            >
                              <div className="grid gap-2 sm:grid-cols-2">
                                {group.sessions.map((session) => (
                                  <div
                                    key={session.id ?? session.classId}
                                    className="rounded-xl border border-slate-200 bg-white p-3 text-left"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <span>
                                        <strong className="text-xs text-brand-navy">
                                          {session.subject}
                                          <span className="ml-2 font-medium text-slate-500">
                                            (
                                            {session.topic || "Scheduled class"}
                                            )
                                          </span>
                                        </strong>
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                          {session.startTime ||
                                            "Time not available"}
                                          {session.endTime
                                            ? ` – ${session.endTime}`
                                            : ""}
                                        </span>
                                      </span>
                                      <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${attendanceTone[session.status] ?? "bg-slate-100 text-slate-600"}`}
                                      >
                                        {session.status}
                                      </span>
                                    </div>
                                    <dl className="mt-2 grid gap-1 border-t border-slate-100 pt-2 text-[10px] sm:grid-cols-3">
                                      <div>
                                        <dt className="text-slate-400">
                                          Tutor
                                        </dt>
                                        <dd className="font-semibold text-brand-navy">
                                          {session.mentor ||
                                            session.tutorName ||
                                            "Assigned tutor"}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-slate-400">Mode</dt>
                                        <dd className="font-semibold text-brand-navy">
                                          {session.mode || "Not set"}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-slate-400">
                                          Location
                                        </dt>
                                        <dd className="font-semibold text-brand-navy">
                                          {session.location ||
                                            (session.mode === "Online"
                                              ? "Online classroom"
                                              : "Not set")}
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!groupedRecords.length && (
              <div className="p-10 text-center text-xs text-slate-500">
                No attendance records match the selected filters.
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="portal-attendance-metrics portal-leave-metrics mt-3" aria-label="Leave request summary">
            {[
              ["Total Requests", requests.length, "assignments", "portal-metric-sky"],
              ["Pending", leaveCounts.Pending, "clock", "portal-metric-orange"],
              ["Approved", leaveCounts.Approved, "check", "portal-metric-emerald"],
              ["Rejected", leaveCounts.Rejected, "close", "portal-metric-rose"],
            ].map(([label, value, icon, tone]) => (
              <article key={label} className={`portal-attendance-metric ${tone}`}>
                <div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
                <i><PortalIcon name={icon} className="h-5 w-5" /></i>
              </article>
            ))}
          </section>
          <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-lg font-semibold text-brand-navy">
                Leave Requests
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={leaveMonthFilter}
                  onChange={(event) => setLeaveMonthFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 px-3 text-xs font-semibold"
                >
                  <option value="all">Month</option>
                  {leaveMonths.map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))}
                </select>
                <select
                  value={leaveStatusFilter}
                  onChange={(event) => setLeaveStatusFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 px-3 text-xs font-semibold"
                >
                  <option value="all">Status</option>
                  {["Pending", "Approved", "Rejected", "Cancelled"].map(
                    (status) => (
                      <option key={status}>{status}</option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead className="bg-[#102044] text-white">
                  <tr>
                    {[
                      "Leave Period",
                      "Type & Reason",
                      "Sessions",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`border border-blue-300/25 px-4 py-3 ${index > 2 ? "text-center" : ""}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleLeaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/70">
                      <td className="border border-slate-200 px-4 py-4 font-semibold text-brand-navy">
                        {formatDate(request.fromDate)}
                        <span className="block text-[10px] font-normal text-slate-400">
                          to {formatDate(request.toDate)}
                        </span>
                      </td>
                      <td className="max-w-[340px] border border-slate-200 px-4 py-4">
                        <strong>{request.type}</strong>
                        <span
                          className="block truncate text-[10px] text-slate-400"
                          title={request.reason}
                        >
                          {request.reason}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-4">
                        {request.affectedSessions.length} sessions
                      </td>
                      <td className="border border-slate-200 px-4 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${leaveTone[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailsRequest(request)}
                            aria-label={`View leave request from ${formatDate(request.fromDate)}`}
                            title="View details"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 text-sky-700"
                          >
                            <ViewDetailsIcon />
                          </button>
                          {request.status === "Pending" && (
                            <button
                              type="button"
                              onClick={() => openEditRequest(request)}
                              aria-label={`Edit leave request from ${formatDate(request.fromDate)}`}
                              title="Edit pending request"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700"
                            >
                              <EditRequestIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!visibleLeaveRequests.length && (
              <div className="p-10 text-center text-xs text-slate-500">
                No leave requests match the selected filters.
              </div>
            )}
          </section>
        </>
      )}
      {leaveOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm">
          <form
            ref={leaveRef}
            onSubmit={submitLeave}
            role="dialog"
            aria-modal="true"
            tabIndex="-1"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-brand-gold-dark">
                  Attendance Support
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold text-brand-navy">
                  {editingRequestId ? "Edit Leave Request" : "Request Leave"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLeaveOpen(false)}
                aria-label="Close"
                className="rounded-lg bg-slate-100 p-2"
              >
                <PortalIcon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Duration
                <select
                  value={form.duration}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      duration: event.target.value,
                      toDate: "",
                    })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3"
                >
                  <option>Single Day</option>
                  <option>Multiple Days</option>
                </select>
              </label>
              <label className="text-xs font-semibold">
                Leave Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3"
                >
                  <option>Medical</option>
                  <option>Family Emergency</option>
                  <option>Personal</option>
                  <option>School Examination</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-xs font-semibold">
                From Date
                <input
                  required
                  type="date"
                  value={form.fromDate}
                  onChange={(event) =>
                    setForm({ ...form, fromDate: event.target.value })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3"
                />
              </label>
              {form.duration === "Multiple Days" && (
                <label className="text-xs font-semibold">
                  To Date
                  <input
                    required
                    type="date"
                    min={form.fromDate}
                    value={form.toDate}
                    onChange={(event) =>
                      setForm({ ...form, toDate: event.target.value })
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3"
                  />
                </label>
              )}
              <label className="text-xs font-semibold sm:col-span-2">
                Reason
                <textarea
                  required
                  minLength="10"
                  rows="3"
                  value={form.reason}
                  onChange={(event) =>
                    setForm({ ...form, reason: event.target.value })
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 p-3"
                />
              </label>
            </div>
            {form.fromDate && toDate && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <strong className="text-xs text-brand-navy">
                  Classes covered automatically
                </strong>
                {previewSessions.length ? (
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                    {previewSessions.map((session) => (
                      <li key={`${session.classId}-${session.date}`}>
                        •{" "}
                        {formatDate(session.date, {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {session.subject} · {session.startTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-amber-700">
                    No classes scheduled in this period.
                  </p>
                )}
              </div>
            )}
            {formError && (
              <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {formError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLeaveOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!previewSessions.length || saving}
                className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : editingRequestId ? "Update Request" : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      )}
      {detailsRequest && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-navy/60 p-4">
          <section
            ref={detailsRef}
            role="dialog"
            aria-modal="true"
            tabIndex="-1"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none"
          >
            <div className="flex justify-between">
              <h2 className="font-heading text-lg font-bold text-brand-navy">
                Leave Request
              </h2>
              <button type="button" onClick={() => setDetailsRequest(null)}>
                ✕
              </button>
            </div>
            <dl className="mt-4 grid gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Dates</dt>
                <dd className="font-semibold">
                  {detailsRequest.fromDate} – {detailsRequest.toDate}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-slate-400">Reason</dt>
                <dd className="font-semibold [overflow-wrap:anywhere]">{detailsRequest.reason}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd className="font-semibold">{detailsRequest.status}</dd>
              </div>
              {detailsRequest.rejectionReason && (
                <div className="min-w-0">
                  <dt className="text-slate-400">Rejection reason</dt>
                  <dd className="font-semibold text-rose-700 [overflow-wrap:anywhere]">
                    {detailsRequest.rejectionReason}
                  </dd>
                </div>
              )}
            </dl>
            {detailsRequest.status === "Pending" && (
              <button
                type="button"
                onClick={() => cancelRequest(detailsRequest.id)}
                disabled={saving}
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700"
              >
                Cancel Request
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Attendance;
