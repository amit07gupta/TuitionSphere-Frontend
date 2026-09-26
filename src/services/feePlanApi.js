import { authenticatedRequest } from "./authApi";

const statusFromApi = { DRAFT: "Draft", ACTIVE: "Active", ARCHIVED: "Archived" };
const statusToApi = { Draft: "DRAFT", Active: "ACTIVE", Archived: "ARCHIVED" };
const frequencyFromApi = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", FULL_SESSION: "Full Session" };
const frequencyToApi = { Monthly: "MONTHLY", Quarterly: "QUARTERLY", "Full Session": "FULL_SESSION" };
const dateValue = (value) => String(value || "").slice(0, 10);

export function normalizeFeePlan(plan) {
  return {
    ...plan,
    grade: String(plan.grade?.numericValue ?? plan.grade ?? ""),
    admissionFee: Number(plan.admissionFee),
    tuitionFee: Number(plan.tuitionFee),
    lateFee: Number(plan.lateFee),
    billingFrequency: frequencyFromApi[plan.billingFrequency] || plan.billingFrequency,
    effectiveFrom: dateValue(plan.effectiveFrom),
    effectiveTo: dateValue(plan.effectiveTo),
    status: statusFromApi[plan.status] || plan.status,
  };
}

const payloadFor = (plan) => ({
  name: plan.name.trim(),
  academicSessionId: plan.academicSessionId,
  gradeId: plan.gradeId,
  admissionFee: Number(plan.admissionFee),
  tuitionFee: Number(plan.tuitionFee),
  billingFrequency: frequencyToApi[plan.billingFrequency] || plan.billingFrequency,
  dueDay: Number(plan.dueDay),
  lateFee: Number(plan.lateFee),
  gracePeriodDays: Number(plan.gracePeriodDays),
  effectiveFrom: plan.effectiveFrom,
  effectiveTo: plan.effectiveTo,
  status: statusToApi[plan.status] || plan.status,
});

export async function fetchFeePlans(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  const payload = await authenticatedRequest(`/fee-plans${params.size ? `?${params}` : ""}`);
  return payload.data.map(normalizeFeePlan);
}

export async function createFeePlan(plan) {
  const payload = await authenticatedRequest("/fee-plans", {
    method: "POST",
    body: JSON.stringify(payloadFor(plan)),
  });
  return normalizeFeePlan(payload.data);
}

export async function updateFeePlan(id, plan) {
  const payload = await authenticatedRequest(`/fee-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payloadFor(plan)),
  });
  return normalizeFeePlan(payload.data);
}

export async function deleteFeePlan(id) {
  return authenticatedRequest(`/fee-plans/${id}`, { method: "DELETE" });
}
