export default function AttendanceStatusIcon({ status }) {
  const paths = {
    Present: <path d="m5 12 4 4L19 6" />,
    Absent: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3.1 2.8-4.7 5.5-4.7 1.3 0 2.4.3 3.3.8M16 15l5 5m0-5-5 5" /></>,
    Leave: <><path d="M5 3.5v3M15 3.5v3M3.5 9h13" /><rect x="2.5" y="5.5" width="15" height="15" rx="2" /><path d="m16 14 2 2 4-4" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{paths[status]}</svg>;
}

