import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./demo-request.css";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminPagination from "../../../components/admin/AdminPagination";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import { fetchTutors } from "../../../services/tutorApi";
import { fetchGrades } from "../../../services/gradeApi";
import {
  fetchAdminDemoRequests,
  updateAdminDemoRequestStatus,
} from "../../../services/adminDemoRequestApi";
import "../board/board.css";

const PAGE_SIZE = 6;
const STATUS_FILTERS = [
  { value: "request", label: "Demo Request" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "admission", label: "Admission Process" },
];
const STATUS_STYLE = {
  New: "bg-violet-100 text-violet-700",
  Contacted: "bg-amber-100 text-amber-700",
  "Follow-up Required": "bg-orange-100 text-orange-700",
  "Demo Scheduled": "bg-sky-100 text-sky-700",
  "Completion Pending": "bg-rose-100 text-rose-700",
  "Demo Completed": "bg-indigo-100 text-indigo-700",
  "Student Absent": "bg-orange-100 text-orange-700",
  "Ready for Admission": "bg-fuchsia-100 text-fuchsia-700",
  Enrolled: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-200 text-slate-700",
  Closed: "bg-slate-200 text-slate-600",
};
const STATUS_LABEL = {
  New: "Demo Request",
  "Demo Scheduled": "Confirmed",
  "Ready for Admission": "Admission Process",
  Enrolled: "Student Created",
};
const TIME_LABELS = {
  morning: "Morning · 9 AM–12 PM",
  evening: "Evening · 4 PM–7 PM",
  flexible: "Flexible",
};
const MODE_LABELS = {
  offline: "Offline classroom",
  online: "Online live class",
  flexible: "Need guidance",
};
const INPUT =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10";
const formatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const nameOf = (lead) => lead.studentName || lead.name || "Unknown";
const exactTimeOptions = Array.from({ length: 21 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return [
    value,
    new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }),
  ];
});
const minutesOf = (value) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};
const normalizePreference = (value) =>
  String(value || "flexible").toLowerCase();
