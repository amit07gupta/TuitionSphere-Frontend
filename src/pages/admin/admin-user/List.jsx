import NewAdminUser from './NewAdminUser';
import EditAdminUser from './EditAdminUser';
import { emptyForm, fieldClass } from './adminUserUtils';
import { useEffect, useMemo, useRef, useState } from 'react';
import AdminActionIcon from '../../../components/admin/AdminActionIcon';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import useAccessibleModal from '../../../hooks/useAccessibleModal';
import { fetchAdminUsers, createAdminUser, updateAdminUser, updateAdminUserStatus } from '../../../services/adminUserApi';
import AdminPagination from '../../../components/admin/AdminPagination';
import useTablePagination from '../../../hooks/useTablePagination';


function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const closeForm = () => { if (!busy.current) { setOpen(false); setForm(emptyForm); } };
  const modalRef = useAccessibleModal(open, closeForm);
  const currentAdminId = sessionStorage.getItem('tuitionsphere_admin_id');
  const currentAdminRole = sessionStorage.getItem('tuitionsphere_admin_role');
  const canManageAdmins = currentAdminRole === 'Super Admin';

  const activeCount = useMemo(
    () => admins.filter((admin) => admin.status === 'Active').length,
    [admins],
  );

  useEffect(() => {
    if (!canManageAdmins) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetchAdminUsers(filters).then((rows) => { if (active) { setAdmins(rows); setPageError(''); } })
        .catch((e) => { if (active) { setPageError(e.message); setAdmins([]); } })
        .finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [filters, revision, canManageAdmins]);
  const { page, pageSize, pageItems, setPage } = useTablePagination(admins);
  const changeFilter = (key, value) => { setFilters((old) => ({ ...old, [key]: value })); setLoading(true); setPage(1); };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setNotice('');
    setOpen(true);
  };

  const startEdit = (admin) => {
    setEditingId(admin.id);
    setForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      role: admin.role,
      status: admin.status,
      password: '',
    });
    setError('');
    setNotice('');
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setSaving(true); setError(''); setNotice('');
    try {
      const updated = editingId ? await updateAdminUser(editingId, form) : await createAdminUser(form);
      if (updated.id === currentAdminId) sessionStorage.setItem('tuitionsphere_admin_name', updated.name);
      setOpen(false); setForm(emptyForm);
      setNotice(editingId ? 'Administrator account updated.' : 'Administrator created. Sign in with the initial password you entered.');
      setRevision((value) => value + 1);
    } catch (e) { setError(e.message); }
    finally { busy.current = false; setSaving(false); }
  };
  const toggleStatus = async (admin) => {
    if (busy.current) return;
    busy.current = true; setSaving(true); setPageError(''); setNotice('');
    try {
      const updated = await updateAdminUserStatus(admin.id, admin.status === 'Active' ? 'Inactive' : 'Active');
      setNotice(`${updated.name} is now ${updated.status.toLowerCase()}.`); setRevision((value) => value + 1);
    } catch (e) { setPageError(e.message); }
    finally { busy.current = false; setSaving(false); }
  };

  const AdminEditor = editingId ? EditAdminUser : NewAdminUser;
  return (
    <div>
      <AdminPageHeader
        eyebrow="Administration"
        title="Admin Users"
        description="Create and control administrator access for the TuitionSphere admin panel."
        icon="students"
        meta={`${activeCount} active admins in current results`}
      />

      {!canManageAdmins ? (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Only a Super Admin can create or update administrator accounts.
        </section>
      ) : (
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">Administrator Directory</h2>
              <p className="text-xs text-slate-500">Deactivate unused accounts instead of deleting access history.</p>
            </div>
            <button type="button" disabled={saving || loading} onClick={startCreate} className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-900">
              + Add Admin
            </button>
          </div>

          {notice && (
            <p role="status" className="m-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs font-semibold text-sky-800">
              {notice}
            </p>
          )}

          {pageError && <p role="alert" className="m-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{pageError}</p>}
          {loading && <p role="status" className="m-4 text-sm text-slate-500">Loading administrators…</p>}
          <div className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-3">
            <input aria-label="Search administrators" placeholder="Search name, email or phone" value={filters.search} onChange={(e) => changeFilter('search', e.target.value)} className={fieldClass} />
            <select aria-label="Filter by role" value={filters.role} onChange={(e) => changeFilter('role', e.target.value)} className={fieldClass}><option value="">All roles</option><option>Admin</option><option>Super Admin</option></select>
            <select aria-label="Filter by status" value={filters.status} onChange={(e) => changeFilter('status', e.target.value)} className={fieldClass}><option value="">All statuses</option><option>Active</option><option>Inactive</option><option>Blocked</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead className="bg-[#102044] text-white">
                <tr>
                  {['Administrator', 'Contact', 'Role', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className={`border border-blue-300/25 px-4 py-3 ${heading === 'Actions' ? 'text-center' : ''}`}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((admin) => (
                  <tr key={admin.id} className="hover:bg-blue-50/50">
                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">{admin.name}</strong>
                      <span className="block text-[10px] text-slate-400">{admin.id}</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span className="font-semibold text-slate-700">{admin.email}</span>
                      <span className="block text-[10px] text-slate-400">{admin.phone || 'Phone not added'}</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-700">{admin.role}</td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{admin.status}</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button type="button" disabled={saving || loading} onClick={() => startEdit(admin)} aria-label={`Edit ${admin.name}`} title="Edit admin" className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700">
                          <AdminActionIcon name="edit" />
                        </button>
                        <button type="button" disabled={saving || loading || admin.id === currentAdminId} onClick={() => toggleStatus(admin)} aria-label={`${admin.status === 'Active' ? 'Deactivate' : 'Activate'} ${admin.name}`} title={admin.status === 'Active' ? 'Deactivate admin' : 'Activate admin'} className={`admin-action-native ${admin.status === 'Active' ? '!border-rose-200 !bg-rose-50 !text-rose-700' : '!border-emerald-200 !bg-emerald-50 !text-emerald-700'}`}>
                          <AdminActionIcon name={admin.status === 'Active' ? 'deactivate' : 'activate'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !admins.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No administrators match the filters.</td></tr>}
              </tbody>
            </table>
          </div>
          <AdminPagination page={page} pageSize={pageSize} totalItems={admins.length} onPageChange={setPage} />
        </section>
      )}

      {open && <AdminEditor modalRef={modalRef} submit={submit} editingId={editingId} currentAdminId={currentAdminId} saving={saving} closeForm={closeForm} form={form} setForm={setForm} error={error} />}
    </div>
  );
}

export default AdminUsers;
