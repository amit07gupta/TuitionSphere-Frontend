import { authenticatedRequest } from './authApi';
export async function fetchDashboard(month, academicSessionId) {
  const query = new URLSearchParams({ month, academicSessionId });
  return (await authenticatedRequest(`/dashboard?${query}`)).data;
}
