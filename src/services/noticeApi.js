import { authenticatedRequest } from './authApi';
export async function fetchNotices(filters = {}) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  return (await authenticatedRequest(`/notices${params.size ? `?${params}` : ''}`)).data;
}
export const fetchNotice = async (id) => (await authenticatedRequest(`/notices/${encodeURIComponent(id)}`)).data;
export const createNotice = async (notice) => (await authenticatedRequest('/notices', { method: 'POST', body: JSON.stringify(notice) })).data;
export const updateNotice = async (id, notice) => (await authenticatedRequest(`/notices/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(notice) })).data;
export const archiveNotice = async (id) => (await authenticatedRequest(`/notices/${encodeURIComponent(id)}/archive`, { method: 'PATCH' })).data;
