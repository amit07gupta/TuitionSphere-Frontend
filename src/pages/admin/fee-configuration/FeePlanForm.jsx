import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAccessibleModal from '../../../hooks/useAccessibleModal';
const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500';
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const toDate = (value) => value ? new Date(value + 'T00:00:00') : null;
const toValue = (value) => value ? value.getFullYear() + '-' + String(value.getMonth()+1).padStart(2,'0') + '-' + String(value.getDate()).padStart(2,'0') : '';
function CalendarField({ label, value, minDate, onChange, saving }) {
  const updateDate = (date) => onChange(toValue(date));

  return <label className="text-xs font-semibold">{label}<DatePicker required selected={toDate(value)} minDate={toDate(minDate)} onChange={updateDate} onSelect={updateDate} dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" showMonthDropdown showYearDropdown dropdownMode="select" scrollableYearDropdown yearDropdownItemNumber={8} isClearable autoComplete="off" disabled={saving} readOnly={false} shouldCloseOnSelect portalId="fee-configuration-datepicker-root" className={`${fieldClass} cursor-pointer`} wrapperClassName="w-full" popperClassName="fee-configuration-datepicker" /></label>;
}


export default function FeePlanForm({form,editingId,sessions,grades,update,submit,onClose,error,saving}) {
 const modalRef = useAccessibleModal(true, onClose);
  return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:p-4">
        <form ref={modalRef} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="fee-configuration-title" tabIndex="-1" className="fee-plan-form flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
          <header className="flex shrink-0 items-start justify-between gap-3 border-b bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div><p className="text-[9px] font-bold uppercase text-blue-600">Grade-wise Finance Setup</p><h2 id="fee-configuration-title" className="mt-1 font-heading text-xl font-bold text-brand-navy">{editingId ? 'Edit Grade Fee' : 'Add Grade Fee'}</h2><p className="mt-1 text-xs text-slate-500">One fee for the selected grade, across every board, subject and learning mode.</p></div>
            <button type="button" onClick={() => onClose()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close fee configuration">✕</button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <fieldset disabled={saving} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3"><h3 className="fee-form-section">Plan Details</h3>
              <label className="text-xs font-semibold">Academic Session<input readOnly value={sessions.find((session) => session.id === form.academicSessionId)?.name || 'No active session'} className={`${fieldClass} bg-slate-100 font-semibold`} /></label>
              <label className="text-xs font-semibold">Grade<select required value={form.gradeId} onChange={(event) => update('gradeId', event.target.value)} className={fieldClass}><option value="">Select grade</option>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></label>
              <label className="text-xs font-semibold">Plan Name<input readOnly value={form.name} placeholder="Generated after grade selection" className={`${fieldClass} bg-slate-100`} /></label>
              <label className="text-xs font-semibold">Status<select value={form.status} onChange={(event) => update('status', event.target.value)} className={fieldClass}><option>Draft</option><option>Active</option>{form.status === 'Archived' && <option>Archived</option>}</select></label>
              <h3 className="fee-form-section">Fee Structure</h3>
              <label className="text-xs font-semibold">Admission Fee<input required type="number" min="0" step="0.01" value={form.admissionFee} onChange={(event) => update('admissionFee', event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Tuition Fee Per Installment<input required type="number" min="0.01" step="0.01" value={form.tuitionFee} onChange={(event) => update('tuitionFee', event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Billing Frequency<select value={form.billingFrequency} onChange={(event) => update('billingFrequency', event.target.value)} className={fieldClass}><option>Monthly</option><option>Quarterly</option><option>Full Session</option></select></label>
              <label className="text-xs font-semibold">Installments<input readOnly value={form.installments} className={`${fieldClass} bg-slate-100`} /></label>
              <h3 className="fee-form-section">Payment Rules & Validity</h3>
              <label className="text-xs font-semibold">Due Day (1–28)<input required type="number" min="1" max="28" value={form.dueDay} onChange={(event) => update('dueDay', event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Grace Period Days<input type="number" min="0" value={form.gracePeriodDays} onChange={(event) => update('gracePeriodDays', event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Late Fee<input type="number" min="0" step="0.01" value={form.lateFee} onChange={(event) => update('lateFee', event.target.value)} className={fieldClass} /></label>
              
              <CalendarField saving={saving} label="Effective From" value={form.effectiveFrom} onChange={(value) => update('effectiveFrom', value)} />
              <CalendarField saving={saving} label="Effective To" value={form.effectiveTo} minDate={form.effectiveFrom} onChange={(value) => update('effectiveTo', value)} />
              <p className="text-[10px] leading-4 text-slate-500 sm:col-span-2 lg:col-span-3">Academic-session dates are filled as defaults. You can clear either field or select another effective date from the calendar.</p>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800"><strong>Coverage:</strong> All active boards, every subject and both Online/Offline batches for this grade.</div>
              <div className="fee-preview"><span>Calculated plan total</span><strong>{currency.format((Number(form.admissionFee) || 0) + (Number(form.tuitionFee) || 0) * Number(form.installments))}</strong><p>Admission fee + {form.installments} tuition installments. Late fees excluded.</p><small>Fixed installments: Monthly 12 · Quarterly 4 · Full Session 1. Effective dates do not change this count.</small></div>
              {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 sm:col-span-2 lg:col-span-3">{error}</p>}
            </fieldset>
          </div>
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-slate-50 p-3 sm:flex-row sm:justify-end sm:gap-3 sm:p-4"><button type="button" onClick={() => onClose()} className="min-h-10 rounded-xl border border-slate-300 px-4 py-2.5 text-xs">Cancel</button><button disabled={saving} className="min-h-10 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white">{saving ? 'Saving…' : 'Save Grade Fee'}</button></footer>
        </form>
      </div>,
      document.body
    );
}