const preferenceAllows = (preference, value, isEnd = false) => {
  const normalized = normalizePreference(preference);
  const minutes = minutesOf(value);
  const configuredRange = normalized.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (configuredRange) {
    const start = minutesOf(configuredRange[1]);
    const end = minutesOf(configuredRange[2]);
    return isEnd
      ? minutes <= end && minutes > start
      : minutes >= start && minutes < end;
  }
  if (normalized === "flexible")
    return isEnd ? minutes <= 1140 : minutes < 1140;
  if (normalized === "morning") return isEnd ? minutes <= 720 : minutes < 720;
  return isEnd ? minutes <= 1140 : minutes < 1140 && minutes >= 960;
};
const dateValue = (date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
const parseDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);
const formatDate = (value) => {
  if (!value) return "Not selected";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Not selected" : formatter.format(date);
};
const effectiveStatus = (lead) => lead.status;
const statusGroup = (lead) => {
  const current = effectiveStatus(lead);
  if (current === "New") return "request";
  if (["Contacted", "Follow-up Required"].includes(current)) return "contacted";
  if (["Demo Scheduled", "Demo Completed", "Student Absent"].includes(current))
    return "confirmed";
  return "admission";
};
const matchesStatusFilter = (lead, filter) => {
  if (filter === "all") return true;
  if (STATUS_FILTERS.some((item) => item.value === filter))
    return statusGroup(lead) === filter;
  return effectiveStatus(lead) === filter;
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[status] ?? STATUS_STYLE.New}`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Detail({ label, children }) {
  return (
    <div className="demo-request-detail grid gap-1 border-b border-slate-100 py-2.5 last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-semibold leading-5 text-slate-700">
        {children || "Not provided"}
      </dd>
    </div>
  );
}

function LeadsAdmissions() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [tutorRecords, setTutorRecords] = useState([]);
  const [grades, setGrades] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [grade, setGrade] = useState("all");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [schedule, setSchedule] = useState({
    confirmedDate: "",
    startTime: "",
    endTime: "",
    demoSubject: "",
    demoMode: "offline",
    mentorId: "",
    accessDetail: "",
    adminNote: "",
  });
  const modalRef = useAccessibleModal(Boolean(selected), () =>
    setSelected(null),
  );
  const activeTutor = tutorRecords.filter(
    (member) => member.status === "Active",
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminDemoRequests(),
      fetchTutors(),
      fetchGrades(),
    ])
      .then(([records, tutors, gradeRecords]) => {
        if (!active) return;
        setLeads(records);
        setTutorRecords(tutors);
        setGrades(gradeRecords.filter((item) => item.status === "Active"));
      })
      .catch((error) => {
        if (active) setRequestError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const eligibleTutor = activeTutor.filter(
    (member) =>
      !selected ||
      ((!member.subjects?.length ||
        selected.subject === "All Subjects" ||
        selected.subject === "Need Guidance" ||
        selected.subject === "General Grade Demo" ||
        member.subjects.includes(selected.subject) ||
        (selected.subject === "Environmental Studies (EVS)" &&
          member.subjects.includes("EVS"))) &&
        (!selected.grade ||
          !member.grades?.length ||
          member.grades.includes(String(selected.grade))) &&
        (!selected.board ||
          !member.boards?.length ||
          member.boards.includes(selected.board))),
  );

  const demoLeads = useMemo(
    () => leads.filter((lead) => lead.type === "Demo"),
    [leads],
  );
  const gradeOptions = (() => {
    const options = new Map(
      grades.map((item) => [
        String(item.value ?? item.name?.replace(/\D/g, "")),
        item.name,
      ]),
    );
    demoLeads.forEach((lead) => {
      const value = String(lead.grade || "");
      if (value && !options.has(value)) options.set(value, `Grade ${value}`);
    });
    return [...options]
      .filter((item) => item[0])
      .map(([value, label]) => ({ value, label }));
  })();
  const filtered = useMemo(
    () =>
      demoLeads.filter((lead) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [
            lead.id,
            nameOf(lead),
            lead.parentName,
            lead.phone,
            lead.email,
            lead.subject,
          ].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          );
        return (
          matchesSearch &&
          matchesStatusFilter(lead, status) &&
          (grade === "all" || String(lead.grade) === grade)
        );
      }),
    [demoLeads, search, status, grade],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  );
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const refresh = async (id, changes) => {
    setRequestError("");
    try {
      const changedFromApi = await updateAdminDemoRequestStatus(
        id,
        changes.status,
      );
      const changed = { ...changes, ...changedFromApi };
      setLeads((current) =>
        current.map((lead) => (lead.id === id ? changed : lead)),
      );
      setSelected(changed);
      return changed;
    } catch (error) {
      setRequestError(error.message);
      return null;
    }
  };
  const saveSchedule = () => {
    if (
      !schedule.confirmedDate ||
      !schedule.startTime ||
      !schedule.endTime ||
      !schedule.demoSubject.trim() ||
      !schedule.demoMode ||
      !schedule.mentorId ||
      !schedule.accessDetail.trim()
    )
      return setScheduleError(
        "Date, exact start/end time, subject, mode, tutor and meeting link/room are required.",
      );
    if (minutesOf(schedule.endTime) <= minutesOf(schedule.startTime))
      return setScheduleError("End time must be after the start time.");
    if (
      !preferenceAllows(selected.preferredTime, schedule.startTime) ||
      !preferenceAllows(selected.preferredTime, schedule.endTime, true)
    )
      return setScheduleError(
        `Choose the complete demo slot inside the student's ${TIME_LABELS[normalizePreference(selected.preferredTime)] || "preferred"} window.`,
      );
    const mentor = activeTutor.find(
      (member) => member.id === schedule.mentorId,
    );
    const exactTime = `${schedule.startTime}–${schedule.endTime}`;
    refresh(selected.id, {
      status: "Demo Scheduled",
      confirmedDate: schedule.confirmedDate,
      confirmedTime: exactTime,
      confirmedStartTime: schedule.startTime,
      confirmedEndTime: schedule.endTime,
      confirmedSubject: schedule.demoSubject.trim(),
      confirmedMode: schedule.demoMode,
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.name,
      demoAccessDetail: schedule.accessDetail.trim(),
      scheduleNote: schedule.adminNote.trim(),
      demoScheduledAt: new Date().toISOString(),
      lastDemoAction: "Confirmed",
    });
    setShowSchedule(false);
  };
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setGrade("all");
    setPage(1);
  };
  const startAdmission = async () => {
    const changed = await refresh(selected.id, {
      status: "Ready for Admission",
      admissionStartedAt: new Date().toISOString(),
    });
    if (changed)
      navigate(`/admin/admissions?leadId=${encodeURIComponent(selected.id)}`);
  };

  return (
    <div className="admin-page board-page demo-request-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="scheduled" />
          </span>
          <div>
            <p>Admissions / Demo Requests</p>
            <h1>Demo Requests</h1>
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i />
            {loading ? "Loading…" : `${demoLeads.length} total requests`}
          </span>
        </div>
      </header>
      {requestError && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          role="alert"
        >
          {requestError}
        </div>
      )}
      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["All Requests", "all", "bg-slate-50 border-slate-200"],
          ["New", "request", "bg-violet-50 border-violet-200"],
          ["Confirmed", "confirmed", "bg-amber-50 border-amber-200"],
          [
            "Admission Process",
            "admission",
            "bg-emerald-50 border-emerald-200",
          ],
        ].map(([label, value, style]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`rounded-xl border p-3 text-left ${style} ${status === value ? "ring-2 ring-brand-gold" : ""}`}
          >
            <span className="text-[10px] font-semibold text-slate-500">
              {label}
            </span>
            <strong className="mt-1 block font-heading text-xl text-brand-navy">
              {value === "all"
                ? demoLeads.length
                : demoLeads.filter((lead) => statusGroup(lead) === value).length}
            </strong>
          </button>
        ))}
      </section>

      <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="board-directory-heading">
          <div>
            <h2>Demo Request Directory</h2>
            <p>Review requests, confirm demos and begin admissions.</p>
          </div>
          <strong>{filtered.length} results</strong>
        </header>
        <div className="board-filters demo-request-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search demo requests"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search student, parent or phone"
            />
          </label>
          {/* <select
            aria-label="Demo request status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Status</option>
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select> */}
          <select
            aria-label="Student grade"
            value={grade}
            onChange={(event) => {
              setGrade(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Grade</option>
            {gradeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Demo request status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Status</option>
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {(search ||
            status !== "all" ||
            grade !== "all") && (
            <button
              type="button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          )}
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">
            Loading demo requests…
          </div>
        ) : visible.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead className="bg-[#102044] text-white">
                  <tr>
                    {[
                      "Student",
                      "Grade & Board",
                      "Demo Details",
                      "Contact",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`border border-blue-300/20 px-4 py-3 ${["Status", "Action"].includes(heading) ? "text-center" : ""}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((lead) => (
                    <tr key={lead.id} className="hover:bg-blue-50/50">
                      <td className="border border-slate-200 px-4 py-3">
                        <p className="font-bold text-brand-navy">
                          {nameOf(lead)}
                        </p>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-700">
                          {lead.grade ? `Grade ${lead.grade}` : "Not selected"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {lead.board || "Board not selected"}
                          {lead.stream ? ` · ${lead.stream}` : ""}
                        </p>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-700">
                          {formatDate(
                            lead.confirmedDate ||
                              lead.preferredDate ||
                              lead.createdAt,
                          )}
                          {" · "}
                          {MODE_LABELS[lead.confirmedMode || lead.demoMode] ||
                            lead.confirmedMode ||
                            lead.demoMode ||
                            "Mode not selected"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {lead.confirmedTime ||
                            TIME_LABELS[
                              normalizePreference(lead.preferredTime)
                            ] ||
                            lead.preferredTime ||
                            "Time not selected"}
                          {lead.subject ? ` · ${lead.subject}` : ""}
                        </p>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-700">
                          {lead.parentName || "Not provided"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {lead.phone
                            ? `+91 ${lead.phone}`
                            : lead.email || "No contact"}
                        </p>
                      </td>
                      <td className="border border-slate-200 px-4 py-3 text-center">
                        <StatusBadge status={effectiveStatus(lead)} />
                      </td>
                      <td className="border border-slate-200 px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(lead);
                            setShowSchedule(false);
                          }}
                          aria-label={`View ${nameOf(lead)} demo request`}
                          title="View request"
                          className="admin-action-native demo-request-action !border-slate-200 !bg-slate-50 !text-slate-700"
                        >
                          <AdminActionIcon name="view" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              No leads found
            </h2>
          </div>
        )}
        <AdminPagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <section
              ref={modalRef}
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-title"
              className="demo-request-modal flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-4xl sm:rounded-3xl"
            >
              <header className="z-10 flex shrink-0 items-start justify-between gap-3 border-b bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase text-brand-gold-dark">
                    {selected.id}
                  </p>
                  <h2
                    id="lead-title"
                    className="break-words font-heading text-lg font-bold text-brand-navy sm:text-xl"
                  >
                    {nameOf(selected)}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <StatusBadge status={effectiveStatus(selected)} />
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    ✕
                  </button>
                </div>
              </header>
              <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <section className="demo-request-card rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">
                      Student & contact
                    </h3>
                    <dl className="mt-2">
                      <Detail label="Parent / Guardian">
                        {selected.parentName}
                      </Detail>
                      <Detail label="Phone">
                        {selected.phone
                          ? `+91 ${selected.phone}`
                          : "Not provided"}
                      </Detail>
                      <Detail label="Email">
                        {selected.email || "Optional · not provided"}
                      </Detail>
                      <Detail label="Grade & Board">
                        {selected.grade
                          ? `Grade ${selected.grade}`
                          : "Not selected"}{" "}
                        · {selected.board || "Board not selected"}
                      </Detail>
                      {Number(selected.grade) >= 11 && (
                        <Detail label="Stream">
                          {selected.stream || "Not selected"}
                        </Detail>
                      )}
                    </dl>
                  </section>
                  <section className="demo-request-card rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">
                      {selected.confirmedDate
                        ? "Confirmed demo"
                        : "Demo preference"}
                    </h3>
                    <dl className="mt-2">
                      <Detail label="Demo Subject">
                        {selected.confirmedSubject ||
                          selected.subject ||
                          "Not selected"}
                      </Detail>
                      <Detail label="Demo Mode">
                        {MODE_LABELS[
                          selected.confirmedMode || selected.demoMode
                        ] ||
                          selected.confirmedMode ||
                          selected.demoMode ||
                          "Not selected"}
                      </Detail>
                      <Detail
                        label={
                          selected.confirmedDate
                            ? "Demo Date"
                            : "Preferred Date"
                        }
                      >
                        {formatDate(
                          selected.confirmedDate || selected.preferredDate,
                        )}
                        {!selected.confirmedDate &&
                          " · Subject to availability"}
                      </Detail>
                      <Detail
                        label={
                          selected.confirmedDate
                            ? "Demo Time"
                            : "Preferred Time Window"
                        }
                      >
                        {selected.confirmedDate
                          ? selected.confirmedTime
                          : TIME_LABELS[
                              normalizePreference(selected.preferredTime)
                            ] ||
                            selected.preferredTime ||
                            "Not selected"}
                      </Detail>
                      {selected.confirmedDate && (
                        <Detail label="Tutor">
                          {selected.assignedMentorName}
                        </Detail>
                      )}
                      {selected.confirmedDate && (
                        <Detail
                          label={
                            selected.confirmedMode === "online"
                              ? "Meeting Link"
                              : "Room / Location"
                          }
                        >
                          {selected.demoAccessDetail}
                        </Detail>
                      )}
                    </dl>
                  </section>
                </div>
                {selected.message && (
                  <p className="mt-4 rounded-xl border p-4 text-sm text-slate-600">
                    <strong className="text-brand-navy">Student note:</strong>{" "}
                    {selected.message}
                  </p>
                )}
                {showSchedule && (
                  <section className="demo-request-schedule mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="font-heading font-semibold text-brand-navy">
                      Confirm demo booking
                    </h3>
                    <p className="mt-1 text-xs text-amber-800">
                      The student has already requested this date, slot and
                      tutor through Demo Setup. Verify the details and add the
                      meeting link or room before confirming.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-bold text-slate-600">
                        Confirmed Date
                        <DatePicker
                          selected={parseDate(schedule.confirmedDate)}
                          onChange={(date) =>
                            setSchedule((value) => ({
                              ...value,
                              confirmedDate: dateValue(date),
                            }))
                          }
                          minDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          className={`${INPUT} mt-2`}
                          wrapperClassName="w-full"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Mode
                        <select
                          value={schedule.demoMode}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              demoMode: event.target.value,
                              accessDetail: "",
                            }))
                          }
                          className={`${INPUT} mt-2`}
                        >
                          <option value="offline">Offline classroom</option>
                          <option value="online">Online live class</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Exact Start Time
                        <select
                          value={schedule.startTime}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              startTime: event.target.value,
                              endTime: "",
                            }))
                          }
                          className={`${INPUT} mt-2`}
                        >
                          <option value="">Select start time</option>
                          {exactTimeOptions
                            .filter(([value]) =>
                              preferenceAllows(selected.preferredTime, value),
                            )
                            .map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Exact End Time
                        <select
                          value={schedule.endTime}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              endTime: event.target.value,
                            }))
                          }
                          className={`${INPUT} mt-2`}
                        >
                          <option value="">Select end time</option>
                          {exactTimeOptions
                            .filter(
                              ([value]) =>
                                schedule.startTime &&
                                minutesOf(value) >
                                  minutesOf(schedule.startTime) &&
                                preferenceAllows(
                                  selected.preferredTime,
                                  value,
                                  true,
                                ),
                            )
                            .map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Demo Subject
                        <input
                          value={schedule.demoSubject}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              demoSubject: event.target.value,
                              mentorId: "",
                            }))
                          }
                          className={`${INPUT} mt-2`}
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Assigned Tutor
                        <select
                          value={schedule.mentorId}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              mentorId: event.target.value,
                            }))
                          }
                          className={`${INPUT} mt-2`}
                        >
                          <option value="">Select suitable tutor</option>
                          {eligibleTutor.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} · {member.designation}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                        {schedule.demoMode === "online"
                          ? "Meeting Link"
                          : "Room / Location"}
                        <input
                          value={schedule.accessDetail}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              accessDetail: event.target.value,
                            }))
                          }
                          placeholder={
                            schedule.demoMode === "online"
                              ? "https://meet.google.com/..."
                              : "Room 2 / TuitionSphere centre"
                          }
                          className={`${INPUT} mt-2`}
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                        Admin Note (Optional)
                        <textarea
                          value={schedule.adminNote}
                          onChange={(event) =>
                            setSchedule((value) => ({
                              ...value,
                              adminNote: event.target.value,
                            }))
                          }
                          rows="2"
                          className="mt-2 w-full rounded-xl border p-3 text-sm outline-none focus:border-brand-gold"
                        />
                      </label>
                    </div>
                    {scheduleError && (
                      <p className="mt-3 text-xs font-bold text-red-600">
                        {scheduleError}
                      </p>
                    )}
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSchedule(false)}
                        className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveSchedule}
                        className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white"
                      >
                        Confirm Demo Booking
                      </button>
                    </div>
                  </section>
                )}
              </div>
              <footer className="demo-request-footer z-10 flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] sm:flex-row sm:flex-wrap sm:px-5">
                {selected.status === "New" && (
                  <button
                    type="button"
                    onClick={() =>
                      refresh(selected.id, {
                        status: "Contacted",
                        contactedAt: new Date().toISOString(),
                      })
                    }
                    className="min-h-11 w-full rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white sm:w-auto"
                  >
                    Mark as Contacted
                  </button>
                )}
                {["Contacted", "Follow-up Required"].includes(
                  selected.status,
                ) &&
                  !showSchedule && (
                    <button
                      type="button"
                      onClick={() =>
                        refresh(selected.id, {
                          status: "Demo Scheduled",
                          confirmedDate: selected.preferredDate,
                          confirmedTime: selected.preferredTime,
                          confirmedStartTime: selected.requestedStartTime,
                          confirmedEndTime: selected.requestedEndTime,
                          confirmedSubject: selected.subject,
                          confirmedMode: selected.demoMode,
                          demoScheduledAt: new Date().toISOString(),
                        })
                      }
                      className="min-h-11 w-full rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy sm:w-auto"
                    >
                      Confirm Demo
                    </button>
                  )}
                {[
                  "Demo Scheduled",
                  "Demo Completed",
                  "Student Absent",
                ].includes(selected.status) &&
                  !showSchedule && (
                    <button
                      type="button"
                      onClick={startAdmission}
                      className="min-h-11 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white sm:w-auto"
                    >
                      Start Admission Process →
                    </button>
                  )}
                {selected.status === "Ready for Admission" && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/admissions?leadId=${encodeURIComponent(selected.id)}`,
                      )
                    }
                    className="min-h-11 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white sm:w-auto"
                  >
                    Continue Admission →
                  </button>
                )}
                {selected.status === "Enrolled" && selected.studentId && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/students/${selected.studentId}`)
                    }
                    className="min-h-11 w-full rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white sm:w-auto"
                  >
                    Open Student Profile →
                  </button>
                )}
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default LeadsAdmissions;
