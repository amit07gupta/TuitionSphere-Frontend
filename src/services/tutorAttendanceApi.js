import { tutorAuthenticatedRequest } from './authApi';

export async function fetchTutorAttendance(date) {
  const payload = await tutorAuthenticatedRequest(`/tutor/attendance?date=${encodeURIComponent(date)}`);
  return payload.data;
}

export async function saveTutorAttendance(date, records) {
  const payload = await tutorAuthenticatedRequest('/tutor/attendance', {
    method: 'PUT',
    body: JSON.stringify({ date, records }),
  });
  return payload.data;
}
