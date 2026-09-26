import { apiRequest, authenticatedRequest } from "./authApi";

const fromStatus = { ACTIVE: "Active", INACTIVE: "Inactive" };
const toStatus = { Active: "ACTIVE", Inactive: "INACTIVE" };
const fromMode = { ONLINE: "Online", OFFLINE: "Offline" };
const toMode = { Online: "ONLINE", Offline: "OFFLINE" };
const dateValue = (value) => String(value || "").slice(0, 10);

export function normalizeDemoSetup(setup) {
  return {
    ...setup,
    grade: setup.grade ? {
      ...setup.grade,
      name: setup.grade.gradeName,
      value: setup.grade.numericValue,
    } : null,
    boardIds: setup.boards?.map((item) => item.boardId || item.board?.id).filter(Boolean) || [],
    boardRecords: setup.boards?.map((item) => item.board).filter(Boolean) || [],
    tutorName: setup.tutor?.user?.name || setup.tutorName || "",
    mode: fromMode[setup.mode] || setup.mode,
    demoStartDate: dateValue(setup.demoStartDate),
    demoEndDate: dateValue(setup.demoEndDate),
    timeSlots: (setup.timeSlots || []).map((slot) => ({ ...slot, capacity: Number(slot.capacity) })),
    status: fromStatus[setup.status] || setup.status,
  };
}

const payloadFor = (setup) => ({
  name: setup.name.trim(),
  academicSessionId: setup.academicSessionId,
  tutorId: setup.tutorId,
  gradeId: setup.gradeId,
  boardIds: setup.boardIds,
  stream: setup.stream || null,
  mode: toMode[setup.mode] || String(setup.mode).toUpperCase(),
  demoStartDate: setup.demoStartDate,
  demoEndDate: setup.demoEndDate,
  availableDays: setup.availableDays,
  timeSlots: setup.timeSlots.map(({ startTime, endTime, capacity }) => ({
    startTime,
    endTime,
    capacity: Number(capacity),
  })),
  status: toStatus[setup.status] || String(setup.status).toUpperCase(),
});

export async function fetchDemoSetups(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const payload = await authenticatedRequest(`/demo-setups${params.size ? `?${params}` : ""}`);
  return payload.data.map(normalizeDemoSetup);
}

export async function fetchPublicDemoSetups() {
  const payload = await apiRequest("/public/demo-setups");
  return payload.data.map(normalizeDemoSetup);
}

export async function createDemoSetup(setup) {
  const payload = await authenticatedRequest("/demo-setups", {
    method: "POST",
    body: JSON.stringify(payloadFor(setup)),
  });
  return normalizeDemoSetup(payload.data);
}

export async function updateDemoSetup(id, setup) {
  const payload = await authenticatedRequest(`/demo-setups/${id}`, {
    method: "PUT",
    body: JSON.stringify(payloadFor(setup)),
  });
  return normalizeDemoSetup(payload.data);
}

export async function deleteDemoSetup(id) {
  return authenticatedRequest(`/demo-setups/${id}`, { method: "DELETE" });
}
