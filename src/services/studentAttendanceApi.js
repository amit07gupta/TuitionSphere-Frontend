import { studentAuthenticatedRequest } from './authApi';

export async function fetchStudentAttendance() {
  return (await studentAuthenticatedRequest('/student/attendance')).data;
}

export async function submitStudentLeave(data, id) {
  const path = id ? `/student/attendance/leave-requests/${encodeURIComponent(id)}` : '/student/attendance/leave-requests';
  return (await studentAuthenticatedRequest(path, {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(data),
  })).data;
}

export async function cancelStudentLeave(id) {
  return (await studentAuthenticatedRequest(`/student/attendance/leave-requests/${encodeURIComponent(id)}/cancel`, {
    method: 'PATCH',
  })).data;
}
