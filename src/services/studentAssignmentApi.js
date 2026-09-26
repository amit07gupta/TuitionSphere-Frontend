import { studentAuthenticatedRequest } from './authApi';

export async function fetchStudentAssignments() {
  return (await studentAuthenticatedRequest('/student/assignments')).data;
}

export async function fetchStudentAssignment(id) {
  return (await studentAuthenticatedRequest(`/student/assignments/${encodeURIComponent(id)}`)).data;
}

export async function submitStudentAssignment(id, fileName, fileData) {
  return (await studentAuthenticatedRequest(`/student/assignments/${encodeURIComponent(id)}/submission`, {
    method: 'POST',
    body: JSON.stringify({ fileName, fileData }),
  })).data;
}
