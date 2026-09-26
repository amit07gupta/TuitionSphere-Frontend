import { authenticatedRequest } from "./authApi";

const statusFromApi = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const statusToApi = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
};

export function normalizeGrade(grade) {
  return {
    ...grade,
    name: grade.gradeName,
    value: grade.numericValue,
    boardIds: Array.isArray(grade.boards)
      ? grade.boards.map((item) => item.boardId || item.board?.id).filter(Boolean)
      : [],
    status: statusFromApi[grade.status] || grade.status,
  };
}

const toApiPayload = (grade) => ({
  gradeName: grade.name.trim(),
  numericValue: Number(grade.value),
  learningStage: grade.learningStage,
  boardIds: grade.boardIds,
  status: statusToApi[grade.status] || String(grade.status).toUpperCase(),
});

export async function fetchGrades() {
  const payload = await authenticatedRequest("/grades");
  return payload.data.map(normalizeGrade);
}

export async function createGrade(grade) {
  const payload = await authenticatedRequest("/grades", {
    method: "POST",
    body: JSON.stringify(toApiPayload(grade)),
  });
  return normalizeGrade(payload.data);
}

export async function updateGrade(id, grade) {
  const payload = await authenticatedRequest(`/grades/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(grade)),
  });
  return normalizeGrade(payload.data);
}
