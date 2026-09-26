import { authenticatedRequest } from "./authApi";

const statusFromApi = {
  UPCOMING: "Upcoming",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const statusToApi = {
  Upcoming: "UPCOMING",
  Active: "ACTIVE",
  Completed: "COMPLETED",
  Archived: "ARCHIVED",
};

const toDateValue = (value) => String(value || "").slice(0, 10);

export function normalizeAcademicSession(session) {
  return {
    ...session,
    startDate: toDateValue(session.startDate),
    endDate: toDateValue(session.endDate),
    status: statusFromApi[session.status] || session.status,
  };
}

const toApiPayload = (session) => ({
  name: session.name,
  startDate: session.startDate,
  endDate: session.endDate,
  status: statusToApi[session.status] || String(session.status).toUpperCase(),
});

export async function fetchAcademicSessions() {
  const payload = await authenticatedRequest("/academic-sessions");
  return payload.data.sessions.map(normalizeAcademicSession);
}

export async function createAcademicSession(session) {
  const payload = await authenticatedRequest("/academic-sessions", {
    method: "POST",
    body: JSON.stringify(toApiPayload(session)),
  });
  return normalizeAcademicSession(payload.data.session);
}

export async function updateAcademicSession(id, session) {
  const payload = await authenticatedRequest(`/academic-sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(session)),
  });
  return normalizeAcademicSession(payload.data.session);
}

export async function activateAcademicSessionApi(id) {
  const payload = await authenticatedRequest(`/academic-sessions/${id}/activate`, {
    method: "PATCH",
  });
  return normalizeAcademicSession(payload.data.session);
}

export async function archiveAcademicSessionApi(id) {
  const payload = await authenticatedRequest(`/academic-sessions/${id}/archive`, {
    method: "PATCH",
  });
  return normalizeAcademicSession(payload.data.session);
}
