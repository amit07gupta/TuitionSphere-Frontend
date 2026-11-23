import SearchableSelection from "./SearchableSelection";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import { createPortal } from "react-dom";
import useAccessibleModal from "../../../hooks/useAccessibleModal";

export const emptyTutorForm = { name: "", email: "", phone: "", employeeCode: "", designation: "", qualification: "", experience: "", availability: "", joinedOn: new Date().toISOString().slice(0, 10), boardIds: [], gradeIds: [], subjectIds: [], mode: [], streams: [], status: "Active" };
const modes = ["Offline", "Online"], streams = ["Science", "Commerce"];
const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const toggleValue = (form, field, value, checked) => ({ ...form, [field]: checked ? [...form[field], value] : form[field].filter((item) => item !== value) });

export default function TutorForm({ title, form, setForm, boards, grades, subjects, error, isSaving, onClose, onSubmit }) {
  const modalRef = useAccessibleModal(true, onClose);
  const eligibleGrades = grades.filter((grade) => grade.boardIds.some((id) => form.boardIds.includes(id)));
  const senior = form.gradeIds.some((id) => Number(grades.find((grade) => grade.id === id)?.value) >= 11);
  const eligibleSubjects = subjects.filter((subject) => subject.status === "Active" && form.boardIds.includes(subject.boardId) && subject.gradeIds.some((id) => form.gradeIds.includes(id)) && (!subject.streams.length || subject.streams.some((stream) => form.streams.includes(stream))));
  const changeAcademic = (field, value, checked) => setForm((current) => {
    const next = toggleValue(current, field, value, checked);
    if (field === "boardIds") next.gradeIds = next.gradeIds.filter((id) => grades.find((grade) => grade.id === id)?.boardIds.some((boardId) => next.boardIds.includes(boardId)));
    if (!next.gradeIds.some((id) => Number(grades.find((grade) => grade.id === id)?.value) >= 11)) next.streams = [];
    const allowed = new Set(subjects.filter((subject) => next.boardIds.includes(subject.boardId) && subject.gradeIds.some((id) => next.gradeIds.includes(id)) && (!subject.streams.length || subject.streams.some((stream) => next.streams.includes(stream)))).map((subject) => subject.id));
    next.subjectIds = next.subjectIds.filter((id) => allowed.has(id));
    return next;
  });

  const options = (items, field, label) => <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => { const value = item.id || item, text = label ? label(item) : item; return <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${form[field].includes(value) ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-500"}`}><input type="checkbox" checked={form[field].includes(value)} onChange={(event) => changeAcademic(field, value, event.target.checked)} /><span className="truncate">{text}</span></label>; })}</div>;

  const fields = (items) => items.map(([label, field, type]) => {
    const isPhone = field === "phone";
    const isName = field === "name";
    const handleChange = (event) => {
      let value = event.target.value;
      if (isPhone) value = value.replace(/\D/g, "").slice(0, 10);
      if (isName) value = value.replace(/[^\p{L}\s'-]/gu, "");
      setForm({ ...form, [field]: value });
    };

    return <label key={field} className="text-xs font-semibold">{label}<input required={!['qualification','experience','availability'].includes(field)} type={type} min={type === "number" ? "0" : undefined} max={type === "number" ? "60" : undefined} maxLength={isPhone ? 10 : undefined} inputMode={isPhone ? "numeric" : undefined} pattern={isPhone ? "[0-9]{10}" : undefined} title={isPhone ? "Enter exactly 10 digits" : isName ? "Use letters, spaces, apostrophes or hyphens only" : undefined} value={form[field]} placeholder={field === "availability" ? "e.g. Weekday evenings" : undefined} onChange={handleChange} className={fieldClass} /></label>;
  });
  return createPortal(<div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-0 sm:items-center sm:p-6"><form ref={modalRef} onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="tutor-form-title" tabIndex="-1" className="tutor-form flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl">
    <header className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6"><span className="tutor-heading-icon"><AdminMetricIcon name="tutor" /></span><div className="mr-auto ml-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-600">Academic Team</p><h2 id="tutor-form-title" className="font-heading text-xl font-bold text-brand-navy">{title}</h2></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100" aria-label="Close tutor form">✕</button></header>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"><fieldset disabled={isSaving} className="grid gap-4 sm:grid-cols-2">
      <h3 className="tutor-form-section">Personal Details</h3>
      {fields([['Full Name','name','text'],['Email Address','email','email'],['Phone Number','phone','tel']])}
      <h3 className="tutor-form-section">Professional Details</h3>
      {fields([['Employee Code','employeeCode','text'],['Designation','designation','text'],['Qualification (optional)','qualification','text'],['Experience in years (optional)','experience','number']])}
      <label className="text-xs font-semibold">Joining Date<input required type="date" value={form.joinedOn} onChange={(event) => setForm({ ...form, joinedOn: event.target.value })} className={fieldClass} /></label>
      <label className="text-xs font-semibold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={fieldClass}><option>Active</option><option>Inactive</option></select></label>
      <h3 className="tutor-form-section">Teaching Details</h3>
      <SearchableSelection label="Education Boards" items={boards} selected={form.boardIds} onToggle={(id, checked) => changeAcademic("boardIds", id, checked)} getLabel={item => item.code + " · " + item.name} />
      <SearchableSelection label="Grades" items={eligibleGrades} selected={form.gradeIds} onToggle={(id, checked) => changeAcademic("gradeIds", id, checked)} getLabel={item => item.name} emptyText="Select a board with available grades." />
      {senior && <fieldset className="rounded-xl border border-violet-200 p-3 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Streams for Grades 11–12</legend>{options(streams, "streams")}</fieldset>}
      <fieldset className="rounded-xl border p-3 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Subjects</legend>{eligibleSubjects.length ? options(eligibleSubjects, "subjectIds", (item) => item.name) : <p className="text-xs text-slate-500">Select matching Board and Grade{senior ? " and Stream" : ""} first.</p>}</fieldset>
      <fieldset className="rounded-xl border p-3 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Teaching Modes</legend>{options(modes, "mode")}</fieldset>
      {fields([['Availability (optional)','availability','text']])}
      <p className="text-xs text-slate-500 sm:col-span-2">Exact class timings are managed in Batches and Class Schedules.</p>
    </fieldset>{error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}</div>
    <footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" disabled={isSaving} onClick={onClose} className="rounded-xl border px-5 py-2.5 text-xs font-semibold">Cancel</button><button disabled={isSaving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">{isSaving ? "Saving..." : "Save Tutor"}</button></footer>
  </form></div>, document.body);
}
