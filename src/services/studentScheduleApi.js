import { studentAuthenticatedRequest } from './authApi';

const displayTime = (value) => {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return value || '';
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export async function fetchStudentSchedule() {
  const payload = await studentAuthenticatedRequest('/student/schedule');
  const context = payload.data;
  return {
    studentCode: context.studentCode,
    enrollment: context.enrollment && {
      ...context.enrollment,
      learningMode: context.enrollment.learningMode === 'ONLINE' ? 'Online' : 'Offline',
    },
    schedules: context.schedules.map((item) => ({
      ...item,
      startDate: String(item.startDate).slice(0, 10),
      endDate: String(item.endDate).slice(0, 10),
      repeatDays: (item.repeatDays || []).map((day) => day.toLowerCase()),
      startTime: displayTime(item.startTime),
      endTime: displayTime(item.endTime),
      mode: item.learningMode === 'ONLINE' ? 'Online' : 'Offline',
      status: item.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled',
    })),
  };
}
