const iconPaths = {
  educationBoard: (
    <>
      <path d="m3 8 9-5 9 5H3ZM5 10v9M10 10v9M14 10v9M19 10v9M3 21h18" />
    </>
  ),
  total: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  new: (
    <>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  contacted: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  scheduled: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18m-10 5 2 2 4-4" />
    </>
  ),
  progress: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  resolved: (
    <>
      <path d="m5 12 4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  students: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  pending: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  inactive: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  programs: (
    <>
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 13v4c3 2 7 2 10 0v-4" />
    </>
  ),
  batches: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </>
  ),
  schedule: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <path d="M8 14h3M13 14h3M8 18h3" />
    </>
  ),
  completedSession: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <path d="m8 16 2.5 2.5L16 13" />
    </>
  ),
  enrolled: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0m2-8v6m-3-3h6" />
    </>
  ),
  seats: (
    <>
      <path d="M6 11V7a3 3 0 0 1 6 0v4M4 11h12v7H4zM8 18v3m4-3v3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  view: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" />
      <path d="m9 8 1 1.5L12 7" />
    </>
  ),
  revenue: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M8 11h8m-8 0c0 3 2 5 6 5m-4 0 5 4" />
    </>
  ),
  paid: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18m-6 5 1.5 1.5L20 13" />
    </>
  ),
  overdue: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6m0 4h.01" />
    </>
  ),
  tutor: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0M18 4l2-2M6 4 4 2" />
    </>
  ),
  attendance: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="m16 13 2.5 2.5L22 12" />
    </>
  ),
  assignments: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4" />
    </>
  ),
};

function AdminMetricIcon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

export default AdminMetricIcon;
