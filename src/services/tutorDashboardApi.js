import { tutorAuthenticatedRequest } from './authApi';
export const fetchTutorDashboard = async () => (await tutorAuthenticatedRequest('/tutor/dashboard')).data;
