import { tutorAuthenticatedRequest } from './authApi';
import { normalizeClassSchedule } from './classScheduleApi';

export async function fetchTutorSchedule(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  const payload = await tutorAuthenticatedRequest(`/tutor/schedule${params.size ? `?${params}` : ''}`);
  const schedules = Array.isArray(payload.data) ? payload.data : payload.data?.schedules || [];
  return {
    schedules: schedules.map(normalizeClassSchedule),
    academicSession: payload.data?.academicSession || null,
  };
}
