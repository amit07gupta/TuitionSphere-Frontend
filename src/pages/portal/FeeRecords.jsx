import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PortalIcon from "../../components/portal/PortalIcon";
import useAccessibleModal from "../../hooks/useAccessibleModal";
import { fetchStudentFees, submitStudentPaymentReport } from "../../services/studentFeeApi";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const paymentMethods = ["UPI", "Bank Transfer", "Cash", "Cheque"];
const statusStyle = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  "Under Review": "bg-violet-100 text-violet-700",
  "Action Required": "bg-rose-100 text-rose-700",
  "Partially Paid": "bg-sky-100 text-sky-700",
  Draft: "bg-slate-200 text-slate-700",
  Cancelled: "bg-slate-200 text-slate-700",
  Waived: "bg-slate-200 text-slate-700",
};
const studentFeeStatus = (status) => {
  if (["Pending", "Overdue", "Partially Paid"].includes(status)) return status === "Partially Paid" ? status : "Pending";
  if (status === "Verification Pending") return "Under Review";
  if (status === "Rejected") return "Action Required";
  return status;
};
const isStudentPending = (status) =>
  ["Pending", "Overdue", "Partially Paid", "Verification Pending", "Rejected"].includes(status);
const studentStatusOptions = ["Pending", "Paid"];
const emptyReport = {
  method: "UPI",
  paymentDate: "",
  transactionId: "",
  amount: "",
  note: "",
};
const date = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function downloadReceipt(record) {
  if (!record.payments.length) return;
  const content = [
    "TUITIONSPHERE PAYMENT DETAILS",
    `Invoice: ${record.invoiceNumber}`,
    `Student: ${record.studentName} (${record.studentId})`,
    `Program: ${record.program}`,
    `Installment: ${record.installment}`,
    `Total: ${money.format(record.amount)}`,
    `Paid: ${money.format(record.paidAmount)}`,
    `Balance: ${money.format(record.outstandingAmount)}`,
    ...record.payments.flatMap((payment) => [
      "",
      `Receipt: ${payment.receiptNumber}`,
      `Amount: ${money.format(payment.amount)}`,
      `Paid on: ${date(payment.paymentDate)}`,
      `Method: ${payment.paymentMode.replaceAll('_', ' ')}`,
      `Transaction ID: ${payment.transactionReference || '—'}`,
    ]),
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.invoiceNumber}-payment-details.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function FeeRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [student, setStudent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [reportingPayment, setReportingPayment] = useState(null);
  const [report, setReport] = useState(emptyReport);
  const [proofFile, setProofFile] = useState(null);
  const [reportError, setReportError] = useState("");
  const [reportSaving, setReportSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const reportRef = useAccessibleModal(Boolean(reportingPayment), () =>
    { if (!reportSaving) setReportingPayment(null); },
  );

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await fetchStudentFees();
        if (active) {
          setRecords(data.records);
          setStudent(data.student);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);

  const visible = useMemo(
    () =>
      records
        .filter(
          (item) =>
            filter === "all" ||
            (filter === "Pending"
              ? isStudentPending(item.status)
              : item.status === filter),
        )
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [records, filter],
  );
  const total = records
    .filter((item) => !["Waived", "Draft", "Cancelled"].includes(item.status))
    .reduce((sum, item) => sum + item.amount, 0);
  const paid = records
    .reduce((sum, item) => sum + item.paidAmount, 0);
  const pending = records
    .filter((item) =>
      isStudentPending(item.status),
    )
    .reduce((sum, item) => sum + item.outstandingAmount, 0);
  const nextDue = records
    .filter((item) => isStudentPending(item.status))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const openReport = (payment) => {
    setReportingPayment(payment);
    setReport({ ...emptyReport, amount: String(payment.outstandingAmount) });
    setProofFile(null);
    setReportError("");
  };

  const submitPaymentReport = async (event) => {
    event.preventDefault();
    if (reportSaving) return;
    if (!report.paymentDate || !report.transactionId.trim()) {
      setReportError("Enter the payment date and transaction/reference ID.");
      return;
    }
    if (!proofFile) {
      setReportError("Upload a payment screenshot or receipt.");
      return;
    }
    const extension = proofFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "jpg", "jpeg", "png"].includes(extension)) {
      setReportError("Upload a PDF, JPG or PNG proof file.");
      return;
    }
    if (
      !["application/pdf", "image/jpeg", "image/png"].includes(proofFile.type)
    ) {
      setReportError("The selected file content must be PDF, JPG or PNG.");
      return;
    }
    if (proofFile.size > 2 * 1024 * 1024) {
      setReportError(
        "Payment proof must be 2 MB or smaller.",
      );
      return;
    }

    const proofDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read payment proof."));
      reader.readAsDataURL(proofFile);
    }).catch(() => "");
    if (!proofDataUrl) {
      setReportError("Unable to read the selected payment proof.");
      return;
    }

    setReportSaving(true);
    setReportError("");
    try {
      await submitStudentPaymentReport(reportingPayment.id, {
        amount: Number(report.amount), paymentMode: report.method.replaceAll(" ", "_").toUpperCase(),
        paymentDate: report.paymentDate, transactionReference: report.transactionId.trim(),
        proofName: proofFile.name, proofData: proofDataUrl, note: report.note.trim(),
      });
      setReportingPayment(null);
      setSuccessMessage("Payment reported successfully. The administration team will verify it.");
      try {
        const data = await fetchStudentFees();
        setRecords(data.records);
        setStudent(data.student);
        setLoadError("");
      } catch (refreshError) {
        setLoadError(refreshError.message);
      }
    } catch (error) {
      setReportError(error.message);
    } finally {
      setReportSaving(false);
    }
  };

  return (
    <div>
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
            Finance & Receipts
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy md:text-3xl">
            Fee Records
          </h1>
        </div>
        <span className="w-fit rounded-full border bg-white px-3 py-2 text-[10px] font-semibold text-slate-500">
          {records[0]?.batchName || (student ? "No invoices yet" : "Student account")}
        </span>
      </header>

      {successMessage && (
        <div
          role="status"
          className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"
        >
          <span>✓ {successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {loadError && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{loadError}</p>}

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          [
            "Total Fees",
            total,
            "border-sky-300 bg-sky-50 text-sky-900",
            "fees",
          ],
          [
            "Paid",
            paid,
            "border-emerald-300 bg-emerald-50 text-emerald-900",
            "check",
          ],
          [
            "Pending",
            pending,
            "border-amber-300 bg-amber-50 text-amber-900",
            "clock",
          ],
        ].map(([label, value, style, icon]) => (
          <article
            key={label}
            className={`flex items-center justify-between rounded-xl border border-l-4 px-4 py-3 shadow-sm ${style}`}
          >
            <div>
              <p className="text-[10px] font-semibold opacity-65">{label}</p>
              <strong className="mt-1 block font-heading text-xl">
                {money.format(value)}
              </strong>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60">
              <PortalIcon name={icon} className="h-4 w-4" />
            </span>
          </article>
        ))}
      </section>

      {nextDue && (
        <section className="mt-3 flex flex-col justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
              {nextDue.status === "Verification Pending"
                ? "Verification pending"
                : "Pending payment"}
            </p>
            <h2 className="mt-0.5 font-heading text-sm font-semibold text-brand-navy">
              {nextDue.installment}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Due {date(nextDue.dueDate)} · {nextDue.program}
            </p>
          </div>
          <strong className="font-heading text-lg text-brand-navy">
            {money.format(nextDue.outstandingAmount)}
          </strong>
        </section>
      )}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Payment history
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Download payment details for recorded payments.
            </p>
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-10 rounded-xl border px-3 text-xs font-semibold"
            aria-label="Filter fee records"
          >
            <option value="all">Status</option>
            {studentStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="hidden overflow-x-auto md:block">
          {loading && <p className="p-8 text-center text-xs text-slate-500">Loading fee records…</p>}
          {!loading && (
          <table className="w-full min-w-[860px] table-fixed text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Installment",
                  "Amount",
                  "Due / Paid Date",
                  "Payment Details",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-4 py-3 ${["Status", "Action"].includes(heading) ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">
                      {item.installment}
                    </strong>
                    <span className="block text-[10px] text-slate-400">
                      Invoice {item.invoiceNumber}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3 font-bold">
                    {money.format(item.amount)}
                    {item.paidAmount > 0 && <span className="mt-1 block text-[10px] font-normal text-slate-500">Paid {money.format(item.paidAmount)} · Balance {money.format(item.outstandingAmount)}</span>}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span className="block">Due: {date(item.dueDate)}</span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      Paid: {date(item.paidOn)}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span className="block font-semibold text-brand-navy">
                      {item.method || "Not paid"}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {item.transactionId || "Transaction pending"}
                    </span>
                    {item.status === "Rejected" && item.verificationNote && (
                      <span className="mt-1 block text-[10px] font-semibold text-rose-600">
                        Reason: {item.verificationNote}
                      </span>
                    )}
                    {item.payments.length > 0 && item.status !== "Paid" && (
                      <button type="button" onClick={() => downloadReceipt(item)} className="mt-2 block text-[10px] font-bold text-emerald-700">Download payment details</button>
                    )}
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusStyle[studentFeeStatus(item.status)]}`}
                    >
                      {studentFeeStatus(item.status)}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-center">
                    {item.status === "Paid" ? (
                      <button
                        type="button"
                        onClick={() => downloadReceipt(item)}
                        className="mx-auto inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-[10px] font-bold text-emerald-700"
                      >
                        <PortalIcon name="download" className="h-3.5 w-3.5" />{" "}
                        Download details
                      </button>
                    ) : item.status === "Verification Pending" ? (
                      <span className="text-[10px] font-bold text-violet-700">
                        Awaiting verification
                      </span>
                    ) : !isStudentPending(item.status) ? (
                      <span className="text-[10px] text-slate-400">Unavailable</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openReport(item)}
                        className="mx-auto rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-bold text-white"
                      >
                        Report Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {!loading && !visible.length && (
            <div className="p-10 text-center text-xs text-slate-500">
              {loadError ? "Unable to load fee records." : "No fee records match the selected status."}
            </div>
          )}
        </div>

        <div className="divide-y md:hidden">
          {loading && <p className="p-8 text-center text-xs text-slate-500">Loading fee records…</p>}
          {visible.map((item) => (
            <article key={item.id} className="p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">
                    {item.installment}
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Invoice {item.invoiceNumber} · Due {date(item.dueDate)}
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-2.5 py-1 text-[9px] font-bold ${statusStyle[studentFeeStatus(item.status)]}`}
                >
                  {studentFeeStatus(item.status)}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <strong className="font-heading text-lg text-brand-navy">
                  {money.format(item.amount)}
                </strong>
                {item.status === "Paid" ? (
                  <button
                    type="button"
                    onClick={() => downloadReceipt(item)}
                    className="text-[10px] font-bold text-emerald-700"
                  >
                    Download details
                  </button>
                ) : item.status === "Verification Pending" ? (
                  <span className="text-[10px] font-bold text-violet-700">
                    Awaiting verification
                  </span>
                ) : !isStudentPending(item.status) ? (
                  <span className="text-[10px] text-slate-400">Unavailable</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openReport(item)}
                    className="rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-bold text-white"
                  >
                    Report Payment
                  </button>
                )}
              </div>
              {item.paidAmount > 0 && <p className="mt-2 text-xs text-slate-500">Paid {money.format(item.paidAmount)} · Balance {money.format(item.outstandingAmount)}</p>}
              {item.payments.length > 0 && item.status !== "Paid" && <button type="button" onClick={() => downloadReceipt(item)} className="mt-2 text-[10px] font-bold text-emerald-700">Download payment details</button>}
              {item.status === "Rejected" && item.verificationNote && (
                <p className="mt-2 rounded-lg bg-rose-50 p-2 text-[10px] font-semibold text-rose-700">
                  Reason: {item.verificationNote}
                </p>
              )}
            </article>
          ))}
          {!loading && !visible.length && <p className="p-8 text-center text-xs text-slate-500">{loadError ? "Unable to load fee records." : "No fee records match the selected status."}</p>}
        </div>
      </section>

      {reportingPayment && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (!reportSaving && event.target === event.currentTarget) setReportingPayment(null);
          }}
        >
          <form
            ref={reportRef}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-payment-title"
            onSubmit={submitPaymentReport}
            className="portal-modal-surface max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl outline-none"
          >
            <header className="flex items-start justify-between border-b border-slate-100 p-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700">
                  Payment verification
                </p>
                <h2
                  id="report-payment-title"
                  className="mt-1 font-heading text-lg font-bold text-brand-navy"
                >
                  Report Payment
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  {reportingPayment.installment} ·{" "}
                  {money.format(reportingPayment.outstandingAmount)} outstanding
                </p>
              </div>
              <button
                type="button"
                disabled={reportSaving}
                onClick={() => setReportingPayment(null)}
                aria-label="Close payment report"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800"
              >
                <PortalIcon name="close" className="h-4 w-4" />
              </button>
            </header>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                Amount paid
                <input
                  required
                  type="number"
                  min="0.01"
                  max={reportingPayment.outstandingAmount}
                  step="0.01"
                  value={report.amount}
                  onChange={(event) => setReport({ ...report, amount: event.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Payment method
                <select
                  value={report.method}
                  onChange={(event) =>
                    setReport({ ...report, method: event.target.value })
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs"
                >
                  {paymentMethods.map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Payment date
                <DatePicker
                  required
                  selected={
                    report.paymentDate
                      ? new Date(`${report.paymentDate}T00:00:00`)
                      : null
                  }
                  onChange={(dateValue) =>
                    setReport({
                      ...report,
                      paymentDate: dateValue
                        ? `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`
                        : "",
                    })
                  }
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs"
                  wrapperClassName="w-full"
                  popperClassName="z-[100]"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                Transaction / reference ID
                <input
                  required
                  value={report.transactionId}
                  onChange={(event) =>
                    setReport({ ...report, transactionId: event.target.value })
                  }
                  placeholder="Enter UPI, bank or receipt reference"
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                Payment proof
                <input
                  required
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => {
                    setProofFile(event.target.files?.[0] ?? null);
                    setReportError("");
                  }}
                  className="mt-1.5 block w-full rounded-xl border border-dashed border-violet-300 bg-violet-50 p-2 text-[10px] file:mr-3 file:rounded-lg file:border-0 file:bg-violet-200 file:px-3 file:py-2 file:font-bold file:text-violet-800"
                />
                <span className="mt-1 block text-[9px] font-normal text-slate-400">
                  PDF, JPG or PNG · Maximum 2 MB
                </span>
              </label>
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                Note (optional)
                <textarea
                  rows="2"
                  maxLength="250"
                  value={report.note}
                  onChange={(event) =>
                    setReport({ ...report, note: event.target.value })
                  }
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 p-3 text-xs"
                  placeholder="Add any useful payment details..."
                />
              </label>
              {reportError && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 p-2.5 text-[10px] font-semibold text-rose-700 sm:col-span-2"
                >
                  {reportError}
                </p>
              )}
            </div>
            <footer className="flex justify-end gap-2 border-t bg-slate-50 px-4 py-3">
              <button
                type="button"
                disabled={reportSaving}
                onClick={() => setReportingPayment(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportSaving}
                className="rounded-xl bg-violet-700 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {reportSaving ? "Submitting…" : "Submit for Verification"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

export default FeeRecords;
