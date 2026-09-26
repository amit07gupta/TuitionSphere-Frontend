import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AdminMetricIcon from "../../components/admin/AdminMetricIcon";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import InvoicePaymentForm from "../../components/admin/InvoicePaymentForm";
import AdminPagination from "../../components/admin/AdminPagination";
import useAccessibleModal from "../../hooks/useAccessibleModal";
import {
  fetchInvoices,
  recordInvoicePayment,
  reviewStudentPaymentReport,
  fetchStudentPaymentProof,
} from "../../services/invoiceApi";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
    : "—";
const payable = (row) =>
  ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(row.status);
const badge = {
  Paid: "bg-emerald-100 text-emerald-700",
  "Partially Paid": "bg-violet-100 text-violet-700",
  Unpaid: "bg-amber-100 text-amber-700",
  Overdue: "bg-rose-100 text-rose-700",
};

function FeesPayments() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    session: "all",
    grade: "all",
    batch: "all",
    status: "all",
  });
  const [selectedKey, setSelectedKey] = useState(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [success, setSuccess] = useState("");
  const closeDetails = () => {
    if (!saving && !reviewingId) {
      setSelectedKey(null);
      setPaymentInvoiceId(null);
    }
  };
  const [page, setPage] = useState(1);
  const detailRef = useAccessibleModal(Boolean(selectedKey), closeDetails);
  useEffect(() => {
    let active = true;
    fetchInvoices()
      .then((rows) => {
        if (active) setInvoices(rows);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    invoices.forEach((row) => {
      const key =
        row.admissionId || `${row.studentId}-${row.academicSessionId}`;
      if (!map.has(key)) map.set(key, { key, sample: row, rows: [] });
      map.get(key).rows.push(row);
    });
    return [...map.values()].map((group) => {
      group.rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      group.total = group.rows.reduce((n, row) => n + row.totalAmount, 0);
      group.paid = group.rows.reduce((n, row) => n + row.paidAmount, 0);
      group.balance = group.total - group.paid;
      group.next =
        group.rows.find((row) => row.status === "OVERDUE") ||
        group.rows.find(payable);
      group.status = group.rows.some((row) => row.status === "OVERDUE")
        ? "Overdue"
        : group.balance <= 0
          ? "Paid"
          : group.paid
            ? "Partially Paid"
            : "Unpaid";
      return group;
    });
  }, [invoices]);
  const selected = groups.find((group) => group.key === selectedKey);
  const opts = (field, label) => [
    ...new Map(
      invoices.filter((x) => x[field]).map((x) => [x[field], x[label]]),
    ).entries(),
  ];
  const filtered = groups.filter((g) => {
    const x = g.sample;
    const term = filters.search.toLowerCase();
    return (
      (!term ||
        `${x.studentName} ${x.studentCode} ${x.batchName}`
          .toLowerCase()
          .includes(term)) &&
      (filters.session === "all" || x.academicSessionId === filters.session) &&
      (filters.grade === "all" || x.gradeId === filters.grade) &&
      (filters.batch === "all" || x.batchId === filters.batch) &&
      (filters.status === "all" || g.status === filters.status)
    );
  });
  const totals = groups.reduce(
    (a, g) => ({
      total: a.total + g.total,
      paid: a.paid + g.paid,
      balance: a.balance + g.balance,
      overdue:
        a.overdue +
        g.rows
          .filter((x) => x.status === "OVERDUE")
          .reduce((n, x) => n + x.outstandingAmount, 0),
    }),
    { total: 0, paid: 0, balance: 0, overdue: 0 },
  );
  const visible = filtered.slice((page - 1) * 10, page * 10);
  const change = (key) => (event) => {
    setFilters((old) => ({ ...old, [key]: event.target.value }));
    setPage(1);
  };
  const savePayment = async (invoiceId, payment) => {
    const updated = await recordInvoicePayment(invoiceId, payment);
    setInvoices((all) =>
      all.map((invoice) => (invoice.id === updated.id ? updated : invoice)),
    );
    setPaymentInvoiceId(null);
    setSuccess(
      "Payment recorded successfully. Balances and payment history are updated.",
    );
    setError("");
  };
  const reviewReport = async (reportId, decision) => {
    setReviewingId(reportId);
    setError("");
    try {
      const updated = await reviewStudentPaymentReport(
        reportId,
        decision,
        reviewNotes[reportId] || "",
      );
      setInvoices((all) =>
        all.map((invoice) => (invoice.id === updated.id ? updated : invoice)),
      );
      setSuccess(
        decision === "APPROVED"
          ? "Payment verified and receipt recorded."
          : "Payment report rejected with a reason.",
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReviewingId(null);
    }
  };
  const downloadProof = async (reportId) => {
    setError("");
    try {
      const proof = await fetchStudentPaymentProof(reportId);
      const link = document.createElement("a");
      link.href = proof.fileData;
      link.download = proof.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const cards = [
    ["Total Expected", totals.total, "revenue", "border-sky-300 bg-sky-50"],
    [
      "Amount Collected",
      totals.paid,
      "paid",
      "border-emerald-300 bg-emerald-50",
    ],
    ["Outstanding", totals.balance, "pending", "border-amber-300 bg-amber-50"],
    ["Overdue", totals.overdue, "overdue", "border-rose-300 bg-rose-50"],
  ];

  return (
    <div className="admin-page fees-invoices-page">
      <AdminPageHeader
        eyebrow="Finance"
        title="Fees & Invoices"
        description="Student-wise fee balances and installment payments."
        icon="paid"
        meta={`${groups.length} fee records`}
      />
      {success && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"
        >
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, icon, style]) => (
          <article
            key={label}
            className={`flex items-center justify-between rounded-xl border border-l-4 p-4 shadow-sm ${style}`}
          >
            <div>
              <p className="text-[10px] font-semibold text-slate-500">
                {label}
              </p>
              <strong className="mt-1 block text-xl text-brand-navy">
                {money.format(value)}
              </strong>
            </div>
            <AdminMetricIcon name={icon} className="h-5 w-5" />
          </article>
        ))}
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <header className="border-b p-5">
          <h2 className="text-lg font-semibold text-brand-navy">
            Student Fee Register
          </h2>
          <p className="text-xs text-slate-500">
            One consolidated row per admission.
          </p>
        </header>
        <div className="fee-register-filters grid gap-3 border-b bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={filters.search}
            onChange={change("search")}
            placeholder="Search student or batch"
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
          />
          {[
            [
              "session",
              " Session",
              "academicSessionId",
              "academicSessionName",
            ],
            ["grade", " Grade", "gradeId", "gradeName"],
            ["batch", " Batch", "batchId", "batchName"],
          ].map(([key, all, id, label]) => (
            <select
              key={key}
              value={filters[key]}
              onChange={change(key)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="all">{all}</option>
              {opts(id, label).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ))}
          <select
            value={filters.status}
            onChange={change("status")}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="all"> Status</option>
            {Object.keys(badge).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="p-16 text-center">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="fee-register-table w-full min-w-[1000px]">
              <thead>
                <tr>
                  {[
                    "S.N.",
                    "Student",
                    "Fee Plan",
                    "Total Fee",
                    "Paid",
                    "Balance",
                    "Next Due",
                    "Status",
                    "Actions",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((g, i) => (
                  <tr key={g.key}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>
                      <strong>{g.sample.studentName}</strong>
                    </td>
                    <td>
                      {g.sample.feePlanName}
                      <small className="block text-slate-400">
                        {g.sample.gradeName} · {g.sample.batchName}
                      </small>
                    </td>
                    <td>{money.format(g.total)}</td>
                    <td className="text-emerald-700">{money.format(g.paid)}</td>
                    <td className="text-amber-700">
                      {money.format(g.balance)}
                    </td>
                    <td>{g.next ? date(g.next.dueDate) : "Completed"}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${badge[g.status]}`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKey(g.key);
                          setPaymentInvoiceId(null);
                          setSuccess("");
                        }}
                        title="View installments"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          page={page}
          pageSize={10}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>
      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/65 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(e) => e.target === e.currentTarget && closeDetails()}
          >
            <section
              ref={detailRef}
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fee-details-title"
              className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white outline-none sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-4xl sm:rounded-3xl sm:shadow-2xl"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
                    Fee account
                  </p>
                  <h2
                    id="fee-details-title"
                    className="font-heading text-xl font-bold text-brand-navy"
                  >
                    {selected.sample.studentName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {selected.sample.gradeName} · {selected.sample.boardCode} ·{" "}
                    {selected.sample.batchName}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving || Boolean(reviewingId)}
                  onClick={closeDetails}
                  aria-label="Close fee details"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 hover:bg-slate-200"
                >
                  ✕
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Total Fee", selected.total],
                    ["Paid", selected.paid],
                    ["Balance", selected.balance],
                  ].map(([label, value]) => (
                    <article
                      key={label}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {label}
                      </p>
                      <strong className="mt-1 block text-lg text-brand-navy">
                        {money.format(value)}
                      </strong>
                    </article>
                  ))}
                </div>
                <div role="status" className="mt-3 text-sm text-emerald-700">
                  {success}
                </div>
                {error && (
                  <div
                    role="alert"
                    className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700"
                  >
                    {error}
                  </div>
                )}
                <h3 className="mt-6 font-heading font-semibold text-brand-navy">
                  Installment History
                </h3>
                <div className="mt-3 space-y-3">
                  {selected.rows.map((x) => (
                    <article
                      key={x.id}
                      className="rounded-xl border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <strong className="text-sm text-brand-navy">
                            {x.title}
                          </strong>
                          <p className="mt-1 text-xs text-slate-500">
                            Due {date(x.dueDate)} ·{" "}
                            {money.format(x.totalAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${x.status === "PAID" ? badge.Paid : x.status === "OVERDUE" ? badge.Overdue : badge.Unpaid}`}
                          >
                            {x.statusLabel}
                          </span>
                          {payable(x) && (
                            <button
                              type="button"
                              disabled={saving || paymentInvoiceId === x.id}
                              onClick={() => {
                                setPaymentInvoiceId(x.id);
                                setSuccess("");
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Record Payment
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        Paid {money.format(x.paidAmount)} · Balance{" "}
                        {money.format(x.outstandingAmount)}
                      </p>
                      {paymentInvoiceId === x.id && (
                        <InvoicePaymentForm
                          key={x.id}
                          invoice={x}
                          onSave={savePayment}
                          onCancel={() => setPaymentInvoiceId(null)}
                          onSavingChange={setSaving}
                        />
                      )}
                      {x.paymentReports.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <h4 className="text-xs font-semibold text-slate-700">
                            Student Payment Reports
                          </h4>
                          <div className="mt-2 space-y-3">
                            {x.paymentReports.map((report) => (
                              <div
                                key={report.id}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <strong className="text-brand-navy">
                                      {money.format(report.amount)} ·{" "}
                                      {report.paymentMode.replaceAll("_", " ")}
                                    </strong>
                                    <p className="mt-1 text-slate-600">
                                      {date(report.paymentDate)} · Reference:{" "}
                                      {report.transactionReference}
                                    </p>
                                    <p className="mt-1 text-slate-500">
                                      {report.status === "PENDING"
                                        ? "Awaiting verification"
                                        : report.status === "APPROVED"
                                          ? "Approved"
                                          : "Rejected"}{" "}
                                      · Proof: {report.proofName}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => downloadProof(report.id)}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-brand-navy"
                                  >
                                    Download proof
                                  </button>
                                </div>
                                {report.note && (
                                  <p className="mt-2 whitespace-pre-wrap text-slate-600">
                                    Student note: {report.note}
                                  </p>
                                )}
                                {report.reviewNote && (
                                  <p className="mt-2 whitespace-pre-wrap text-slate-600">
                                    Review note: {report.reviewNote}
                                  </p>
                                )}
                                {report.status === "PENDING" && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <input
                                      aria-label="Review reason"
                                      value={reviewNotes[report.id] || ""}
                                      onChange={(event) =>
                                        setReviewNotes((notes) => ({
                                          ...notes,
                                          [report.id]: event.target.value,
                                        }))
                                      }
                                      maxLength={500}
                                      placeholder="Reason required for rejection"
                                      className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2"
                                    />
                                    <button
                                      type="button"
                                      disabled={Boolean(reviewingId || saving)}
                                      onClick={() =>
                                        reviewReport(report.id, "APPROVED")
                                      }
                                      className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      disabled={
                                        Boolean(reviewingId || saving) ||
                                        (reviewNotes[report.id] || "").trim()
                                          .length < 5
                                      }
                                      onClick={() =>
                                        reviewReport(report.id, "REJECTED")
                                      }
                                      className="rounded-lg bg-rose-600 px-3 py-2 font-bold text-white disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {x.payments.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <h4 className="text-xs font-semibold text-slate-700">
                            Payment History
                          </h4>
                          <ul className="mt-2 space-y-2">
                            {x.payments.map((payment) => (
                              <li
                                key={payment.id || payment.receiptNumber}
                                className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600"
                              >
                                <div className="flex flex-wrap justify-between gap-2">
                                  <strong className="text-emerald-700">
                                    {money.format(payment.amount)}
                                  </strong>
                                  <span>
                                    {date(payment.paymentDate)} ·{" "}
                                    {payment.paymentMode?.replaceAll("_", " ")}
                                  </span>
                                </div>
                                <p className="mt-1 break-words">
                                  Receipt: {payment.receiptNumber || "—"}
                                </p>
                                {payment.transactionReference && (
                                  <p className="mt-1 break-words">
                                    Reference: {payment.transactionReference}
                                  </p>
                                )}
                                {payment.notes && (
                                  <p className="mt-1 whitespace-pre-wrap break-words">
                                    {payment.notes}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
              <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeDetails}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700"
                >
                  Close
                </button>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
export default FeesPayments;
