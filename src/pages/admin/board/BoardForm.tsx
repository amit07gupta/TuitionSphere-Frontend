import { createPortal } from "react-dom";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import useAccessibleModal from "../../../hooks/useAccessibleModal";

export const emptyBoardForm = {
  name: "",
  code: "",
  description: "",
  status: "Active",
};

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function BoardForm({
  title,
  form,
  setForm,
  error,
  isSaving,
  onClose,
  onSubmit,
}) {
  const modalRef = useAccessibleModal(true, onClose);

  return createPortal(
    <div className="board-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <form
        ref={modalRef}
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-form-title"
        tabIndex="-1"
        className="board-form my-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:my-0 sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="board-form-header flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="board-form-icon"><AdminMetricIcon name="educationBoard" className="h-5 w-5" /></span>
            <div><p>Academic setup</p>
            <h2 id="board-form-title">
              {title}
            </h2>
            <span>{title.startsWith("Edit") ? "Update the board name, code and status." : "Add a board that can be assigned across academic modules."}</span></div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close board form"
            className="board-form-close"
          >
            ✕
          </button>
        </div>

        <div className="board-form-content min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="board-form-note"><i>i</i><p><strong>Board information</strong><span>Use the official board name and a short unique code such as CBSE or ICSE.</span></p></div>
          <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">
            Board Name
            <input
              required
              autoFocus
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Central Board of Secondary Education"
              className={fieldClass}
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Board Code
            <input
              required
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
              placeholder="e.g. CBSE"
              className={fieldClass}
            />
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className={fieldClass}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          </div>

          {error && (
            <p role="alert" className="board-form-error mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}
        </div>

        <div className="board-form-footer flex shrink-0 flex-col-reverse gap-2 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="board-form-cancel rounded-xl px-5 py-2.5 text-xs font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="board-form-save rounded-xl px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Board"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
