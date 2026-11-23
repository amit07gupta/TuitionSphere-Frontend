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
  const cards = [
    { label: "Today's Classes", value: todayClasses, icon: "schedule", path: "/tutor/my-schedule", detail: "View schedule", tone: "is-sky" },
    { label: "Assigned Students", value: assignedStudents, icon: "attendance", path: "/tutor/students", detail: "Across active batches", tone: "is-emerald" },
    { label: "Active Updates", value: activeUpdates, icon: "notice", path: "/tutor/notices", detail: "View published updates", tone: "is-violet" },
    { label: "Assignments to Review", value: assignmentsToReview, icon: "assignments", path: "/tutor/assignments", detail: "Review submissions", tone: "is-rose" },
  ];
  
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

        <div className="tutor-dashboard-metrics">
          {cards.map(({ label, value, icon, path, detail, tone }) => (
            <Link key={label} to={path} className={`tutor-summary-card ${tone}`}>
              <div className="tutor-summary-card-top">
                <div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
                <i><PortalIcon name={icon} className="h-5 w-5" /></i>
              </div>
              <span>{detail}<PortalIcon name="arrow" className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TutorDashboard;
