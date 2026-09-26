import { authenticatedRequest } from "./authApi";

export async function fetchAdmissions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const payload = await authenticatedRequest(`/admissions${params.size ? `?${params}` : ""}`);
  return payload.data;
}

export async function createAdmission(details) {
  const payload = await authenticatedRequest("/admissions", {
    method: "POST",
    body: JSON.stringify(details),
  });
  return payload.data;
}
