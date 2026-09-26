const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10';

function StudentForm({ form, onChange, onSubmit, onCancel, submitting = false, error = '' }) {
  return <form onSubmit={onSubmit} className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="grid gap-5 p-5 sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-700">Student Name<input value={form.name} onChange={(event) => onChange('name', event.target.value)} className={fieldClass} required /></label>
      <label className="text-xs font-semibold text-slate-700">Parent / Guardian Name<input value={form.parentName} onChange={(event) => onChange('parentName', event.target.value)} className={fieldClass} required /></label>
      <label className="text-xs font-semibold text-slate-700">Parent Phone<input value={form.parentPhone} onChange={(event) => onChange('parentPhone', event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" className={fieldClass} required /></label>
      <label className="text-xs font-semibold text-slate-700">Date of Birth<input type="date" value={form.dateOfBirth} onChange={(event) => onChange('dateOfBirth', event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-slate-700">Gender<select value={form.gender} onChange={(event) => onChange('gender', event.target.value)} className={fieldClass}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
      <label className="text-xs font-semibold text-slate-700">Address<textarea value={form.address} onChange={(event) => onChange('address', event.target.value)} rows="1" className="mt-1.5 h-11 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10" /></label>
      <label className="text-xs font-semibold text-slate-700">Profile Status<select value={form.profileStatus} onChange={(event) => onChange('profileStatus', event.target.value)} className={fieldClass}><option value="INCOMPLETE">Incomplete</option><option value="COMPLETE">Complete</option></select></label>
      <label className="text-xs font-semibold text-slate-700">Account Status<select value={form.status} onChange={(event) => onChange('status', event.target.value)} className={fieldClass}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="BLOCKED">Blocked</option></select></label>
    </div>
    {error && <p className="mx-5 mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
    <footer className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold text-brand-navy">Cancel</button><button type="submit" disabled={submitting} className="rounded-xl bg-brand-navy px-6 py-3 text-xs font-bold text-white disabled:opacity-50">{submitting ? 'Saving…' : 'Save Student'}</button></footer>
  </form>;
}

export default StudentForm;
