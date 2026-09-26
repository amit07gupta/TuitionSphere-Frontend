import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import PortalIcon from "../../components/portal/PortalIcon";
import useAccessibleModal from "../../hooks/useAccessibleModal";
import { fetchTutorSubmissionFile } from "../../services/tutorAssignmentApi";
import "./assignment-submissions.css";

const statusStyles = {
  Graded: "bg-emerald-100 text-emerald-700",
  Submitted: "bg-sky-100 text-sky-700",
  "Not Submitted": "bg-rose-100 text-rose-700",
};

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "No submission yet";

const previewableFile = (name = "") => /\.(pdf|png|jpe?g)$/i.test(name);
const dataUrlBlob = (dataUrl) => {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!match) throw new Error("The submission file could not be opened.");
  const binary = window.atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: match[1] });
};

export default function AssignmentSubmissionsDrawer({
  data,
  loading,
  error,
  onClose,
  onGrade,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fileError, setFileError] = useState("");
  const [openingFileId, setOpeningFileId] = useState("");
  const drawerRef = useAccessibleModal(true, onClose);
  const students = useMemo(() => data?.students || [], [data?.students]);
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.studentName.toLowerCase().includes(query) ||
        student.studentCode.toLowerCase().includes(query);
      const matchesStatus =
        status === "all" ||
        (status === "graded" && student.status === "Graded") ||
        (status === "pending" && student.status === "Submitted") ||
        (status === "not-submitted" && student.status === "Not Submitted") ||
        (status === "late" && student.isLate);
      return matchesSearch && matchesStatus;
    });
  }, [search, status, students]);

  const viewFile = async (student) => {
    if (!student.submissionId || !data?.assignment?.id) return;
    const openInBrowser = previewableFile(student.fileName);
    const previewWindow = openInBrowser ? window.open("about:blank", "_blank") : null;
    if (openInBrowser && !previewWindow) {
      setFileError("Allow pop-ups for this site to open submission files.");
      return;
    }
    setOpeningFileId(student.submissionId);
    setFileError("");
    try {
      const file = await fetchTutorSubmissionFile(
        data.assignment.id,
        student.submissionId,
      );
      const objectUrl = URL.createObjectURL(dataUrlBlob(file.fileData));
      if (previewWindow) {
        previewWindow.location.replace(objectUrl);
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = file.fileName || student.fileName || "submission";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (requestError) {
      previewWindow?.close();
      setFileError(requestError.message);
    } finally {
      setOpeningFileId("");
    }
  };

  return createPortal(
    <div className="assignment-submissions-layer fixed inset-0 z-[110] flex justify-end bg-slate-950/65">
      <button
        type="button"
        aria-label="Close submission tracker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <aside
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Assignment submission tracker"
        className="assignment-submissions-drawer relative z-10 flex h-[100dvh] w-full max-w-[620px] flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <header className="assignment-submissions-header shrink-0 border-b border-slate-200 bg-gradient-to-r from-[#102044] to-[#1d3b73] px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300">
                Submission tracker
              </p>
              <h2 className="mt-1 truncate font-heading text-2xl font-bold">
                {data?.assignment?.title || "Assignment submissions"}
              </h2>
              {data?.assignment && (
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-100">
                  <span>{data.assignment.batchName}</span>
                  <span>{data.assignment.subject}</span>
                  <span>Due {data.assignment.dueDate}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close submission tracker"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <PortalIcon name="close" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="grid min-h-56 place-items-center text-sm text-slate-500">
              Loading batch students...
            </div>
          )}
          {!loading && error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}
          {!loading && !error && data && (
            <>
              <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Submission summary">
                {[
                  ["Submitted", data.summary.submitted],
                  ["Graded", data.summary.graded],
                  ["Pending", data.summary.pending],
                  ["Not submitted", data.summary.notSubmitted],
                ].map(([label, value]) => (
                  <article key={label} className="assignment-submission-stat rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <strong className="mt-1 block text-xl text-brand-navy">{value}</strong>
                  </article>
                ))}
              </section>

              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
                <label className="relative">
                  <span className="sr-only">Search students</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <PortalIcon name="search" className="h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or student ID"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-brand-navy"
                  />
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter students by submission status"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-brand-navy"
                >
                  <option value="all">All students</option>
                  <option value="graded">Graded</option>
                  <option value="pending">Pending review</option>
                  <option value="not-submitted">Not submitted</option>
                  <option value="late">Late</option>
                </select>
              </div>

              {(fileError || error) && (
                <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {fileError || error}
                </p>
              )}

              <section className="mt-4 space-y-3" aria-live="polite">
                {visibleStudents.map((student) => (
                  <article key={student.studentId} className="assignment-student-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                          {student.initials}
                        </span>
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-brand-navy">{student.studentName}</strong>
                          <span className="text-[10px] text-slate-400">{student.studentCode}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[student.status]}`}>
                        {student.status}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_90px]">
                      <div>
                        <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Submitted</dt>
                        <dd className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          {formatDateTime(student.submittedAt)}
                          {student.isLate && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">Late</span>}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Marks</dt>
                        <dd className="mt-1 text-xs font-bold text-brand-navy">
                          {student.marks == null ? "—" : `${student.marks}/${student.totalMarks}`}
                        </dd>
                      </div>
                    </dl>
                    {student.submissionId && (
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={openingFileId === student.submissionId}
                          onClick={() => viewFile(student)}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-brand-navy transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          <PortalIcon name="file" className="h-4 w-4" />
                          {openingFileId === student.submissionId ? "Opening..." : "View file"}
                        </button>
                        {student.status === "Submitted" && (
                          <button
                            type="button"
                            onClick={() => onGrade(student)}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-bold text-white transition hover:bg-violet-700"
                          >
                            <PortalIcon name="check" className="h-4 w-4" />
                            Grade
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
                {!visibleStudents.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <strong className="block text-sm text-brand-navy">No students found</strong>
                    <span className="mt-1 block text-xs text-slate-400">Try a different search or status filter.</span>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
