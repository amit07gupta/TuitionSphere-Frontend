import { useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

function useTablePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);
  const serialNumber = (index) => (page - 1) * pageSize + index + 1;

  return { page, pageSize, pageItems, setPage: setRequestedPage, serialNumber };
}

export default useTablePagination;
