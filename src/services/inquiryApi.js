import { apiRequest, authenticatedRequest } from "./authApi";

const fromStatus = { NEW: "New", CONTACTED: "Contacted", FOLLOW_UP_REQUIRED: "Follow-up Required", READY_FOR_ADMISSION: "Ready for Admission", CLOSED: "Closed" };
const toStatus = { New: "NEW", Contacted: "CONTACTED", "Follow-up Required": "FOLLOW_UP_REQUIRED", "Ready for Admission": "READY_FOR_ADMISSION", Closed: "CLOSED" };

export function normalizeInquiry(record) {
  const readyForAdmission = record.status === "READY_FOR_ADMISSION";
  return {
    ...record,
    backendId: record.id,
    source: readyForAdmission ? "Inquiry" : "Contact Form",
    type: readyForAdmission ? "Admission" : "Inquiry",
    studentName: readyForAdmission ? record.name : undefined,
    parentName: readyForAdmission ? record.name : undefined,
    grade: record.grade?.numericValue,
    gradeId: record.gradeId,
    preferredTime: record.preferredTime,
    status: fromStatus[record.status] || record.status,
  };
}

export async function createInquiry(details) {
  const payload = await apiRequest("/public/inquiries", { method: "POST", body: JSON.stringify(details) });
  return normalizeInquiry(payload.data);
}

export async function fetchInquiries(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const payload = await authenticatedRequest(`/inquiries${params.size ? `?${params}` : ""}`);
  return payload.data.map(normalizeInquiry);
}

export async function updateInquiry(id, changes) {
  const payload = await authenticatedRequest(`/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: toStatus[changes.status] || changes.status, followUpNote: changes.followUpNote }),
  });
  return normalizeInquiry(payload.data);
}
