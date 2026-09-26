import { authenticatedRequest } from './authApi';

const statusLabels = { DRAFT: 'Draft', PENDING: 'Pending', PARTIALLY_PAID: 'Partially Paid', PAID: 'Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' };
const dateValue = (value) => String(value || '').slice(0, 10);

export function normalizeInvoice(invoice) {
  const admission = invoice.admission || {};
  const student = admission.student || {};
  return {
    ...invoice,
    amount: Number(invoice.amount || 0), discountAmount: Number(invoice.discountAmount || 0),
    lateFeeAmount: Number(invoice.lateFeeAmount || 0), totalAmount: Number(invoice.totalAmount || 0),
    paidAmount: Number(invoice.paidAmount || 0),
    outstandingAmount: Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0)),
    dueDate: dateValue(invoice.dueDate), statusLabel: statusLabels[invoice.status] || invoice.status,
    admissionId: invoice.admissionId || admission.id || '',
    studentId: student.id || '', studentCode: student.studentCode || '', studentName: student.user?.name || '',
    academicSessionId: admission.academicSession?.id || admission.academicSessionId || '', academicSessionName: admission.academicSession?.name || '',
    gradeId: admission.grade?.id || admission.gradeId || '', gradeName: admission.grade?.gradeName || '',
    boardId: admission.board?.id || admission.boardId || '', boardCode: admission.board?.code || '',
    batchId: admission.batch?.id || admission.batchId || '', batchName: admission.batch?.name || '',
    feePlanName: invoice.feePlan?.planName || invoice.feePlan?.name || 'Fee Plan',
    payments: (invoice.payments || []).map((item) => ({ ...item, amount: Number(item.amount || 0), paymentDate: dateValue(item.paymentDate) })),
    paymentReports: (invoice.paymentReports || []).map((item) => ({ ...item, amount: Number(item.amount || 0), paymentDate: dateValue(item.paymentDate) })),
    raw: invoice,
  };
}

export async function fetchInvoices(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  const payload = await authenticatedRequest(`/invoices${params.size ? `?${params}` : ''}`);
  return payload.data.map(normalizeInvoice);
}

export async function fetchInvoice(id) {
  const payload = await authenticatedRequest(`/invoices/${encodeURIComponent(id)}`);
  return normalizeInvoice(payload.data);
}

export async function generateAdmissionInvoices(admissionId) {
  const payload = await authenticatedRequest('/invoices/generate', { method: 'POST', body: JSON.stringify({ admissionId }) });
  return payload.data.map(normalizeInvoice);
}

export async function recordInvoicePayment(invoiceId, payment) {
  const payload = await authenticatedRequest(`/invoices/${encodeURIComponent(invoiceId)}/payments`, {
    method: 'POST',
    body: JSON.stringify({ amount: Number(payment.amount), paymentMode: payment.paymentMode.replaceAll(' ', '_'), paymentDate: payment.paymentDate || undefined, transactionReference: payment.transactionReference?.trim() || undefined, notes: payment.notes?.trim() || undefined }),
  });
  return normalizeInvoice(payload.data);
}

export async function reviewStudentPaymentReport(reportId, decision, reviewNote = '') {
  const payload = await authenticatedRequest(`/invoices/payment-reports/${encodeURIComponent(reportId)}/review`, {
    method: 'PATCH', body: JSON.stringify({ decision, reviewNote }),
  });
  return normalizeInvoice(payload.data);
}

export async function fetchStudentPaymentProof(reportId) {
  return (await authenticatedRequest(`/invoices/payment-reports/${encodeURIComponent(reportId)}/proof`)).data;
}
