import { studentAuthenticatedRequest } from './authApi';

function normalize(profile) {
  return {
    ...profile,
    dateOfBirth: String(profile.dateOfBirth || '').slice(0, 10),
    joinedOn: String(profile.joinedOn || '').slice(0, 10),
    status: profile.status === 'ACTIVE' ? 'Active' : profile.status,
    profileStatus: profile.profileStatus === 'COMPLETE' ? 'Complete' : 'Incomplete',
    learningMode: profile.learningMode === 'ONLINE' ? 'Online' : profile.learningMode === 'OFFLINE' ? 'Offline' : profile.learningMode,
    subjects: profile.subjects || [],
  };
}

export async function fetchStudentProfile() {
  return normalize((await studentAuthenticatedRequest('/student/profile')).data);
}

export async function updateStudentProfile(data) {
  return normalize((await studentAuthenticatedRequest('/student/profile', { method: 'PATCH', body: JSON.stringify(data) })).data);
}

export async function updateStudentPhoto(avatar) {
  return normalize((await studentAuthenticatedRequest('/student/profile/photo', { method: 'PATCH', body: JSON.stringify({ avatar }) })).data);
}

export async function saveStudentTheme(themePreference) {
  return (await studentAuthenticatedRequest('/student/profile/theme', { method: 'PATCH', body: JSON.stringify({ themePreference }) })).data;
}

export async function submitProfileCorrection(data) {
  return (await studentAuthenticatedRequest('/student/profile/correction-requests', { method: 'POST', body: JSON.stringify(data) })).data;
}
