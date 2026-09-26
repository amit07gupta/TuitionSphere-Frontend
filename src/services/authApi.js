const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Backend server is unavailable. Please start the API and try again.");
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Unable to complete the request");
  }

  return payload;
}

export async function loginUser(email, password) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return payload.data;
}

export async function loginAdmin(email, password) {
  const result = await loginUser(email, password);
  if (!['ADMIN', 'SUPER_ADMIN'].includes(result.user?.role)) {
    throw new Error('Administrator account required.');
  }
  return result;
}

export async function getAuthenticatedUser(token) {
  const payload = await apiRequest("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return payload.data.user;
}

export async function logoutUser(token) {
  if (!token) return;
  await apiRequest('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function authenticatedRequest(path, options = {}) {
  const token = sessionStorage.getItem("tuitionsphere_admin_token");

  if (!token) {
    return Promise.reject(new Error("Your admin session has expired. Please sign in again."));
  }

  return apiRequest(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export function tutorAuthenticatedRequest(path, options = {}) {
  const token = sessionStorage.getItem("tuitionsphere_tutor_token");
  if (!token) return Promise.reject(new Error("Your tutor session has expired. Please sign in again."));
  return apiRequest(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
}

export function studentAuthenticatedRequest(path, options = {}) {
  const token = sessionStorage.getItem('tuitionsphere_portal_token');
  if (!token) return Promise.reject(new Error('Your student session has expired. Please sign in again.'));
  return apiRequest(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
}
