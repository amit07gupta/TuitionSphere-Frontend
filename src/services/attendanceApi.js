import { authenticatedRequest } from './authApi';
export const fetchAttendance = async (filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  return (await authenticatedRequest(`/attendance${params.size ? `?${params}` : ''}`)).data;
};
export const saveAttendance = async (date, records) => (await authenticatedRequest('/attendance', { method: 'PUT', body: JSON.stringify({ date, records }) })).data;
export const reviewLeave = async (id, status, rejectionReason = '') => (await authenticatedRequest(`/attendance/leave-requests/${encodeURIComponent(id)}/review`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) })).data;

export function scheduledSessions(schedules, batchId, fromDate, toDate) {
  const rows = [];
  const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  for (const day = new Date(`${fromDate}T00:00:00Z`); day <= new Date(`${toDate}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10);
    for (const s of schedules) {
      if (s.batchId === batchId && s.status === 'SCHEDULED' && date >= s.startDate && date <= s.endDate && (s.scheduleType === 'SINGLE' ? date === s.startDate : s.repeatDays.includes(weekdays[day.getUTCDay()]))) rows.push({ ...s, classId: s.id, date });
    }
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}
