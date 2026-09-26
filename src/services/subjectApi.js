import { authenticatedRequest } from "./authApi";

const fromStatus = { ACTIVE: "Active", INACTIVE: "Inactive" };
const toStatus = { Active: "ACTIVE", Inactive: "INACTIVE" };

export function normalizeSubject(subject) {
  return {
    ...subject,
    gradeIds: Array.isArray(subject.grades)
      ? subject.grades.map((item) => item.gradeId || item.grade?.id).filter(Boolean)
      : [],
    status: fromStatus[subject.status] || subject.status,
  };
}

const payloadFor = (subject) => ({
  name: subject.name.trim(),
  code: subject.code.trim().toUpperCase(),
  boardId: subject.boardId,
  gradeIds: subject.gradeIds,
  streams: subject.streams,
  status: toStatus[subject.status] || String(subject.status).toUpperCase(),
});

export async function fetchSubjects() {
  const payload = await authenticatedRequest("/subjects");
  return payload.data.map(normalizeSubject);
}

export async function createSubject(subject) {
  const payload = await authenticatedRequest("/subjects", {
    method: "POST",
    body: JSON.stringify(payloadFor(subject)),
  });
  return normalizeSubject(payload.data);
}

export async function updateSubject(id, subject) {
  const payload = await authenticatedRequest(`/subjects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payloadFor(subject)),
  });
  return normalizeSubject(payload.data);
}
