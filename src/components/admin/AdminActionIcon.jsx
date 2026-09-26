const paths = {
  view: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  activate: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="6" />
      <circle cx="16" cy="12" r="3" />
    </>
  ),
  deactivate: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="6" />
      <circle cx="8" cy="12" r="3" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16v13H4Z" />
      <path d="M3 4h18v3H3Z" />
      <path d="M9 11h6" />
      <path d="M12 10v6" />
      <path d="m9.5 13.5 2.5 2.5 2.5-2.5" />
    </>
  ),
  restore: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

function AdminActionIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="admin-directory-action h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default AdminActionIcon;
