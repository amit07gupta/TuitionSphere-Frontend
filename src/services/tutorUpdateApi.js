import { tutorAuthenticatedRequest } from './authApi';
export async function fetchTutorUpdates(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  return (await tutorAuthenticatedRequest(`/tutor/updates${params.size ? `?${params}` : ''}`)).data;
}
export const createTutorUpdate = async (data) => (await tutorAuthenticatedRequest('/tutor/updates', { method: 'POST', body: JSON.stringify(data) })).data;
export const updateTutorUpdate = async (id, data) => (await tutorAuthenticatedRequest(`/tutor/updates/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })).data;
export const archiveTutorUpdate = async (id) => (await tutorAuthenticatedRequest(`/tutor/updates/${encodeURIComponent(id)}/archive`, { method: 'PATCH' })).data;
