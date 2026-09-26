const iconPaths = {
  brand: <><path d="M4 5.5A3 3 0 0 1 7 2.5h5v17H7a3 3 0 0 0-3 3Z" /><path d="M20 5.5a3 3 0 0 0-3-3h-5v17h5a3 3 0 0 1 3 3Z" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  schedule: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
  materials: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" /><path d="M4 5.5v14" /></>,
  assignments: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3V1h6v2M9 9h6M9 13h6M9 17h4" /></>,
  attendance: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m17 11 2 2 4-5" /></>,
  performance: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V2M2 19h22" /></>,
  fees: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M7 15h2" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  collapse: <path d="m15 18-6-6 6-6" />,
  expand: <path d="m9 18 6-6-6-6" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  doubt: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7m0 3h.01" /></>,
  notice: <><path d="m3 11 14-6v14L3 13Z" /><path d="M7 14v5a2 2 0 0 0 2 2h2v-5M20 9v6" /></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M5 21h14" /></>,
  upload: <><path d="M12 21V9m-4 4 4-4 4 4" /><path d="M5 3h14" /></>,
  camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3.5" /></>,
  feedback: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="m8 11 2 2 5-5" /></>,
  filter: <><path d="M4 5h16M7 12h10M10 19h4" /><circle cx="8" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  delete: <><path d="M4 7h16M9 11v6M15 11v6" /><path d="M6 7l1 14h10l1-14M9 4h6l1 3H8l1-3Z" /></>,
  view: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
};

function PortalIcon({ name, className = 'h-5 w-5' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

export default PortalIcon;
