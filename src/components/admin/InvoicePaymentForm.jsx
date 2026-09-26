import { useRef, useState } from "react";

const modes = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
};
const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function InvoicePaymentForm({
  invoice,
  onSave,
  onCancel,
  onSavingChange,
}) {
  const [form, setForm] = useState({
    amount: String(invoice.outstandingAmount),
    paymentMode: "CASH",
    paymentDate: localToday(),
    transactionReference: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const change = (event) =>
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const amount = Number(form.amount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > invoice.outstandingAmount
    ) {
      setError(
        `Enter an amount between ₹0.01 and ₹${invoice.outstandingAmount.toFixed(2)}.`,
      );
      return;
    }
    if (!form.paymentDate || form.paymentDate > localToday()) {
      setError("Select a payment date that is not in the future.");
      return;
    }
    if (form.paymentMode !== "CASH" && !form.transactionReference.trim()) {
      setError("Transaction reference is required for non-cash payments.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    setError("");
    try {
      await onSave(invoice.id, { ...form, amount });
    } catch (requestError) {
      setError(
        requestError.message || "Unable to record payment. Please try again.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
      onSavingChange(false);
    }
  };
  const fieldClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
      aria-label={`Record payment for ${invoice.title}`}
    >
      <h4 className="font-semibold text-brand-navy">Record Payment</h4>
      <p className="mt-1 text-xs text-slate-600">
        Outstanding: ₹{invoice.outstandingAmount.toFixed(2)}
      </p>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <fieldset disabled={saving} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-700">
          Amount (₹)
          <input
            autoFocus
            required
            type="number"
            name="amount"
            min="0.01"
            max={invoice.outstandingAmount}
            step="0.01"
            value={form.amount}
            onChange={change}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Payment Mode
          <select
            name="paymentMode"
            value={form.paymentMode}
            onChange={change}
            className={fieldClass}
          >
            {Object.entries(modes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Payment Date
          <input
            required
            type="date"
            name="paymentDate"
            max={localToday()}
            value={form.paymentDate}
            onChange={change}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Transaction Reference{" "}
          {form.paymentMode === "CASH" ? "(optional)" : "(required)"}
          <input
            name="transactionReference"
            required={form.paymentMode !== "CASH"}
            value={form.transactionReference}
            onChange={change}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
          Notes (optional)
          <textarea
            name="notes"
            rows={2}
            value={form.notes}
            onChange={change}
            className={fieldClass}
          />
        </label>
      </fieldset>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Payment"}
        </button>
      </div>
    </form>
  );
}
