import { authenticatedRequest } from './authApi';

function displayTime(value) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return value || '';
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function normalizeClassSchedule(item) {
  const recurring = item.scheduleType === 'RECURRING';
  const startDate = String(item.startDate || '').slice(0, 10);
  const endDate = String(item.endDate || '').slice(0, 10);
  return {
    ...item,
    scheduleType: recurring ? 'Recurring' : 'Single',
    date: recurring ? undefined : startDate,
    startDate,
    endDate,
    repeatDays: (item.repeatDays || []).map((day) => day.toLowerCase()),
    startTime: displayTime(item.startTime),
    endTime: displayTime(item.endTime),
    subject: item.subject?.name || '',
    batchName: item.batch?.name || '',
    grade: String(item.batch?.grade?.numericValue ?? ''),
    board: item.batch?.board?.code || '',
    mentor: item.tutor?.user?.name || '',
    mode: item.learningMode === 'ONLINE' ? 'Online' : 'Offline',
    status: item.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled',
  };
}

const payloadFor = (item) => ({
  batchId: item.batchId,
  subjectId: item.subjectId,
  tutorId: item.tutorId,
  scheduleType: item.scheduleType === 'Recurring' || item.scheduleType === 'Weekly' ? 'RECURRING' : 'SINGLE',
  topic: item.topic || null,
  startDate: item.startDate || item.date,
  endDate: item.endDate || item.repeatUntil || item.date,
  repeatDays: (item.repeatDays || []).map((day) => day.toUpperCase()),
  startTime: item.startTime,
  endTime: item.endTime,
  location: item.location || null,
  meetingUrl: item.meetingUrl || null,
  status: item.status === 'Cancelled' ? 'CANCELLED' : 'SCHEDULED',
});

export async function fetchClassSchedules(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  const payload = await authenticatedRequest(`/class-schedules${params.size ? `?${params}` : ''}`);
  return payload.data.map(normalizeClassSchedule);
}

export async function createClassSchedule(item) {
  const payload = await authenticatedRequest('/class-schedules', { method: 'POST', body: JSON.stringify(payloadFor(item)) });
  return normalizeClassSchedule(payload.data);
}

export async function updateClassSchedule(id, item) {
  const payload = await authenticatedRequest(`/class-schedules/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payloadFor(item)) });
  return normalizeClassSchedule(payload.data);
}

export async function cancelClassSchedule(id) {
  const payload = await authenticatedRequest(`/class-schedules/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
  return normalizeClassSchedule(payload.data);
}
