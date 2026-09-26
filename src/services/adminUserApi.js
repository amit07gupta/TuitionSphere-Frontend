import { authenticatedRequest } from './authApi';
const roles = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin' };
const statuses = { ACTIVE: 'Active', INACTIVE: 'Inactive', BLOCKED: 'Blocked' };
const normalize = (user) => ({ ...user, role: roles[user.role], status: statuses[user.status], phone: user.phone || '' });
const payload = (form) => ({ name: form.name, email: form.email, phone: form.phone, role: form.role.replaceAll(' ', '_').toUpperCase(), status: form.status.toUpperCase(), ...(form.password ? { password: form.password } : {}) });
export async function fetchAdminUsers(filters = {}) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  return (await authenticatedRequest(`/admin-users${params.size ? `?${params}` : ''}`)).data.map(normalize);
}
export const createAdminUser = async (form) => normalize((await authenticatedRequest('/admin-users', { method: 'POST', body: JSON.stringify(payload(form)) })).data);
export const updateAdminUser = async (id, form) => normalize((await authenticatedRequest(`/admin-users/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload(form)) })).data);
export const updateAdminUserStatus = async (id, status) => normalize((await authenticatedRequest(`/admin-users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status: status.toUpperCase() }) })).data);
