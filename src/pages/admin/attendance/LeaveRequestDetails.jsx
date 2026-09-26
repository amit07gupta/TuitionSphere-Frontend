import { createPortal } from "react-dom";
import { formatDate } from "./attendanceUtils";

export default function LeaveRequestDetails({
  request,
  detailsRef,
  isSaving,
  error,
  onClose,
  onReject,
  onApprove,
}) {
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <section
        ref={detailsRef}
        role="dialog"
        aria-modal="true"
        tabIndex="-1"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none"
      >
        <div className="flex justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
              Leave Request Details
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-brand-navy">
              {request.studentName}
            </h2>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3"
          >
            ✕
          </button>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Student ID", request.studentId],
            ["Grade & Board", `Grade ${request.grade} · ${request.board}`],
            [
              "Leave Period",
              `${formatDate(request.fromDate)} – ${formatDate(request.toDate)}`,
            ],
            ["Leave Type", request.type],
            ["Status", request.status],
            [
              "Submitted",
              new Date(request.submittedAt).toLocaleString("en-IN"),
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[9px] font-bold uppercase text-slate-400">
                {label}
              </dt>
              <dd className="mt-1 text-xs font-semibold text-slate-700">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-[9px] font-bold uppercase text-slate-400">
            Reason
          </p>
          <p className="mt-2 text-sm text-slate-700 [overflow-wrap:anywhere]">{request.reason}</p>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-[9px] font-bold uppercase text-slate-400">
            Affected Sessions
          </p>
          <div className="mt-2 divide-y divide-slate-200">
            {request.affectedSessions.map((session) => (
              <div
                key={`${session.classId}-${session.date}`}
                className="flex justify-between gap-3 py-2 text-xs"
              >
                <span>
                  <strong>{session.subject}</strong>
                  <span className="block text-[10px] text-slate-400">
                    {session.topic}
                  </span>
                </span>
                <span className="text-right text-slate-500">
                  {formatDate(session.date)}
                  <br />
                  {session.startTime}
                </span>
              </div>
            ))}
          </div>
        </div>
        {request.rejectionReason && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 [overflow-wrap:anywhere]">
            <strong>Rejection reason:</strong> {request.rejectionReason}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {(request.status === "Pending" || request.status === "Rejected") && (
          <div className="mt-5 flex justify-end gap-2">
            {request.status === "Pending" && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onReject}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white"
              >
                Reject
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={onApprove}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"
            >
              {request.status === "Rejected" ? "Change to Approved" : "Approve"}
            </button>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}
