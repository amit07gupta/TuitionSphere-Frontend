import { authenticatedRequest } from './authApi';
export const fetchAssignments = async (filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  return (await authenticatedRequest(`/assignments${params.size ? `?${params}` : ''}`)).data;
};
export const fetchAssignment = async (id) => (await authenticatedRequest(`/assignments/${encodeURIComponent(id)}`)).data;
export const archiveAssignment = async (item) => (await authenticatedRequest(`/assignments/${encodeURIComponent(item.id)}/archive`, {
  method: 'PATCH', body: JSON.stringify({ action: item.status === 'Archived' ? 'restore' : 'archive', expectedStatus: item.status }),
})).data;
