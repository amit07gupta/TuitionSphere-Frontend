import { authenticatedRequest } from "./authApi";

const statusFromApi = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONFIRMED: "Demo Scheduled",
  ADMISSION_STARTED: "Ready for Admission",
  ENROLLED: "Enrolled",
  CANCELLED: "Cancelled",
};

const statusToApi = {
  New: "NEW",
  Contacted: "CONTACTED",
  "Demo Scheduled": "CONFIRMED",
  "Ready for Admission": "ADMISSION_STARTED",
  Enrolled: "ENROLLED",
  Cancelled: "CANCELLED",
};

export function normalizeDemoRequest(request) {
  return {
    id: request.id,
    backendId: request.id,
    source: "Book Demo",
    type: "Demo",
    studentName: request.studentName,
    parentName: request.parentName,
    email: request.email,
    phone: request.phone,
    grade: request.grade?.numericValue,
    gradeId: request.gradeId,
    board: request.board?.code,
    boardId: request.boardId,
    stream: request.stream || "",
    subject: "General Grade Demo",
    learningRequirement: "General Grade Demo",
    preferredDate: String(request.demoDate || "").slice(0, 10),
    preferredTime: `${request.demoSlot?.startTime || ""}-${request.demoSlot?.endTime || ""}`,
    requestedStartTime: request.demoSlot?.startTime,
    requestedEndTime: request.demoSlot?.endTime,
    demoMode: String(request.demoSetup?.mode || "").toLowerCase(),
    demoSetupId: request.demoSetupId,
    demoSetupName: request.demoSetup?.name,
    demoSlotId: request.demoSlotId,
    assignedMentorId: request.demoSetup?.tutorId,
    assignedMentorName: request.demoSetup?.tutor?.user?.name,
    status: statusFromApi[request.status] || request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function fetchAdminDemoRequests(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const payload = await authenticatedRequest(`/demo-requests${params.size ? `?${params}` : ""}`);
  return payload.data.map(normalizeDemoRequest);
}

export async function updateAdminDemoRequestStatus(id, status) {
  const payload = await authenticatedRequest(`/demo-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: statusToApi[status] || status }),
  });
  return normalizeDemoRequest(payload.data);
}
