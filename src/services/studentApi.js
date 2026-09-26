import { authenticatedRequest } from './authApi';

function displayStatus(value) {
  const status = String(value || 'ACTIVE').toUpperCase();
  return status === 'ACTIVE' ? 'Active' : status === 'BLOCKED' ? 'Blocked' : 'Inactive';
}

export function normalizeStudent(record) {
  const admission = record.admissions?.find((item) => item.status === 'ENROLLED') || record.admissions?.[0] || {};
  const subjects = admission.batch?.subjects?.map((item) => item.subject?.name).filter(Boolean) || [];
  return {
    id: record.id,
    studentCode: record.studentCode,
    userId: record.userId,
    name: record.user?.name || '',
    email: record.user?.email || '',
    parentName: record.parentName || '',
    phone: record.parentPhone || '',
    alternateContactNumber: record.emergencyContact || '',
    dateOfBirth: record.dateOfBirth || '',
    gender: record.gender || '',
    address: record.address || '',
    profileStatus: record.profileStatus === 'COMPLETE' ? 'Complete' : 'Incomplete',
    status: displayStatus(record.user?.status),
    admissionId: admission.id || '',
    admissionStatus: admission.status || '',
    academicSessionId: admission.academicSessionId || '',
    academicSessionName: admission.academicSession?.name || '',
    gradeId: admission.gradeId || '',
    grade: String(admission.grade?.numericValue ?? ''),
    gradeName: admission.grade?.gradeName || '',
    boardId: admission.boardId || '',
    board: admission.board?.code || '',
    batchId: admission.batchId || '',
    batch: admission.batch?.name || '',
    learningMode: admission.batch?.learningMode || '',
    subjects,
    feePlan: admission.feePlan || null,
    joinedOn: admission.joiningDate || record.createdAt,
    createdAt: record.createdAt,
    raw: record,
  };
}

export async function fetchStudents(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const payload = await authenticatedRequest(`/students${params.size ? `?${params}` : ''}`);
  return payload.data.map(normalizeStudent);
}

export async function fetchStudent(id) {
  const payload = await authenticatedRequest(`/students/${encodeURIComponent(id)}`);
  return normalizeStudent(payload.data);
}

export async function updateStudent(id, changes) {
  const payload = await authenticatedRequest(`/students/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) });
  return normalizeStudent(payload.data);
}

export async function transferStudent(id, batchId) {
  const payload = await authenticatedRequest(`/students/${encodeURIComponent(id)}/batch`, { method: 'PATCH', body: JSON.stringify({ batchId }) });
  return normalizeStudent(payload.data);
}

export async function fetchStudentOverview(id) {
  return (await authenticatedRequest(`/students/${encodeURIComponent(id)}/overview`)).data;
}

export async function fetchStudentProfileRequests(id) {
  return (await authenticatedRequest(`/students/${encodeURIComponent(id)}/profile-requests`)).data;
}
