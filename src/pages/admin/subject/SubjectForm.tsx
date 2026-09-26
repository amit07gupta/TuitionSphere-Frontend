import { createPortal } from "react-dom";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import useAccessibleModal from "../../../hooks/useAccessibleModal";

const streams = ["Science", "Commerce"];
export const emptySubjectForm = { name: "", code: "", boardId: "", gradeIds: [], streams: [], status: "Active" };
const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function SubjectForm({ title, form, setForm, boards, grades, error, isSaving, onClose, onSubmit }) {
  const modalRef = useAccessibleModal(true, onClose);
  const eligibleGrades = form.boardId
    ? grades.filter((grade) => grade.boardIds.includes(form.boardId))
    : [];
  const hasSeniorGrade = form.gradeIds.some((id) => Number(grades.find((grade) => grade.id === id)?.value) >= 11);
  const toggle = (field, value) => setForm((current) => ({
    ...current,
    [field]: current[field].includes(value)
      ? current[field].filter((item) => item !== value)
      : [...current[field], value],
  }));
  const changeBoard = (boardId) => setForm({ ...form, boardId, gradeIds: [], streams: [] });

  return createPortal(
    <div className="board-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
      <form ref={modalRef} onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="subject-form-title" tabIndex="-1" className="board-form subject-form my-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:my-0 sm:max-h-[calc(100dvh-3rem)]">
        <header className="board-form-header flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="board-form-icon"><AdminMetricIcon name="book" className="h-5 w-5" /></span><div><p>Academic setup</p><h2 id="subject-form-title">{title}</h2><span>Define the subject and its applicable board and grades.</span></div></div>
          <button type="button" disabled={isSaving} onClick={onClose} aria-label="Close subject form" className="board-form-close">✕</button>
        </header>
        <div className="board-form-content min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="board-form-note"><i>i</i><p><strong>Subject information</strong><span>Select a board to choose applicable grades. Stream options appear for Grades 11–12.</span></p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold">Subject Name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Mathematics" className={fieldClass} /></label>
            <label className="text-xs font-semibold">Subject Code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="e.g. MATH" className={fieldClass} /></label>
            <label className="text-xs font-semibold">Board<select required value={form.boardId} onChange={(event) => changeBoard(event.target.value)} className={fieldClass}><option value="">Select Board</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.code} · {board.name}</option>)}</select></label>
            <label className="text-xs font-semibold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={fieldClass}><option>Active</option><option>Inactive</option></select></label>
            <fieldset className="rounded-xl border p-3 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Applicable Grades</legend><div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">{eligibleGrades.map((grade) => <label key={grade.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${form.gradeIds.includes(grade.id) ? "border-blue-400 bg-blue-50" : "border-slate-200"}`}><input type="checkbox" checked={form.gradeIds.includes(grade.id)} onChange={() => toggle("gradeIds", grade.id)} />{grade.name}</label>)}</div>{form.boardId && eligibleGrades.length === 0 && <p className="text-xs text-rose-600">No Grade is configured for this Board.</p>}{!form.boardId && <p className="text-xs text-slate-500">Select a Board first.</p>}</fieldset>
            {hasSeniorGrade && <fieldset className="rounded-xl border p-3 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Streams (Grades 11–12)</legend><div className="flex gap-2">{streams.map((stream) => <label key={stream} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${form.streams.includes(stream) ? "border-violet-400 bg-violet-50" : "border-slate-200"}`}><input type="checkbox" checked={form.streams.includes(stream)} onChange={() => toggle("streams", stream)} />{stream}</label>)}</div></fieldset>}
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
        </div>
        <footer className="board-form-footer flex shrink-0 flex-col-reverse gap-2 px-4 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={onClose} disabled={isSaving} className="board-form-cancel rounded-xl px-5 py-2.5 text-xs font-semibold">Cancel</button><button disabled={isSaving} className="board-form-save rounded-xl px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">{isSaving ? "Saving..." : "Save Subject"}</button></footer>
      </form>
    </div>, document.body,
  );
}
