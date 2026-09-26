import { studentAuthenticatedRequest } from './authApi';

export async function fetchStudentNotices() {
  const data = (await studentAuthenticatedRequest('/student/notices')).data;
  return { ...data, notices: data.notices || [] };
}

export async function markAllStudentNoticesRead() {
  const data = (await studentAuthenticatedRequest('/student/notices/read-all', { method: 'POST' })).data;
  return { ...data, notices: data.notices || [] };
}
