import { createPortal } from "react-dom";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import useAccessibleModal from "../../../hooks/useAccessibleModal";

export const learningStages = [
  "Primary Foundation",
  "Middle School Foundation",
  "Board Preparation",
  "Senior Secondary",
];

export const emptyGradeForm = {
  name: "",
  value: "",
  boardIds: [],
  learningStage: learningStages[0],
  status: "Active",
};

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function GradeForm({
  title,
  form,
  setForm,
  boards,
  error,
  isSaving,
  onClose,
  onSubmit,
}) {
  const modalRef = useAccessibleModal(true, onClose);

  const toggleBoard = (boardId) => {
    setForm((current) => ({
      ...current,
      boardIds: current.boardIds.includes(boardId)
        ? current.boardIds.filter((id) => id !== boardId)
        : [...current.boardIds, boardId],
    }));
  };

  return createPortal(
    <div className="board-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
      <form
        ref={modalRef}
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="grade-form-title"
        tabIndex="-1"
        className="board-form grade-form my-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:my-0 sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="board-form-header flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="board-form-icon"><AdminMetricIcon name="programs" className="h-5 w-5" /></span><div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
              Academic Setup
            </p>
            <h2 id="grade-form-title" className="font-heading text-xl font-bold text-brand-navy">
              {title}
            </h2>
            <span>Set the grade level, learning stage and applicable boards.</span>
          </div></div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close grade form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="board-form-content min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="board-form-note"><i>i</i><p><strong>Grade information</strong><span>Choose a unique numeric value from 1 to 12 and select at least one education board.</span></p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Grade Name
              <input
                required
                autoFocus
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. Grade 1"
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Numeric Value
              <input
                required
                type="number"
                min="1"
                max="12"
                value={form.value}
                onChange={(event) => setForm({ ...form, value: event.target.value })}
                placeholder="1 to 12"
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Learning Stage
              <select
                value={form.learningStage}
                onChange={(event) =>
                  setForm({ ...form, learningStage: event.target.value })
                }
                className={fieldClass}
              >
                {learningStages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
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

            <fieldset className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
              <legend className="px-1 text-xs font-semibold text-slate-700">
                Applicable Boards (select one or more)
              </legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {boards.map((board) => (
                  <label
                    key={board.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                      form.boardIds.includes(board.id)
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.boardIds.includes(board.id)}
                      onChange={() => toggleBoard(board.id)}
                    />
                    <span>{board.code}</span>
                    <span className="truncate font-normal text-slate-500">{board.name}</span>
                  </label>
                ))}
              </div>
              {boards.length === 0 && (
                <p className="mt-1 text-xs text-rose-600">
                  No active Board is available. Create or activate a Board first.
                </p>
              )}
            </fieldset>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
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
            disabled={isSaving || boards.length === 0}
            className="board-form-save rounded-xl px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Grade"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
