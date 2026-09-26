import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchTutorDashboard } from "../../services/tutorDashboardApi";
import "./dashboard.css";

function TutorDashboard() {
  const tutorName = sessionStorage.getItem('tuitionsphere_tutor_name') || "Tutor";
  const [summary, setSummary] = useState({ todayClasses: 0, assignedStudents: 0, activeUpdates: 0, assignmentsToReview: 0, nextClass: null });
  useEffect(() => { let active = true; fetchTutorDashboard().then((data) => { if (active) setSummary(data); }).catch(() => {}); return () => { active = false; }; }, []);
  const { todayClasses, assignedStudents, activeUpdates, assignmentsToReview, nextClass } = summary;
  
  return (
    <div className="tutor-dashboard space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_35px_rgba(30,41,59,0.07)] sm:px-6 lg:px-7">
        <div className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-amber-100/70 blur-2xl" />
        <div className="absolute right-24 top-2 h-24 w-24 rounded-full bg-sky-100/70 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <PortalIcon name="brand" className="h-4 w-4" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
                Tutor workspace
              </p>
            </div>
            <h1 className="font-heading text-2xl font-bold text-brand-navy sm:text-2xl">
              Welcome, {tutorName}
            </h1>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <PortalIcon name="schedule" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Next class
              </p>
              <strong className="block text-sm text-brand-navy">
                {nextClass ? `${nextClass.subject} · ${nextClass.startTime}` : "Not scheduled"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="tutor-summary-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Teaching summary
            </p>
            <h2
              id="tutor-summary-heading"
              className="mt-1 font-heading text-xl font-bold text-brand-navy"
            >
              Dashboard overview
            </h2>
          </div>
          <span className="hidden text-xs text-slate-400 sm:block">
            Current academic session
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/tutor/my-schedule"
            className="tutor-summary-card is-sky group rounded-2xl border border-sky-200 border-l-4 border-l-sky-500 bg-gradient-to-br from-white to-sky-50 px-4 py-4 text-sky-950 no-underline shadow-[0_6px_18px_rgba(14,165,233,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(14,165,233,0.16)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-sky-700">
                  Today&apos;s Classes
                </p>
                <strong className="mt-1 block font-heading text-2xl text-brand-navy">
                  {todayClasses}
                </strong>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition group-hover:scale-105">
                <PortalIcon name="schedule" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-sky-200/70 pt-2.5">
              <span className="text-[10px] text-sky-700/70">View schedule</span>
              <span className="text-sm font-bold text-sky-700">→</span>
            </div>
          </Link>

          <Link
            to="/tutor/students"
            className="tutor-summary-card is-emerald group rounded-2xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50 px-4 py-4 text-emerald-950 no-underline shadow-[0_6px_18px_rgba(16,185,129,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(16,185,129,0.16)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700">
                  Assigned Students
                </p>
                <strong className="mt-1 block font-heading text-2xl text-brand-navy">
                  {assignedStudents}
                </strong>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:scale-105">
                <PortalIcon name="attendance" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-emerald-200/70 pt-2.5">
              <span className="text-[10px] text-emerald-700/70">
                Across active batches
              </span>
              <span className="text-sm font-bold text-emerald-700">→</span>
            </div>
          </Link>

          <Link
            to="/tutor/notices"
            className="tutor-summary-card is-violet group rounded-2xl border border-violet-200 border-l-4 border-l-violet-500 bg-gradient-to-br from-white to-violet-50 px-4 py-4 text-violet-950 no-underline shadow-[0_6px_18px_rgba(139,92,246,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(139,92,246,0.16)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-violet-700">
                  Active Updates
                </p>
                <strong className="mt-1 block font-heading text-2xl text-brand-navy">
                  {activeUpdates}
                </strong>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:scale-105">
                <PortalIcon name="notice" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-violet-200/70 pt-2.5">
              <span className="text-[10px] text-violet-700/70">
                View published updates
              </span>
              <span className="text-sm font-bold text-violet-700">→</span>
            </div>
          </Link>

          <Link
            to="/tutor/assignments"
            className="tutor-summary-card is-rose group rounded-2xl border border-rose-200 border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50 px-4 py-4 text-rose-950 no-underline shadow-[0_6px_18px_rgba(244,63,94,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(244,63,94,0.16)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-rose-700">
                  Assignments to Review
                </p>
                <strong className="mt-1 block font-heading text-2xl text-brand-navy">
                  {assignmentsToReview}
                </strong>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 transition group-hover:scale-105">
                <PortalIcon name="assignments" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-rose-200/70 pt-2.5">
              <span className="text-[10px] text-rose-700/70">
                Review submissions
              </span>
              <span className="text-sm font-bold text-rose-700">→</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default TutorDashboard;
