import { authenticatedRequest } from "./authApi";

const fromStatus = { ACTIVE: "Active", INACTIVE: "Inactive" };
const toStatus = { Active: "ACTIVE", Inactive: "INACTIVE" };
const dateValue = (value) => String(value || "").slice(0, 10);

export function normalizeTutor(tutor) {
  const subjectRelations = Array.isArray(tutor.subjects) ? tutor.subjects : [];
  return {
    ...tutor,
    name: tutor.user?.name || tutor.name || "",
    email: tutor.user?.email || tutor.email || "",
    phone: tutor.user?.phone || tutor.phone || "",
    joinedOn: dateValue(tutor.joiningDate || tutor.joinedOn),
    mode: tutor.modes || tutor.mode || [],
    boardIds: tutor.boards?.map((item) => item.boardId || item.board?.id).filter(Boolean) || [],
    gradeIds: tutor.grades?.map((item) => item.gradeId || item.grade?.id).filter(Boolean) || [],
    subjectIds: subjectRelations.map((item) => item.subjectId || item.subject?.id).filter(Boolean),
    subjects: subjectRelations.map((item) => item.subject?.name || item.name || item).filter((item) => typeof item === "string"),
    status: fromStatus[tutor.status] || tutor.status,
  };
}

const payloadFor = (tutor) => ({
  name: tutor.name.trim(),
  email: tutor.email.trim().toLowerCase(),
  phone: tutor.phone.replace(/\D/g, ""),
  employeeCode: tutor.employeeCode.trim().toUpperCase(),
  designation: tutor.designation.trim(),
  qualification: tutor.qualification.trim(),
  experience: tutor.experience === "" ? null : Number(tutor.experience),
  availability: tutor.availability.trim(),
  joiningDate: tutor.joinedOn,
  boardIds: tutor.boardIds,
  gradeIds: tutor.gradeIds,
  subjectIds: tutor.subjectIds,
  modes: tutor.mode,
  streams: tutor.streams,
  status: toStatus[tutor.status] || String(tutor.status).toUpperCase(),
});

export async function fetchTutors() {
  const payload = await authenticatedRequest("/tutors");
  return payload.data.map(normalizeTutor);
}

export async function createTutor(tutor) {
  const payload = await authenticatedRequest("/tutors", {
    method: "POST",
    body: JSON.stringify(payloadFor(tutor)),
  });
  return normalizeTutor(payload.data);
}

export async function updateTutor(id, tutor) {
  const payload = await authenticatedRequest(`/tutors/${id}`, {
    method: "PUT",
    body: JSON.stringify(payloadFor(tutor)),
  });
  return normalizeTutor(payload.data);
}
