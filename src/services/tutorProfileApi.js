import { tutorAuthenticatedRequest } from './authApi';
export const getTutorProfile = async () => (await tutorAuthenticatedRequest('/tutor-profile')).data;
export const updateTutorProfile = async data => (await tutorAuthenticatedRequest('/tutor-profile',{method:'PATCH',body:JSON.stringify(data)})).data;
export const saveTutorSettings = async data => (await tutorAuthenticatedRequest('/tutor-profile/settings',{method:'PATCH',body:JSON.stringify(data)})).data;
export const getTutorSessions = async () => (await tutorAuthenticatedRequest('/tutor-profile/sessions')).data;
export const revokeTutorSession = id => tutorAuthenticatedRequest(`/tutor-profile/sessions/${encodeURIComponent(id)}`,{method:'DELETE'});
