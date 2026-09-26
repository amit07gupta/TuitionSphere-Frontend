import { studentAuthenticatedRequest } from './authApi';

const day = (value) => String(value || '').slice(0, 10);
const mode = (value) => String(value || '').replaceAll('_', ' ');

function normalize(invoice, student) {
  const pendingReport = invoice.reports.find((report) => report.status === 'PENDING');
  const latestReport = invoice.reports[0];
  const lastPayment = invoice.payments[0];
  const status = invoice.status === 'PAID' ? 'Paid'
    : invoice.status === 'CANCELLED' ? 'Cancelled'
      : invoice.status === 'DRAFT' ? 'Draft'
        : pendingReport ? 'Verification Pending'
          : latestReport?.status === 'REJECTED' ? 'Rejected'
            : invoice.status === 'PARTIALLY_PAID' ? 'Partially Paid'
              : invoice.status === 'OVERDUE' ? 'Overdue' : 'Pending';
  return {
    ...invoice,
    studentId: student.studentCode,
    studentName: student.name,
    id: invoice.id,
    dueDate: day(invoice.dueDate),
    amount: Number(invoice.amount),
    paidAmount: Number(invoice.paidAmount),
    outstandingAmount: Number(invoice.outstandingAmount),
    paidOn: day(lastPayment?.paymentDate),
    method: mode(lastPayment?.paymentMode),
    transactionId: lastPayment?.transactionReference || '',
    verificationNote: latestReport?.status === 'REJECTED' ? latestReport.reviewNote : '',
    status,
  };
}

export async function fetchStudentFees() {
  const data = (await studentAuthenticatedRequest('/student/fees')).data;
  return { ...data, records: data.invoices.map((invoice) => normalize(invoice, data.student)) };
}

export async function submitStudentPaymentReport(invoiceId, data) {
  return (await studentAuthenticatedRequest(`/student/fees/${encodeURIComponent(invoiceId)}/payment-reports`, {
    method: 'POST', body: JSON.stringify(data),
  })).data;
}
