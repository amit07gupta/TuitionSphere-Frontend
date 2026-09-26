import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  archiveTutorAssignment,
  createTutorAssignment,
  fetchTutorAssignment,
  fetchTutorAssignmentSubmissions,
  fetchTutorAssignments,
  reviewTutorSubmission,
  updateTutorAssignment,
} from "../../services/tutorAssignmentApi";
import PortalIcon from "../../components/portal/PortalIcon";
import AssignmentSubmissionsDrawer from "./AssignmentSubmissionsDrawer";

const TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const field =
  "mt-1.5 h-11 w-full rounded-xl border border-violet-200 bg-violet-50 px-3 text-sm text-brand-navy disabled:opacity-50";
const emptyForm = () => ({
  title: "",
  type: "Homework",
  batchId: "",
  subjectId: "",
  instructions: "",
  dueDate: "",
  totalMarks: 20,
  status: "Published",
  attachmentName: "",
  attachmentType: "",
  attachmentData: "",
});
const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function TutorAssignments() {
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [review, setReview] = useState({ marks: "", feedback: "" });
  const [drawerAssignment, setDrawerAssignment] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTutorAssignments()
      .then((data) => {
        setItems(data.assignments || []);
        setBatches(data.assignedBatches || []);
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(
    () => batches.find((item) => item.id === form.batchId)?.subjects || [],
    [batches, form.batchId],
  );
  const owned = items;
  const submissions = useMemo(
    () => items.flatMap((item) => item.submissions || []),
    [items],
  );
  const editingSubmissions = submissions.filter(
    (item) => item.assignmentId === editingId,
  );
  const lockAcademicFields = editingSubmissions.length > 0;

  const openCreate = () => {
    const next = emptyForm();
    next.batchId = batches[0]?.id || "";
    next.subjectId = batches[0]?.subjects?.[0]?.id || "";
    setForm(next);
    setEditingId("");
    setMessage("");
    setShowForm(true);
  };
  const openEdit = async (item) => {
    try {
      setMessage("");
      const detail = await fetchTutorAssignment(item.id);
      setForm({ ...emptyForm(), ...detail });
      setEditingId(item.id);
      setShowForm(true);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const attachFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setMessage("Only PDF, DOC, DOCX, JPG or PNG files are allowed.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setMessage("Attachment must be 1 MB or smaller for this demo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((value) => ({
        ...value,
        attachmentName: file.name,
        attachmentType: file.type,
        attachmentData: reader.result,
      }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };
  const reload = async () => {
    const data = await fetchTutorAssignments();
    setItems(data.assignments || []);
    setBatches(data.assignedBatches || []);
  };
  const save = async (event) => {
    event.preventDefault();
    const batch = batches.find((item) => item.id === form.batchId);
    if (!batch || !subjects.some((item) => item.id === form.subjectId)) return;
    setSaving(true);
    setMessage("");
    try {
      if (editingId) await updateTutorAssignment(editingId, form);
      else await createTutorAssignment(form);
      await reload();
      setShowForm(false);
      setEditingId("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };
  const toggleArchive = async (item) => {
    try {
      setMessage("");
      await archiveTutorAssignment(item);
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const loadSubmissionDrawer = async (assignment) => {
    setDrawerAssignment(assignment);
    setDrawerLoading(true);
    setDrawerError("");
    try {
      setDrawerData(await fetchTutorAssignmentSubmissions(assignment.id));
    } catch (error) {
      setDrawerError(error.message);
    } finally {
      setDrawerLoading(false);
    }
  };
  const closeSubmissionDrawer = () => {
    setDrawerAssignment(null);
    setDrawerData(null);
    setDrawerError("");
  };
  const openReview = async (assignment, entry) => {
    try {
      const detail = await fetchTutorAssignment(assignment.id);
      const submissionId = entry.id || entry.submissionId;
      const full = detail.submissions.find((item) => item.id === submissionId);
      if (!full) throw new Error("Submission is no longer available.");
      setReviewing({
        ...full,
        assignmentId: assignment.id,
        totalMarks: assignment.totalMarks,
      });
      setReview({ marks: full.marks ?? "", feedback: full.feedback || "" });
    } catch (error) {
      setMessage(error.message);
      if (drawerAssignment) setDrawerError(error.message);
    }
  };
  const saveReview = async (event) => {
    event.preventDefault();
    const marks = Number(review.marks);
    if (marks < 0 || marks > Number(reviewing.totalMarks)) return;
    setSaving(true);
    try {
      await reviewTutorSubmission(reviewing.assignmentId, reviewing.id, {
        marks,
        feedback: review.feedback,
      });
      await reload();
      setReviewing(null);
      if (drawerAssignment?.id === reviewing.assignmentId) {
        setDrawerLoading(true);
        fetchTutorAssignmentSubmissions(reviewing.assignmentId)
          .then((data) => {
            setDrawerData(data);
            setDrawerError("");
          })
          .catch((error) => setDrawerError(error.message))
          .finally(() => setDrawerLoading(false));
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 rounded-3xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
            Academic work
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-navy">
            Assignments
          </h1>
        </div>
        <button
          onClick={openCreate}
          disabled={!batches.length}
          className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-40"
        >
          + Create Assignment
        </button>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          [
            "Published",
            owned.filter((item) => item.status === "Published").length,
          ],
          [
            "Submissions",
            submissions.filter((entry) =>
              owned.some((item) => item.id === entry.assignmentId),
            ).length,
          ],
          [
            "To Review",
            submissions.filter(
              (entry) =>
                entry.status === "Submitted" &&
                owned.some((item) => item.id === entry.assignmentId),
            ).length,
          ],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-2xl border border-violet-200 bg-white p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <strong className="text-2xl text-brand-navy">{value}</strong>
          </article>
        ))}
      </section>
      <section className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="bg-[#102044] text-white">
            <tr>
              {[
                "Assignment",
                "Batch & Subject",
                "Due Date",
                "Submissions",
                "Status",
                "Actions",
              ].map((label) => (
                <th key={label} className="border border-blue-300/20 px-4 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {owned.map((item) => {
              const related = item.submissions || [];
              const reviewed = related.some(
                (entry) => entry.status === "Reviewed",
              );
              return (
                <tr key={item.id}>
                  <td className="border p-4">
                    <strong>{item.title}</strong>
                    <span className="block text-slate-400">
                      {item.type} · {item.totalMarks} marks
                    </span>
                  </td>
                  <td className="border p-4">
                    {item.batchName}
                    <span className="block text-slate-400">{item.subject}</span>
                  </td>
                  <td className="border p-4">{item.dueDate}</td>
                  <td className="border p-4">
                    <strong>{related.length} submitted</strong>
                    <span className="block text-slate-400">
                      {related.filter((entry) => entry.status === "Submitted").length} awaiting review
                    </span>
                  </td>
                  <td className="border p-4">{item.status}</td>
                  <td className="border p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadSubmissionDrawer(item)}
                        title="View student submissions"
                        aria-label={`View submissions for ${item.title}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-brand-navy transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <PortalIcon name="view" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={reviewed || item.status === "Archived"}
                        onClick={() => openEdit(item)}
                        title={
                          reviewed
                            ? "Reviewed assignments cannot be edited"
                            : "Edit"
                        }
                        className="rounded-lg bg-sky-100 px-3 py-2 text-base font-bold text-sky-700 disabled:opacity-30"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleArchive(item)}
                        title={
                          item.status === "Archived" ? "Restore" : "Archive"
                        }
                        className="rounded-lg bg-rose-100 px-3 py-2 text-base font-bold text-rose-700"
                      >
                        {item.status === "Archived" ? "↺" : "▣"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!owned.length && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-400">
                  {loading
                    ? "Loading assignments..."
                    : "No assignments created."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {drawerAssignment && (
        <AssignmentSubmissionsDrawer
          data={drawerData || { assignment: drawerAssignment }}
          loading={drawerLoading}
          error={drawerError}
          onClose={closeSubmissionDrawer}
          onGrade={(student) => openReview(drawerAssignment, student)}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold">
                  {editingId ? "Edit Assignment" : "Create Assignment"}
                </h2>
                {lockAcademicFields && (
                  <p className="mt-1 text-[10px] text-amber-700">
                    Batch, subject and marks are locked because submissions
                    exist.
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold sm:col-span-2">
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className={field}
                />
              </label>
              <label className="text-xs font-semibold">
                Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className={field}
                >
                  {["Homework", "Worksheet", "Practice Work", "Project"].map(
                    (item) => (
                      <option key={item}>{item}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Batch
                <select
                  disabled={lockAcademicFields}
                  value={form.batchId}
                  onChange={(event) => {
                    const batchId = event.target.value;
                    setForm({
                      ...form,
                      batchId,
                      subjectId:
                        batches.find((item) => item.id === batchId)
                          ?.subjects?.[0]?.id || "",
                    });
                  }}
                  className={field}
                >
                  {batches.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Subject
                <select
                  disabled={lockAcademicFields}
                  value={form.subjectId}
                  onChange={(event) =>
                    setForm({ ...form, subjectId: event.target.value })
                  }
                  className={field}
                >
                  {subjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Due Date
                <DatePicker
                  required
                  selected={
                    form.dueDate ? new Date(`${form.dueDate}T00:00:00`) : null
                  }
                  minDate={new Date()}
                  onChange={(date) =>
                    setForm({ ...form, dueDate: dateKey(date) })
                  }
                  dateFormat="dd/MM/yyyy"
                  wrapperClassName="w-full"
                  className={field}
                />
              </label>
              <label className="text-xs font-semibold">
                Total Marks
                <input
                  disabled={lockAcademicFields}
                  type="number"
                  min="1"
                  value={form.totalMarks}
                  onChange={(event) =>
                    setForm({ ...form, totalMarks: event.target.value })
                  }
                  className={field}
                />
              </label>
              <label className="text-xs font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={field}
                >
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </label>
              <label className="text-xs font-semibold sm:col-span-2">
                Instructions
                <textarea
                  required
                  rows="4"
                  value={form.instructions}
                  onChange={(event) =>
                    setForm({ ...form, instructions: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border p-3"
                />
              </label>
              <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 p-4 sm:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-navy">
                      Question Paper / Worksheet{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      PDF, DOC, DOCX, JPG or PNG · maximum 1 MB
                    </p>
                  </div>
                  <label
                    htmlFor="tutor-assignment-file"
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 focus-within:ring-4 focus-within:ring-violet-200"
                  >
                    {/* <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
                      +
                    </span> */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                      />
                    </svg>
                    <span>
                      {form.attachmentName
                        ? "Change Document"
                        : "Upload Document"}
                    </span>
                    <input
                      id="tutor-assignment-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={attachFile}
                      className="sr-only"
                    />
                  </label>
                </div>
                {form.attachmentName && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-white p-3 text-xs shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-6-6 6 6m-6-6v6h6"
                          />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate font-bold text-brand-navy">
                          {form.attachmentName}
                        </span>
                        <span className="text-[10px] text-emerald-600">
                          Document ready to attach
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          attachmentName: "",
                          attachmentType: "",
                          attachmentData: "",
                        })
                      }
                      className="shrink-0 rounded-lg bg-rose-50 px-3 py-2 font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {message && (
                <p className="text-xs font-bold text-rose-600 sm:col-span-2">
                  {message}
                </p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-violet-600 px-5 py-2 font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4">
          <form
            onSubmit={saveReview}
            className="w-full max-w-lg rounded-2xl bg-white p-5"
          >
            <h2 className="font-heading text-xl font-bold">
              Review {reviewing.studentName}
            </h2>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="truncate">
                {reviewing.fileName || "No attachment"}
              </span>
              {reviewing.fileData && (
                <a
                  href={reviewing.fileData}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-violet-700"
                >
                  Open submission
                </a>
              )}
            </div>
            <label className="mt-4 block text-xs font-semibold">
              Marks (out of {reviewing.totalMarks})
              <input
                required
                type="number"
                min="0"
                max={reviewing.totalMarks}
                value={review.marks}
                onChange={(event) =>
                  setReview({ ...review, marks: event.target.value })
                }
                className={field}
              />
            </label>
            <label className="mt-4 block text-xs font-semibold">
              Feedback
              <textarea
                required
                rows="3"
                value={review.feedback}
                onChange={(event) =>
                  setReview({ ...review, feedback: event.target.value })
                }
                className="mt-1.5 w-full rounded-xl border p-3"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewing(null)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Review"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TutorAssignments;
