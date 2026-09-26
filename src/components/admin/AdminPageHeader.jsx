import { useState } from "react";
import AdminMetricIcon from "./AdminMetricIcon";

const headerNotifications = [
  ["New activity", "A new admin record needs review."],
  ["Follow-up reminder", "Check pending requests and inquiries."],
];

function AdminPageHeader({ eyebrow, title, description, icon, meta }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <header className="relative flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm">
          <AdminMetricIcon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
            {eyebrow}
          </p>
          <h1 className="mt-0.5 font-heading text-2xl font-bold text-brand-navy md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end lg:self-auto">
        {meta && (
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm sm:inline-flex">
            {meta}
          </span>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-brand-navy shadow-sm transition hover:border-brand-gold hover:bg-amber-50"
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
          >
            <AdminMetricIcon name="bell" className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold text-brand-navy">
                Notifications
              </div>
              {headerNotifications.map(([noticeTitle, detail]) => (
                <div
                  key={noticeTitle}
                  className="border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <p className="text-[11px] font-semibold text-brand-navy">
                    {noticeTitle}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold shadow-sm"
          title="Academic Admin"
        >
          AG
        </span>
      </div>
    </header>
  );
}

export default AdminPageHeader;
