import { createPortal } from 'react-dom';
import { fieldClass } from './adminUserUtils';

export default function AdminUserForm({ modalRef, submit, editingId, currentAdminId, saving, closeForm, form, setForm, error }) {
  return createPortal((<div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <form ref={modalRef} onSubmit={submit} role="dialog" aria-modal="true" tabIndex="-1" className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold-dark">Administration</p>
                <h2 className="font-heading text-xl font-bold text-brand-navy">{editingId ? 'Edit Admin' : 'Add New Admin'}</h2>
              </div>
              <button type="button" disabled={saving} onClick={closeForm} aria-label="Close admin form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">✕</button>
            </div>

            <fieldset disabled={saving} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Full Name
                <input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} placeholder="Enter admin name" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Email Address
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} placeholder="admin@example.com" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Phone Number
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={fieldClass} inputMode="numeric" placeholder="10-digit mobile number" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Role
                <select disabled={editingId === currentAdminId} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={fieldClass}>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">Status
                <select disabled={editingId === currentAdminId} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={fieldClass}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Blocked</option>
                </select>
              </label>
              {editingId ? <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Existing password remains unchanged.</p> : <label className="text-xs font-semibold text-slate-700">Initial Password
                <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={fieldClass} />
                <span className="mt-1 block font-normal text-slate-500">At least 8 characters. Share securely with the new administrator.</span>
              </label>}
            </fieldset>

            {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={saving} onClick={closeForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Admin'}</button>
            </div>
          </form>
        </div>), document.body);
}
