import { tutorAuthenticatedRequest } from './authApi';

export async function fetchTutorStudents(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  const payload = await tutorAuthenticatedRequest(`/tutor/students${params.size ? `?${params}` : ''}`);
  return {
    students: payload.data?.students || [],
    assignedBatches: payload.data?.assignedBatches || [],
    academicSession: payload.data?.academicSession || null,
  };
}
