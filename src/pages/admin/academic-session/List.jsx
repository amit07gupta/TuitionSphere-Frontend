import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import {
  activateAcademicSessionApi,
  archiveAcademicSessionApi,
  createAcademicSession,
  fetchAcademicSessions,
  updateAcademicSession,
} from "../../../services/academicSessionApi";
import "./academic-session.css";

const emptyForm = {
  name: "",
  startDate: "",
  endDate: "",
  status: "Upcoming",
};
const statusTone = {
  Active: "bg-emerald-100 text-emerald-700",
  Upcoming: "bg-sky-100 text-sky-700",
  Completed: "bg-violet-100 text-violet-700",
  Archived: "bg-slate-200 text-slate-600",
};
const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const toDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);
const toDateValue = (value) =>
  value
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : "";
const earliestSessionDate = "2021-01-01";

const sessionMetrics = [
  ["Total sessions", "all", "total", "session-metric-indigo"],
  ["Active", "Active", "resolved", "session-metric-orange"],
  ["Upcoming", "Upcoming", "pending", "session-metric-sky"],
  ["Completed", "Completed", "completedSession", "session-metric-emerald"],
];

function CalendarField({ label, value, onChange, minDate }) {
  const effectiveMinDate = minDate && minDate > earliestSessionDate
    ? minDate
    : earliestSessionDate;

  return (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <DatePicker
        required
        selected={toDate(value)}
        onChange={(date) => onChange(toDateValue(date))}
        minDate={toDate(effectiveMinDate)}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={8}
        scrollableYearDropdown
        isClearable
        autoComplete="off"
        className={fieldClass}
        wrapperClassName="w-full"
        portalId="academic-session-datepicker-root"
        popperClassName="academic-session-datepicker-popper z-[100]"
        calendarClassName="academic-session-datepicker !font-sans"
        popperPlacement="bottom-start"
      />
    </label>
  );
}

function SessionIcon({ name }) {
  const paths = {
    edit: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
    activate: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    archive: (
      <>
        <path d="M4 7h16v13H4zM3 3h18v4H3zM9 11h6" />
      </>
    ),
  };
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
      {paths[name]}
    </svg>
  );
}

