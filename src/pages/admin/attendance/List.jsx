import LeaveRequestDetails from "./LeaveRequestDetails";
import RejectLeaveRequest from "./RejectLeaveRequest";
import {
  formatDate,
  today,
  statuses,
  fieldClass,
  statusTone,
  requestTone,
  sessionStartDate,
  latestMarkableDate,
} from "./attendanceUtils";
import NewAttendance from "./NewAttendance";
import EditAttendance from "./EditAttendance";
import { useEffect, useState } from "react";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminPagination from "../../../components/admin/AdminPagination";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import useTablePagination from "../../../hooks/useTablePagination";
import {
  fetchAttendance,
  saveAttendance as persistAttendance,
  reviewLeave,
  scheduledSessions,
} from "../../../services/attendanceApi";
import "../board/board.css";
import "./attendance.css";

function ActionIcon({ name }) {
  const paths = {
    view: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    approve: <path d="m5 12 4 4L19 6" />,
    reject: <path d="M6 6l12 12M18 6 6 18" />,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function AttendanceList() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSessionIds, setSelectedSessionIds] = useState(null);
  const [draft, setDraft] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [historyStatus, setHistoryStatus] = useState("all");
  const [requestStatus, setRequestStatus] = useState("all");
  const [requestMonth, setRequestMonth] = useState("all");
  const [requestBatch, setRequestBatch] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const detailsRef = useAccessibleModal(
    Boolean(selectedRequest) && !rejectingRequest,
    () => {
      if (!isSaving) setSelectedRequest(null);
    },
  );
  const rejectRef = useAccessibleModal(Boolean(rejectingRequest), () => {
    if (!isSaving) setRejectingRequest(null);
  });
  const hasUnsavedChanges = Object.keys(draft).length > 0;

  const applyData = (data) => {
    setBatches(data.batches);
    setStudents(data.students);
    setSchedules(data.schedules);
    setRecords(data.records);
    setRequests(data.requests);
  };
  useEffect(() => {
    let active = true;
    fetchAttendance()
      .then((data) => {
        if (!active) return;
        applyData(data);
        const first =
          data.batches.find((item) => item.status === "Active") ||
          data.batches[0];
        setSelectedBatch(first?.id || "");
        setSelectedDate(latestMarkableDate(first?.id, data.schedules));
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (hasUnsavedChanges) event.preventDefault();
    };
    const warnBeforeNavigation = (event) => {
      const link = event.target.closest("a[href]");
      if (
        hasUnsavedChanges &&
        link &&
        !window.confirm("Attendance changes are not saved. Leave this page?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", warnBeforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", warnBeforeNavigation, true);
    };
  }, [hasUnsavedChanges]);

  const roster = students
    .filter(
      (student) =>
        student.status === "Active" &&
        student.batchId === selectedBatch &&
        student.joiningDate <= selectedDate,
    )
    .map((student) => ({
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      board: student.board,
      batchId: selectedBatch,
    }));
  const sessions = scheduledSessions(
    schedules,
    selectedBatch,
    selectedDate,
    selectedDate,
  );
  // Current and completed sessions can be marked; upcoming sessions stay locked.
  const eligibleSessions = sessions.filter(
    (session) =>
      sessionStartDate(selectedDate, session.startTime) <= new Date(),
  );
  const activeSessionIds =
    selectedSessionIds === null
      ? eligibleSessions.map((session) => session.classId)
      : selectedSessionIds;
  const selectedSessions = eligibleSessions.filter((session) =>
    activeSessionIds.includes(session.classId),
  );
  const AttendanceEditor = records.some(
    (record) =>
      record.date === selectedDate &&
      record.batchId === selectedBatch &&
      activeSessionIds.includes(record.classId),
  )
    ? EditAttendance
    : NewAttendance;
  const [historyResult, setHistoryResult] = useState({
    batchId: "",
    status: "all",
    records: [],
  });
  useEffect(() => {
    if (!selectedBatch) return undefined;
    let active = true;
    fetchAttendance({ batchId: selectedBatch, status: historyStatus })
      .then((data) => {
        if (active)
          setHistoryResult({
            batchId: selectedBatch,
            status: historyStatus,
            records: data.records,
          });
      })
      .catch((e) => {
        if (active) {
          setHistoryResult({
            batchId: selectedBatch,
            status: historyStatus,
            records: [],
          });
          setError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedBatch, historyStatus, records]);
  const history =
    historyResult.batchId === selectedBatch &&
    historyResult.status === historyStatus
      ? historyResult.records
      : [];
  const requestMonths = [
    ...new Set(requests.map((item) => item.fromDate.slice(0, 7))),
  ]
    .sort()
    .reverse();
  const [visibleRequests, setVisibleRequests] = useState([]);
  useEffect(() => {
    let active = true;
    fetchAttendance({
      leaveStatus: requestStatus,
      month: requestMonth,
      batchId: requestBatch,
    })
      .then((data) => {
        if (active) setVisibleRequests(data.requests);
      })
      .catch((e) => {
        if (active) {
          setVisibleRequests([]);
          setError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [requestStatus, requestMonth, requestBatch, requests]);
  const {
    page: attendancePage,
    pageSize: attendancePageSize,
    pageItems: attendancePageItems,
    setPage: setAttendancePage,
    serialNumber: attendanceSerial,
  } = useTablePagination(roster);
  const {
    page: historyPage,
    pageSize: historyPageSize,
    pageItems: historyPageItems,
    setPage: setHistoryPage,
    serialNumber: historySerial,
  } = useTablePagination(history);
  const {
    page: leavePage,
    pageSize: leavePageSize,
    pageItems: leavePageItems,
    setPage: setLeavePage,
    serialNumber: leaveSerial,
  } = useTablePagination(visibleRequests);
  const requestCounts = ["Pending", "Approved", "Rejected"].reduce(
    (result, status) => ({
      ...result,
      [status]: requests.filter((item) => item.status === status).length,
    }),
    {},
  );
  const sessionStatus = (student, session) =>
    records.find(
      (item) =>
        item.studentId === student.studentId &&
        item.date === selectedDate &&
        item.batchId === selectedBatch &&
        item.classId === session.classId,
    )?.status ?? "Present";
  const hasApprovedLeave = (student) =>
    selectedSessions.some((session) =>
      records.some(
        (item) =>
          item.studentId === student.studentId &&
          item.date === selectedDate &&
          item.batchId === selectedBatch &&
          item.classId === session.classId &&
          item.status === "Leave" &&
          item.leaveRequestId,
      ),
    );
  const currentStatus = (student) => {
    if (hasApprovedLeave(student)) return "Leave";
    if (draft[student.studentId]) return draft[student.studentId];
    const savedStatuses = selectedSessions.map((session) =>
      sessionStatus(student, session),
    );
    return savedStatuses.length &&
      savedStatuses.every((status) => status === savedStatuses[0])
      ? savedStatuses[0]
      : "Mixed";
  };

  const confirmDiscard = () =>
    !isSaving &&
    (!hasUnsavedChanges ||
      window.confirm("Discard the unsaved attendance changes?"));

  const saveAttendance = async () => {
    if (!selectedSessions.length || isSaving) return;
    setIsSaving(true);
    setError("");
    setSavedMessage("");
    const additions = selectedSessions.flatMap((session) =>
      roster.map((student) => ({
        classId: session.classId,
        studentId: student.studentId,
        status: draft[student.studentId] || sessionStatus(student, session),
      })),
    );
    try {
      applyData(await persistAttendance(selectedDate, additions));
      setDraft({});
      setSavedMessage("Attendance saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };
  const review = async (request, status, reason = "") => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      applyData(await reviewLeave(request.id, status, reason));
      setSelectedRequest(null);
      setRejectingRequest(null);
      setRejectionReason("");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };
  const approve = (request) => review(request, "Approved");
  const reject = (event) => {
    event.preventDefault();
    if (rejectionReason.trim().length >= 5)
      review(rejectingRequest, "Rejected", rejectionReason.trim());
  };

  return (
    <div className="admin-page board-page attendance-page">
      {loading && (
        <p role="status" className="mb-4 text-sm text-slate-600">
          Loading attendance…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon"><AdminMetricIcon name="attendance" className="h-5 w-5" /></span>
          <div><p>Academic Work / Attendance</p><h1>Attendance</h1><span>Mark class attendance and review student leave requests.</span></div>
        </div>
        <div className="board-header-actions"><span className="board-active-label"><i /> {requestCounts.Pending} leave requests pending</span></div>
      </header>
      <nav
        className="attendance-tabs mt-4"
        aria-label="Attendance management views"
      >
        {[
          ["attendance", "Attendance Records"],
          ["leave", `Leave Requests (${requestCounts.Pending})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={activeTab === value ? "is-active" : ""}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "attendance" ? (
        <>
          <AttendanceEditor
            roster={roster}
            hasApprovedLeave={hasApprovedLeave}
            setDraft={setDraft}
            loading={loading}
            isSaving={isSaving}
            selectedSessions={selectedSessions}
            saveAttendance={saveAttendance}
            selectedDate={selectedDate}
            confirmDiscard={confirmDiscard}
            setSelectedDate={setSelectedDate}
            setSelectedSessionIds={setSelectedSessionIds}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            schedules={schedules}
            batches={batches}
            eligibleSessions={eligibleSessions}
            sessions={sessions}
            activeSessionIds={activeSessionIds}
            savedMessage={savedMessage}
            attendancePageItems={attendancePageItems}
            attendanceSerial={attendanceSerial}
            currentStatus={currentStatus}
            attendancePage={attendancePage}
            attendancePageSize={attendancePageSize}
            setAttendancePage={setAttendancePage}
          />
          <section className="board-directory attendance-history mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="board-directory-heading">
              <div><h2>Attendance History</h2><p>Records for the currently selected batch.</p></div>
              <strong>{history.length} records</strong>
            </div>
            <div className="board-filters attendance-history-filters">
              <select aria-label="Filter attendance history by status"
                value={historyStatus}
                onChange={(event) => setHistoryStatus(event.target.value)}
              >
                <option value="all">Status</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="academic-operations-table w-full min-w-[860px] text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    {[
                      "S.N.",
                      "Date",
                      "Student",
                      "Session",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border border-slate-200 px-4 py-3"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!history.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-slate-500"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                  {historyPageItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-500">
                        {historySerial(index)}
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        {formatDate(item.date)}
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <strong>{item.studentName}</strong>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <strong>{item.subject}</strong>
                        <span className="block text-[10px] text-slate-400">
                          {item.topic || "Legacy record"}
                          {item.startTime ? ` · ${item.startTime}` : ""}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusTone[item.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={historyPage}
              pageSize={historyPageSize}
              totalItems={history.length}
              onPageChange={setHistoryPage}
            />
          </section>
        </>
      ) : (
        <>
          <section className="board-metrics mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Total Requests",
                requests.length,
                "board-metric-sky",
              ],
              [
                "Pending",
                requestCounts.Pending,
                "attendance-metric-amber",
              ],
              [
                "Approved",
                requestCounts.Approved,
                "board-metric-emerald",
              ],
              [
                "Rejected",
                requestCounts.Rejected,
                "board-metric-rose",
              ],
            ].map(([label, value, tone]) => (
              <button type="button"
                key={label}
                onClick={() => setRequestStatus(label === "Total Requests" ? "all" : label)}
                className={`board-metric ${tone} ${(requestStatus === "all" && label === "Total Requests") || requestStatus === label ? "is-selected" : ""}`}
              >
                <span><small>{label}</small><strong>{value}</strong></span>
                <i><AdminMetricIcon name={label === "Approved" ? "resolved" : label === "Rejected" ? "inactive" : "pending"} className="h-[18px] w-[18px]" /></i>
              </button>
            ))}
          </section>
          <section className="board-directory attendance-leaves mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="board-directory-heading"><div><h2>Leave Requests</h2><p>Review leave periods and take action from one queue.</p></div><strong>{visibleRequests.length} results</strong></div>
            <div className="board-filters attendance-leave-filters">
              <select
                value={requestMonth}
                onChange={(event) => setRequestMonth(event.target.value)}
                className={fieldClass}
              >
                <option value="all">Month</option>
                {requestMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={requestStatus}
                onChange={(event) => setRequestStatus(event.target.value)}
                className={fieldClass}
              >
                <option value="all">Status</option>
                {["Pending", "Approved", "Rejected", "Cancelled"].map(
                  (status) => (
                    <option key={status}>{status}</option>
                  ),
                )}
              </select>
              <select
                value={requestBatch}
                onChange={(event) => setRequestBatch(event.target.value)}
                className={fieldClass}
              >
                <option value="all">Batch</option>
                {batches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="academic-operations-table academic-actions-table w-full min-w-[960px] text-left text-xs">
                <thead className="bg-[#102044] text-white">
                  <tr>
                    {[
                      "S.N.",
                      "Student",
                      "Leave Period",
                      "Type & Reason",
                      "Sessions",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`border border-blue-300/25 px-4 py-3 ${index > 3 ? "text-center" : ""}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leavePageItems.map((request, index) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-500">
                        {leaveSerial(index)}
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <strong className="text-brand-navy">
                          {request.studentName}
                        </strong>
                        <span className="block text-[10px] text-slate-400">
                          Grade {request.grade}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        {formatDate(request.fromDate)}
                        <span className="block text-[10px] text-slate-400">
                          to {formatDate(request.toDate)}
                        </span>
                      </td>
                      <td className="max-w-[270px] border border-slate-200 px-4 py-3">
                        <strong>{request.type}</strong>
                        <span
                          className="block truncate text-[10px] text-slate-400"
                          title={request.reason}
                        >
                          {request.reason}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        {request.affectedSessions.length} sessions
                      </td>
                      <td className="border border-slate-200 px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${requestTone[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(request)}
                            aria-label={`Review ${request.studentName} leave request`}
                            title={
                              ["Pending", "Rejected"].includes(request.status)
                                ? "Review request"
                                : "View details"
                            }
                            className="admin-action-native attendance-view-action flex h-9 w-9 items-center justify-center rounded-lg border"
                          >
                            <ActionIcon name="view" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={leavePage}
              pageSize={leavePageSize}
              totalItems={visibleRequests.length}
              onPageChange={setLeavePage}
            />
            {!visibleRequests.length && (
              <div className="p-10 text-center text-xs text-slate-500">
                No leave requests match the selected filters.
              </div>
            )}
          </section>
        </>
      )}

      {selectedRequest && (
        <LeaveRequestDetails
          request={selectedRequest}
          detailsRef={detailsRef}
          isSaving={isSaving}
          error={error}
          onClose={() => setSelectedRequest(null)}
          onReject={() => {
            setRejectingRequest(selectedRequest);
            setRejectionReason("");
          }}
          onApprove={() => approve(selectedRequest)}
        />
      )}
      {rejectingRequest && (
        <RejectLeaveRequest
          request={rejectingRequest}
          rejectRef={rejectRef}
          isSaving={isSaving}
          error={error}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onClose={() => setRejectingRequest(null)}
          onSubmit={reject}
        />
      )}
    </div>
  );
}

export default AttendanceList;
