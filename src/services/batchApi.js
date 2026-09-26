import { authenticatedRequest } from "./authApi";

const fromStatus = { ACTIVE: "Active", INACTIVE: "Inactive" };
const toStatus = { Active: "ACTIVE", Inactive: "INACTIVE" };
const fromMode = { ONLINE: "Online", OFFLINE: "Offline" };
const toMode = { Online: "ONLINE", Offline: "OFFLINE" };

export function normalizeBatch(batch) {
  const assignments = Array.isArray(batch.subjects) ? batch.subjects : [];

  return {
    ...batch,
    grade: String(batch.grade?.numericValue ?? batch.grade ?? ""),
    board: batch.board?.code || batch.board || "",
    subjectIds: assignments.map((item) => item.subjectId || item.subject?.id).filter(Boolean),
    subjects: assignments.map((item) => item.subject?.name).filter(Boolean),
    tutorAssignments: assignments
      .map((item) => ({ subjectId: item.subjectId, tutorId: item.tutorId }))
      .filter((item) => item.subjectId && item.tutorId),
    mode: fromMode[batch.learningMode] || batch.learningMode || batch.mode,
    status: fromStatus[batch.status] || batch.status,
    enrolled: Number(batch._count?.admissions ?? batch.enrolled ?? 0),
  };
}

function toApiPayload(batch) {
  return {
    name: batch.name.trim(),
    academicSessionId: batch.academicSessionId,
    gradeId: batch.gradeId,
    boardId: batch.boardId,
    stream: batch.stream || null,
    learningMode: toMode[batch.mode] || String(batch.mode).toUpperCase(),
    capacity: Number(batch.capacity),
    status: toStatus[batch.status] || String(batch.status).toUpperCase(),
    subjectAssignments: batch.tutorAssignments.map(({ subjectId, tutorId }) => ({
      subjectId,
      tutorId,
    })),
  };
}

export async function fetchBatches(filters = {}) {
  const search = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") search.set(key, value);
  });
  const payload = await authenticatedRequest(`/batches${search.size ? `?${search}` : ""}`);
  return payload.data.map(normalizeBatch);
}

export async function createBatch(batch) {
  const payload = await authenticatedRequest("/batches", {
    method: "POST",
    body: JSON.stringify(toApiPayload(batch)),
  });
  return normalizeBatch(payload.data);
}

export async function updateBatch(id, batch) {
  const payload = await authenticatedRequest(`/batches/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(batch)),
  });
  return normalizeBatch(payload.data);
}

export async function deleteBatch(id) {
  return authenticatedRequest(`/batches/${id}`, { method: "DELETE" });
}
