function AdminPagination({ page, pageSize, totalItems, onPageChange }) {
  if (!totalItems) return null;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:px-5">
      <p className="text-[11px] text-slate-500">
        Showing{" "}
        <strong className="text-brand-navy">
          {start}–{end}
        </strong>{" "}
        of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-brand-gold hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-navy px-2 text-xs font-bold text-white">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-brand-gold hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;
