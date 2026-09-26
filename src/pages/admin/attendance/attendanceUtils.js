import { scheduledSessions } from '../../../services/attendanceApi';

export const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const today = dateKey();
export const statuses = ['Present', 'Absent', 'Leave'];
export const fieldClass = 'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
export const statusTone = { Present: 'bg-emerald-100 text-emerald-700', Absent: 'bg-rose-100 text-rose-700', Leave: 'bg-violet-100 text-violet-700' };
export const statusIconColor = { Present: '#047857', Absent: '#be123c', Leave: '#6d28d9' };
export const requestTone = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-emerald-100 text-emerald-700', Rejected: 'bg-rose-100 text-rose-700', Cancelled: 'bg-slate-100 text-slate-600' };

export const sessionStartDate = (date, time) => new Date(`${date}T${time}:00+05:30`);
const daysAgoKey = (days) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return dateKey(value);
};
export const latestMarkableDate = (batchId, schedules) => {
  if (!batchId) return today;
  const latest = scheduledSessions(schedules, batchId, daysAgoKey(370), today)
    .filter((session) => sessionStartDate(session.date, session.startTime) <= new Date())
    .at(-1);
  return latest?.date || today;
};

