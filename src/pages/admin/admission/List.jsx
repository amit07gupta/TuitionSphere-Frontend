import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import "../board/board.css";
import "./admission.css";
import { fetchAcademicSessions } from "../../../services/academicSessionApi";
import { fetchBoards } from "../../../services/boardApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchStudents } from "../../../services/studentApi";
import { fetchBatches } from "../../../services/batchApi";
import { fetchFeePlans } from "../../../services/feePlanApi";
import { fetchAdminDemoRequests } from "../../../services/adminDemoRequestApi";
import { createAdmission } from "../../../services/admissionApi";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-100";
const dateValue = (date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
const parseDate = (value) => {
  if (!value) return null;
  const normalized = String(value).trim();
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const displayMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (isoMatch)
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
  if (displayMatch)
    return new Date(
      Number(displayMatch[3]),
      Number(displayMatch[2]) - 1,
      Number(displayMatch[1]),
    );
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const formatDate = (value) =>
  parseDate(value)?.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) || "configured date";
const defaultJoiningDate = (session) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(session?.startDate);
  return dateValue(start && today < start ? start : today);
};
const admissionSources = [
  "Walk-in",
  "Phone Call",
  "Referral",
  "Inquiry",
  "Direct Admission",
];

function Admissions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const isManual = searchParams.get("manual") === "1";
  const [leads, setLeads] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [feePlanRecords, setFeePlanRecords] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [students, setStudents] = useState([]);
  const lead = useMemo(
    () => leads.find((item) => item.id === leadId) ?? null,
    [leadId, leads],
  );
  const readyLeads = useMemo(
    () => leads.filter((item) => item.status === "Ready for Admission"),
    [leads],
  );
  const activeSession =
    academicSessions.find((session) => session.status === "Active") || null;
  // `program` is retained here only as a temporary display/profile compatibility
  // label while the rest of the admission screens move to the simpler batch model.
  const [form, setForm] = useState(() => ({
    studentName: lead?.studentName || "",
    parentName: lead?.parentName || lead?.name || "",
    phone: lead?.phone || "",
    email: lead?.email || "",
    source: lead?.source || "Walk-in",
    grade: String(lead?.grade || ""),
    board: lead?.board || "",
    batchId: "",
    feePlanId: "",
    joiningDate: defaultJoiningDate(activeSession),
    confirmDetails: false,
  }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminDemoRequests(),
      fetchBatches(),
      fetchFeePlans(),
      fetchAcademicSessions(),
      fetchBoards(),
      fetchGrades(),
      fetchStudents(),
    ])
      .then(
        ([
          requests,
          batchesFromApi,
          plans,
          sessions,
          boardRecords,
          gradeRecords,
          studentRecords,
        ]) => {
          if (!active) return;
          setLeads(requests);
          setAllBatches(
            batchesFromApi.map((batch) => ({
              ...batch,
              program: `Grade ${batch.grade} ${batch.board}`,
            })),
          );
          setFeePlanRecords(plans);
          setAcademicSessions(sessions);
          setBoards(boardRecords.filter((board) => board.status === "Active"));
          setGrades(gradeRecords.filter((grade) => grade.status === "Active"));
          setStudents(studentRecords);
          setForm((current) => ({
            ...current,
            joiningDate:
              current.joiningDate ||
              defaultJoiningDate(
                sessions.find((session) => session.status === "Active"),
              ),
          }));
          const requestedLead = requests.find((item) => item.id === leadId);
          if (requestedLead) {
            setForm((current) => ({
              ...current,
              studentName: requestedLead.studentName || "",
              parentName: requestedLead.parentName || requestedLead.name || "",
              phone: requestedLead.phone || "",
              email: requestedLead.email || "",
              source: requestedLead.source || "Book Demo",
              grade: String(requestedLead.grade || ""),
              board: requestedLead.board || "",
              joiningDate:
                current.joiningDate ||
                defaultJoiningDate(
                  sessions.find((session) => session.status === "Active"),
                ),
            }));
          }
        },
      )
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [leadId]);
  const selectedGrade = grades.find(
    (grade) => String(grade.value) === form.grade,
  );
  const availableBoards = selectedGrade
    ? boards.filter((board) => selectedGrade.boardIds?.includes(board.id))
    : boards;
  const selectedBoardRecord = availableBoards.find(
    (board) => board.code === form.board,
  );
  const batches = allBatches.filter(
    (batch) =>
      batch.academicSessionId === activeSession?.id &&
      (batch.gradeId
        ? batch.gradeId === selectedGrade?.id
        : String(batch.grade) === form.grade) &&
      (batch.boardId
        ? batch.boardId === selectedBoardRecord?.id
        : (batch.boards || [batch.board]).includes(form.board)) &&
      batch.status === "Active" &&
      batch.enrolled < batch.capacity,
  );
  const selectedBatch = batches.find((batch) => batch.id === form.batchId);
  const feePlans =
    selectedBatch && activeSession
      ? feePlanRecords.filter(
          (plan) =>
            plan.status === "Active" &&
            plan.academicSessionId === activeSession.id &&
            plan.gradeId === selectedGrade?.id,
        )
      : [];
  const selectedFeePlan = feePlans.find((plan) => plan.id === form.feePlanId);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };
  const selectGrade = (value) =>
    setForm((current) => ({
      ...current,
      grade: value,
      board: "",
      batchId: "",
      feePlanId: "",
    }));
  const selectBoard = (value) =>
    setForm((current) => ({
      ...current,
      board: value,
      batchId: "",
      feePlanId: "",
    }));
  const selectBatch = (value) => {
    const batch = batches.find((item) => item.id === value);
    const plans =
      batch && activeSession
        ? feePlanRecords.filter(
            (plan) =>
              plan.status === "Active" &&
              plan.academicSessionId === activeSession.id &&
              plan.gradeId === selectedGrade?.id,
          )
        : [];
    setForm((current) => ({
      ...current,
      batchId: value,
      feePlanId: plans[0]?.id || "",
    }));
  };
  const validate = () => {
    const namePattern = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;
    if (
      !namePattern.test(form.studentName.trim()) ||
      !namePattern.test(form.parentName.trim())
    )
      return "Student and parent names can only contain letters and spaces.";
    if (!/^\d{10}$/.test(form.phone))
      return "Enter a valid 10-digit parent phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return "Enter a valid login email address for the student account.";
    const normalizedEmail = form.email.trim().toLowerCase();
    const duplicateStudent = students.find(
      (student) => student.email?.trim().toLowerCase() === normalizedEmail,
    );
    if (duplicateStudent)
      return `A student account already exists with this login email (${duplicateStudent.id}).`;
    if (!form.grade || !form.board || !selectedBatch || !selectedFeePlan)
      return "Select grade, board, available batch and fee plan.";
    if (!form.joiningDate) return "Select the student joining date.";
    const joiningDate = parseDate(form.joiningDate);
    const sessionStart = parseDate(activeSession?.startDate);
    const sessionEnd = parseDate(activeSession?.endDate);
    if (!joiningDate) return "Select a valid student joining date.";
    if (sessionStart && joiningDate < sessionStart)
      return `Joining date must be on or after ${formatDate(activeSession.startDate)} for ${activeSession.name}.`;
    if (sessionEnd && joiningDate > sessionEnd)
      return `Joining date must be on or before ${formatDate(activeSession.endDate)} for ${activeSession.name}.`;
    if (!form.confirmDetails)
      return "Confirm the account and academic setup details.";
    return "";
  };
  const createStudentAccount = async () => {
    if ((!lead && !isManual) || !activeSession || isSubmitting) return;
    const validationError = validate();
    if (validationError) return setError(validationError);
    setIsSubmitting(true);
    try {
      const created = await createAdmission({
        demoRequestId: lead?.type === "Demo" ? lead.backendId || lead.id : null,
        studentName: form.studentName.trim(),
        parentName: form.parentName.trim(),
        phone: form.phone,
        email: form.email.trim(),
        source: form.source,
        joiningDate: form.joiningDate,
        academicSessionId: activeSession.id,
        gradeId: selectedGrade.id,
        boardId: selectedBoardRecord.id,
        batchId: selectedBatch.id,
        feePlanId: selectedFeePlan.id,
      });
      navigate(`/admin/students/${created.admission.student.id}`, {
        replace: true,
      });
    } catch (creationError) {
      setError(
        creationError.message ||
          "Student account could not be created. Review the details and try again.",
      );
      setIsSubmitting(false);
    }
  };

  if (!lead && !isManual)
    return (
      <div className="admin-page board-page admission-page">
        <header className="board-page-header">
          <div className="board-page-title">
            <span className="board-page-icon">
              <AdminMetricIcon name="enrolled" />
            </span>
            <div>
              <p>Admissions / Enrollment</p>
              <h1>Admissions</h1>
            </div>
          </div>
          <div className="board-header-actions">
            <button
              type="button"
              onClick={() => navigate("/admin/admissions?manual=1")}
            >
              <b>+</b> New admission
            </button>
          </div>
        </header>
        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}
        <section
          className="board-metrics mt-4 grid gap-3 sm:grid-cols-3"
          aria-label="Admission summary"
        >
          {[
            [
              "Ready for admission",
              loading ? "…" : readyLeads.length,
              "progress",
              "board-metric-amber",
            ],
            [
              "Student created",
              loading
                ? "…"
                : leads.filter((item) => item.status === "Enrolled").length,
              "resolved",
              "board-metric-emerald",
            ],
            [
              "Active students",
              loading
                ? "…"
                : students.filter((item) => item.status === "Active").length,
              "students",
              "board-metric-indigo",
            ],
          ].map(([label, value, icon, tone]) => (
            <article key={label} className={`board-metric ${tone}`}>
              <span>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
              <i>
                <AdminMetricIcon name={icon} className="h-[17px] w-[17px]" />
              </i>
            </article>
          ))}
        </section>
        <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="board-directory-heading">
            <div>
              <h2>Admission Queue</h2>
              <p>Students who have completed the required demo workflow.</p>
            </div>
            <div className="admission-directory-actions">
              <button
                type="button"
                onClick={() => navigate("/admin/demo-requests")}
              >
                Open Demo Requests
              </button>
              <strong>{readyLeads.length} ready</strong>
            </div>
          </header>
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-500">
              Loading admissions…
            </div>
          ) : readyLeads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead>
                  <tr>
                    {[
                      "Student",
                      "Parent & Contact",
                      "Grade & Board",
                      "Source",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`border px-4 py-3 ${heading === "Action" ? "text-center" : ""}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readyLeads.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-4">
                        <div className="admission-student">
                          <span>
                            {(item.studentName || item.name || "S")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <strong>{item.studentName || item.name}</strong>
                        </div>
                      </td>
                      <td className="border p-4">
                        <strong>
                          {item.parentName || item.name || "Not provided"}
                        </strong>
                        <small>
                          {item.phone
                            ? `+91 ${item.phone}`
                            : item.email || "No contact"}
                        </small>
                      </td>
                      <td className="border p-4">
                        <strong>Grade {item.grade || "—"}</strong>
                        <small>{item.board || "Board pending"}</small>
                      </td>
                      <td className="border p-4">
                        <span className="admission-source">
                          {item.source || "Demo request"}
                        </span>
                      </td>
                      <td className="border p-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/admissions?leadId=${encodeURIComponent(item.id)}`,
                            )
                          }
                          className="admission-start"
                        >
                          Start Admission →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <h3 className="font-heading text-lg font-bold text-brand-navy">
                No students are ready for admission
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Complete a demo request or create a direct admission.
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/admissions?manual=1")}
                className="mt-4 rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white"
              >
                + Create Manual Admission
              </button>
            </div>
          )}
        </section>
      </div>
    );
  if (lead?.status === "Enrolled")
    return (
      <div className="admin-page">
        <AdminPageHeader
          eyebrow="Admissions"
          title="Student Already Created"
          description="This lead is already enrolled."
          icon="students"
        />
        <button
          type="button"
          onClick={() => navigate(`/admin/students/${lead.studentId}`)}
          className="mt-5 rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white"
        >
          Open Student Profile
        </button>
      </div>
    );
  if (lead && lead.status !== "Ready for Admission")
    return (
      <div className="admin-page">
        <AdminPageHeader
          eyebrow="Admissions"
          title="Lead Not Ready"
          description="Complete the demo outcome before account creation."
          icon="students"
        />
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm">
            Current lead status: <strong>{lead.status}</strong>
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/demo-requests")}
            className="mt-4 rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white"
          >
            Return to Demo Requests
          </button>
        </section>
      </div>
    );

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Admissions"
        title={isManual ? "New Manual Admission" : "Create Student Account"}
        description={
          isManual
            ? "Create a student directly without requiring a demo request."
            : "Confirm basic contact, batch and fee details. The student will complete personal information later."
        }
        icon="students"
        meta={
          activeSession ? `Session ${activeSession.name}` : "No active session"
        }
      />
      {!activeSession && (
        <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
          Activate an academic session before continuing.
        </p>
      )}
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b bg-slate-50 px-5 py-4">
          <p className="text-[10px] font-bold uppercase text-brand-gold-dark">
            {lead
              ? `${lead.id} · Ready for Admission`
              : "Direct entry · Manual admission"}
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold text-brand-navy">
            Account & enrollment setup
          </h2>
        </header>
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <section>
            <h3 className="font-heading font-bold text-brand-navy">
              1. {lead ? "Prefilled Contact" : "Student & Parent Details"}
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Student Name
                <input
                  value={form.studentName}
                  onChange={(event) =>
                    update(
                      "studentName",
                      event.target.value.replace(/[^\p{L}\s]/gu, ""),
                    )
                  }
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold">
                Parent Name
                <input
                  value={form.parentName}
                  onChange={(event) =>
                    update(
                      "parentName",
                      event.target.value.replace(/[^\p{L}\s]/gu, ""),
                    )
                  }
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold">
                Parent Phone
                <input
                  value={form.phone}
                  inputMode="numeric"
                  maxLength="10"
                  onChange={(event) =>
                    update("phone", event.target.value.replace(/\D/g, ""))
                  }
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold">
                Login Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className={fieldClass}
                />
              </label>
              {isManual && (
                <label className="text-xs font-semibold sm:col-span-2">
                  Admission Source
                  <select
                    value={form.source}
                    onChange={(event) => update("source", event.target.value)}
                    className={fieldClass}
                  >
                    {admissionSources.map((source) => (
                      <option key={source}>{source}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs leading-5 text-sky-800">
              <strong>Student completes later:</strong> Date of birth, gender,
              address and alternate contact number.
            </div>
          </section>
          <section>
            <h3 className="font-heading font-bold text-brand-navy">
              2. Academic & Fee Setup
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Grade
                <select
                  value={form.grade}
                  onChange={(event) => selectGrade(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={String(grade.value)}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Board
                <select
                  value={form.board}
                  onChange={(event) => selectBoard(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select board</option>
                  {availableBoards.map((board) => (
                    <option key={board.id} value={board.code}>
                      {board.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold sm:col-span-2">
                Batch
                <select
                  value={form.batchId}
                  onChange={(event) => selectBatch(event.target.value)}
                  disabled={!form.board}
                  className={fieldClass}
                >
                  <option value="">Select available batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} · {batch.capacity - batch.enrolled} seats
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Grade Fee Plan
                <select
                  value={form.feePlanId}
                  onChange={(event) => update("feePlanId", event.target.value)}
                  disabled={!form.batchId}
                  className={fieldClass}
                >
                  <option value="">Select fee plan</option>
                  {feePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · ₹{plan.tuitionFee.toLocaleString("en-IN")} /{" "}
                      {plan.billingFrequency}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Joining Date
                <DatePicker
                  selected={parseDate(form.joiningDate)}
                  onChange={(date) => update("joiningDate", dateValue(date))}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className={fieldClass}
                  wrapperClassName="w-full"
                />
              </label>
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <p>
                <strong>Active session:</strong>{" "}
                {activeSession?.name || "Not active"}
              </p>
              <p className="mt-2">
                <strong>Batch:</strong> {selectedBatch?.name || "Not selected"}
              </p>
              <p className="mt-2">
                <strong>Grade fee:</strong>{" "}
                {selectedFeePlan
                  ? `₹${selectedFeePlan.tuitionFee.toLocaleString("en-IN")} · ${selectedFeePlan.billingFrequency}`
                  : "Selected automatically after batch"}
              </p>
              <p className="mt-2">
                <strong>Joining:</strong> {form.joiningDate || "Not selected"}
              </p>
            </div>
          </section>
        </div>
        <label className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          <input
            type="checkbox"
            checked={form.confirmDetails}
            onChange={(event) => update("confirmDetails", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-emerald-600"
          />
          <span>
            I have verified the contact, batch and grade-wise fee details.
            Create the account with profile marked Incomplete.
          </span>
        </label>
        {error && (
          <p className="mx-5 mb-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {error}
          </p>
        )}
        <footer className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/admissions")}
            className="rounded-xl border px-5 py-3 text-xs font-bold text-brand-navy"
          >
            ← Back to Admissions
          </button>
          <button
            type="button"
            disabled={!activeSession || isSubmitting}
            onClick={createStudentAccount}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account…" : "Confirm & Create Student"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default Admissions;