function AcademicSessions() {
  const [sessions, setSessions] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const formRef = useAccessibleModal(formOpen, () => setFormOpen(false));
  const sortedSessions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...sessions]
      .filter((session) =>
        (statusFilter === "all" || session.status === statusFilter) &&
        (!term || `${session.name} ${session.startDate} ${session.endDate}`.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [sessions, search, statusFilter]);
  const activeSession = sessions.find((session) => session.status === "Active");

  useEffect(() => {
    let active = true;

    fetchAcademicSessions()
      .then((items) => {
        if (!active) return;
        setSessions(items);
        setPageError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setPageError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refreshSessions = async () => {
    const items = await fetchAcademicSessions();
    setSessions(items);
    return items;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setFormOpen(true);
  };
  const openEdit = (session) => {
    setEditingId(session.id);
    setForm({ ...session });
    setError("");
    setNotice("");
    setFormOpen(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.startDate || !form.endDate)
      return setError("Please select the session start and end dates.");
    if (form.endDate <= form.startDate)
      return setError("End date must be after the session start date.");
    if (
      sessions.some(
        (item) =>
          item.id !== editingId &&
          item.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
      )
    )
      return setError("An academic session with this name already exists.");
    const session = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    };
    setIsSaving(true);
    setError("");
    try {
      if (editingId) await updateAcademicSession(editingId, session);
      else await createAcademicSession(session);
      await refreshSessions();
      setNotice(editingId ? "Academic session updated successfully." : "Academic session created successfully.");
      setFormOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };
  const activate = async (id) => {
    if (
      !window.confirm(
        "Activate this academic session? The current active session will be completed.",
      )
    )
      return;
    setActionId(id);
    try {
      await activateAcademicSessionApi(id);
      await refreshSessions();
      setPageError("");
      setNotice("Academic session activated successfully.");
    } catch (requestError) {
      setPageError(requestError.message);
    } finally {
      setActionId("");
    }
  };
  const archive = async (id) => {
    const target = sessions.find((item) => item.id === id);
    if (
      target.status === "Active" ||
      !window.confirm(`Archive academic session ${target.name}?`)
    )
      return;
    setActionId(id);
    try {
      await archiveAcademicSessionApi(id);
      await refreshSessions();
      setPageError("");
      setNotice("Academic session archived successfully.");
    } catch (requestError) {
      setPageError(requestError.message);
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="admin-page academic-session-page">
      <header className="session-page-header">
        <div className="session-page-title">
          <span className="session-page-icon"><AdminMetricIcon name="schedule" /></span>
          <div>
            <p>Academic setup / Sessions</p>
            <h1>Academic sessions</h1>
           
          </div>
        </div>
        <div className="session-header-actions">
          <span className={`session-active-label ${activeSession ? "has-active-session" : ""}`}>
            <i /> {activeSession ? `${activeSession.name} active` : "No active session"}
          </span>
          <button type="button" onClick={openCreate}><b>+</b> Add session</button>
        </div>
      </header>
      {pageError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {pageError}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          {notice}
        </p>
      )}
      <section className="session-metrics mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Academic session summary">
        {sessionMetrics.map(([label, status, icon, tone]) => (
          <button type="button" key={status} onClick={() => setStatusFilter(status)} className={`session-metric ${tone} ${statusFilter === status ? "is-selected" : ""}`}>
            <span><small>{label}</small><strong>{status === "all" ? sessions.length : sessions.filter((item) => item.status === status).length}</strong></span>
            <i><AdminMetricIcon name={icon} className="h-[17px] w-[17px]" /></i>
          </button>
        ))}
      </section>

      <section className="session-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="session-directory-heading">
          <div>
            <h2>Session directory</h2>
          
          </div>
          <strong>{sortedSessions.length} results</strong>
        </div>
        <div className="session-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search session name or year" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter academic sessions by status">
            <option value="all">Status</option>
            {["Active", "Upcoming", "Completed"].map((status) => <option key={status}>{status}</option>)}
          </select>
          {(search || statusFilter !== "all") && <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear filters</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Academic Session",
                  "Session Period",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/25 px-4 py-3 ${heading === "Actions" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="border border-slate-200 px-4 py-8 text-center text-slate-500">
                    Loading academic sessions…
                  </td>
                </tr>
              )}
              {!loading && sortedSessions.length === 0 && (
                <tr>
                  <td colSpan="4" className="border border-slate-200 px-4 py-8 text-center text-slate-500">
                    {sessions.length ? "No sessions match the selected filters." : "No academic session has been created yet."}
                  </td>
                </tr>
              )}
              {sortedSessions.map((session) => (
                <tr key={session.id} className={session.status === "Active" ? "active-session-row" : ""}>
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="session-name-cell">
                      <span>{session.name.slice(0, 2)}</span>
                      <strong>{session.name}</strong>
                    </div>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="session-period"><strong>{formatDate(session.startDate)} — {formatDate(session.endDate)}</strong></div>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusTone[session.status]}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(session)}
                        disabled={session.status === "Archived" || Boolean(actionId)}
                        title="Edit session"
                        aria-label={`Edit ${session.name}`}
                        className="admin-action-native !text-indigo-700"
                      >
                        <SessionIcon name="edit" />
                      </button>
                      {session.status === "Upcoming" && (
                        <button
                          type="button"
                          onClick={() => activate(session.id)}
                          disabled={Boolean(actionId)}
                          title="Activate session"
                          aria-label={`Activate ${session.name}`}
                          className="admin-action-native !text-emerald-700"
                        >
                          <SessionIcon name="activate" />
                        </button>
                      )}
                      {session.status !== "Active" &&
                        session.status !== "Archived" && (
                          <button
                            type="button"
                            onClick={() => archive(session.id)}
                            disabled={Boolean(actionId)}
                            title="Archive session"
                            aria-label={`Archive ${session.name}`}
                            className="admin-action-native !text-slate-600"
                          >
                            <SessionIcon name="archive" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && createPortal(
        <div className="session-modal-backdrop fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setFormOpen(false); }}>
          <form
            ref={formRef}
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            tabIndex="-1"
            className="session-form flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <header className="session-form-header flex shrink-0 items-start justify-between px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="session-form-icon"><AdminMetricIcon name="schedule" className="h-5 w-5" /></span>
                <div><p>Academic setup</p>
                <h2>
                  {editingId ? "Edit Academic Session" : "Add Academic Session"}
                </h2>
                <span>{editingId ? "Update the session details and lifecycle status." : "Create the academic period used across all modules."}</span></div>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setFormOpen(false)}
                aria-label="Close"
                className="session-form-close"
              >
                ✕
              </button>
            </header>
            <div className="session-form-content min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
            <div className="session-form-note"><i>i</i><p><strong>Session rule</strong><span>Activating a session automatically marks the current active session as completed.</span></p></div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                Session Name
                <input
                  required
                  placeholder="2027–28"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={fieldClass}
                />
                <span className="session-field-help">Example: 2026–27 or Summer Term 2026</span>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={fieldClass}
                >
                  {["Upcoming", "Active", "Completed"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <CalendarField
                label="Session Start"
                value={form.startDate}
                onChange={(value) => setForm({ ...form, startDate: value })}
              />
              <CalendarField
                label="Session End"
                value={form.endDate}
                minDate={form.startDate}
                onChange={(value) => setForm({ ...form, endDate: value })}
              />
            </div>
            {error && (
              <p role="alert" className="session-form-error mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </p>
            )}
            </div>
            <footer className="session-form-footer flex shrink-0 flex-col-reverse gap-2 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setFormOpen(false)}
                className="session-cancel min-h-11 w-full rounded-xl px-4 py-2.5 text-xs font-semibold sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="session-save min-h-11 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:w-auto"
              >
                {isSaving ? "Saving…" : editingId ? "Save Changes" : "Create Session"}
              </button>
            </footer>
          </form>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default AcademicSessions;
