import { useEffect, useState } from "react";
import {
  fetchStudentAssignment,
  fetchStudentAssignments,
  submitStudentAssignment,
} from "../../services/studentAssignmentApi";

const TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_SIZE = 1024 * 1024;
const canPreview = (type) =>
  type === "application/pdf" || type?.startsWith("image/");
const dataToBlobUrl = (dataUrl) => {
  const [header, encoded] = String(dataUrl).split(",");
  const type =
    header.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
  const bytes = atob(encoded || "");
  const array = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1)
    array[index] = bytes.charCodeAt(index);
  return URL.createObjectURL(new Blob([array], { type }));
};

function StudentAssignments() {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const result = await fetchStudentAssignments();
        if (active) {
          setContext(result);
          setPageError("");
        }
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
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  useEffect(() => {
    if (!preview) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [preview]);

  const visible = context?.assignments || [];
  const openFile = async (assignment, source, download = false) => {
    setPageError("");
    try {
      const detail = await fetchStudentAssignment(assignment.id);
      const fileRecord = source === "submission" ? detail.submission : detail;
      const name = source === "submission" ? fileRecord?.fileName : fileRecord.attachmentName;
      const type = source === "submission" ? fileRecord?.fileType : fileRecord.attachmentType;
      const data = source === "submission" ? fileRecord?.fileData : fileRecord.attachmentData;
      if (!data) throw new Error("Document is unavailable. Please refresh the page.");
      const url = dataToBlobUrl(data);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (canPreview(type)) {
        setPreview((current) => {
          if (current?.url) URL.revokeObjectURL(current.url);
          return { name, type, url };
        });
      } else {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setPageError(error.message);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!file) {
      setMessage("Select your completed answer document.");
      return;
    }
    if (!TYPES.includes(file.type)) {
      setMessage("Only PDF, DOC, DOCX, JPG or PNG files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setMessage("Your document must be 1 MB or smaller.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the selected file."));
        reader.readAsDataURL(file);
      });
      const submission = await submitStudentAssignment(uploading.id, file.name, fileData);
      setContext((current) => ({
        ...current,
        assignments: current.assignments.map((item) =>
          item.id === uploading.id ? { ...item, submission } : item
        ),
      }));
      setUploading(null);
      setFile(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };
  const previewSelectedFile = () => {
    if (!file) return;
    if (!canPreview(file.type)) {
      setMessage("DOC and DOCX files cannot be previewed in the browser. You can submit the selected document directly.");
      return;
    }
    setMessage("");
    setPreview((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return { name: file.name, type: file.type, url: URL.createObjectURL(file) };
    });
  };

  if (loading) return <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Loading assignments…</div>;
  if (!context) return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{pageError || "Unable to load assignments."}</div>;

  return (
    <div>
      {pageError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{pageError}</p>}
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
          Practice & submission
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy">
          Assignments
        </h1>

      </header>
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {visible.map((item) => {
          const submission = item.submission;
          return (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold text-violet-700">
                  {item.type}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold ${submission?.status === "Reviewed" ? "bg-emerald-100 text-emerald-700" : submission ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {submission?.status || "Pending"}
                </span>
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-brand-navy">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">
                {item.instructions}
              </p>
              <div className="mt-4 grid grid-cols-3 rounded-xl bg-slate-50 p-3 text-xs">
                <span>
                  <small className="block text-slate-400">Subject</small>
                  {item.subject}
                </span>
                <span>
                  <small className="block text-slate-400">Due</small>
                  {item.dueDate}
                </span>
                <span>
                  <small className="block text-slate-400">Marks</small>
                  {item.totalMarks}
                </span>
              </div>
              {item.attachmentName && (
                <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
                  <p className="truncate text-xs font-semibold text-brand-navy">
                    Tutor attachment: {item.attachmentName}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {canPreview(item.attachmentType) && (
                      <button
                        type="button"
                        onClick={() =>
                          openFile(item, "attachment")
                        }
                        className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-[10px] font-bold text-violet-700"
                      >
                        Preview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openFile(item, "attachment", true)}
                      className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-bold text-white no-underline"
                    >
                      Download
                    </button>
                  </div>
                  {!canPreview(item.attachmentType) && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      DOC/DOCX files must be downloaded to open.
                    </p>
                  )}
                </div>
              )}
              {submission && (
                <div className="mt-3 flex items-center justify-between rounded-xl border bg-white p-3 text-xs">
                  <span className="truncate text-slate-500">
                    Your document: {submission.fileName}
                  </span>
                  {canPreview(submission.fileType) ? (
                    <button
                      type="button"
                      onClick={() =>
                        openFile(item, "submission")
                      }
                      className="ml-3 shrink-0 font-bold text-violet-700"
                    >
                      Preview
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openFile(item, "submission", true)}
                      className="ml-3 shrink-0 font-bold text-violet-700"
                    >
                      Download
                    </button>
                  )}
                </div>
              )}
              {submission?.status === "Reviewed" && (
                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                  <strong>
                    Score: {submission.marks}/{item.totalMarks}
                  </strong>
                  <p className="mt-1">{submission.feedback}</p>
                </div>
              )}
              <button
                disabled={submission?.status === "Reviewed"}
                onClick={() => {
                  setUploading(item);
                  setFile(null);
                  setMessage("");
                }}
                className="mt-4 rounded-xl bg-brand-navy px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submission?.status === "Reviewed"
                  ? "Reviewed"
                  : submission
                    ? "Replace Answer Document"
                    : "Upload Answer Document"}
              </button>
            </article>
          );
        })}
        {!visible.length && (
          <p className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-400 lg:col-span-2">
            {context.enrollment ? "No published assignments for your batch." : "Your batch is not assigned yet."}
          </p>
        )}
      </section>

      {uploading && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-2xl bg-white p-5"
          >
            <h2 className="font-heading text-xl font-bold">
              Submit Completed Work
            </h2>
            <p className="mt-1 text-xs text-slate-500">{uploading.title}</p>
            <div className="mt-5">
              <p className="text-xs font-semibold">Completed answer document</p>
              <label
                htmlFor="student-assignment-upload"
                className="mt-2 flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/70 p-4 transition hover:border-violet-500 hover:bg-violet-50 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 3v5h5M12 17V11m0 0-2.5 2.5M12 11l2.5 2.5" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <strong className="block text-xs text-brand-navy">
                    {file ? "Change document" : "Upload document"}
                  </strong>
                  <span className="mt-1 block truncate text-[10px] font-normal text-slate-500">
                    {file ? file.name : "Click to select your completed assignment"}
                  </span>
                </span>
                <input
                  id="student-assignment-upload"
                  required
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] || null);
                    setMessage("");
                  }}
                  className="sr-only"
                />
              </label>
              {file && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-[11px] text-brand-navy">
                      {file.name}
                    </strong>
                    <span className="mt-0.5 block text-[10px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · Ready to submit
                    </span>
                  </div>
                  {canPreview(file.type) ? (
                    <button
                      type="button"
                      onClick={previewSelectedFile}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-2 text-[10px] font-bold text-violet-700 transition hover:bg-violet-50"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                      Preview
                    </button>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">
                      Word preview unavailable
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              PDF, DOC, DOCX, JPG or PNG · maximum 1 MB.
            </p>
            {message && (
              <p className="mt-3 text-xs font-bold text-rose-600">{message}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setUploading(null);
                  setFile(null);
                }}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>
              <button disabled={saving} className="rounded-xl bg-brand-navy px-4 py-2 font-bold text-white disabled:opacity-50">
                {saving ? "Submitting…" : "Submit Document"}
              </button>
            </div>
          </form>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[110] flex flex-col bg-slate-950/85 p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Document preview"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b bg-white px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-brand-navy"
              >
                ← Back
              </button>
              <div className="min-w-0">
                <h2 className="font-heading text-base font-bold text-brand-navy">
                  Document Preview
                </h2>
                <p className="max-w-[48vw] truncate text-[10px] text-slate-500">
                  {preview.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={preview.url}
                download={preview.name}
                className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline"
              >
                Download
              </a>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-brand-navy"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-b-2xl bg-slate-100 shadow-2xl">
            {preview.type === "application/pdf" ? (
              <iframe
                title={preview.name}
                src={preview.url}
                className="h-full min-h-[72vh] w-full border-0"
              />
            ) : (
              <div className="flex h-full min-h-[72vh] items-center justify-center overflow-auto p-4">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
          <p className="mx-auto mt-2 text-[10px] text-white/70">
            Press Esc to return to assignments
          </p>
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
