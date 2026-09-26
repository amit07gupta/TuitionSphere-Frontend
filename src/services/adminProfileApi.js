import { authenticatedRequest } from './authApi';
export async function getProfile() {
  return (await authenticatedRequest('/admin-profile')).data;
}
export async function updateProfile(data) {
  return (await authenticatedRequest('/admin-profile', { method: 'PATCH', body: JSON.stringify(data) })).data;
}
