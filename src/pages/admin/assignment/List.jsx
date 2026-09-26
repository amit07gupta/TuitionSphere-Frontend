import { useEffect, useRef, useState } from "react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import {
  fetchAssignments,
  fetchAssignment,
  archiveAssignment,
} from "../../../services/assignmentApi";
import AssignmentDetails from "./AssignmentDetails";
import AdminPagination from "../../../components/admin/AdminPagination";
import useTablePagination from "../../../hooks/useTablePagination";

function AssignmentsMonitor() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    batch: "",
    subject: "",
    tutor: "",
    status: "",
  });
  const requestId = useRef(0);
  const saving = useRef(false);
  useEffect(() => {
    let active = true;
    fetchAssignments()
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, []);
  const openDetails = async (item) => {
    const current = ++requestId.current;
    setDetailLoading(true);
    setError("");
    setNotice("");
    try {
      const detail = await fetchAssignment(item.id);
      if (current === requestId.current) setSelected(detail);
    } catch (e) {
      if (current === requestId.current) setError(e.message);
    } finally {
      if (current === requestId.current) setDetailLoading(false);
    }
  };
  const toggleArchive = async (item) => {
    if (saving.current) return;
    saving.current = true;
    setSavingId(item.id);
    setError("");
    setNotice("");
    try {
      const updated = await archiveAssignment(item);
      setItems((rows) =>
        rows.map((row) => (row.id === updated.id ? updated : row)),
      );
      setSelected((current) =>
        current?.id === updated.id ? { ...current, ...updated } : current,
      );
      setNotice(
        `Assignment ${updated.status === "Archived" ? "archived" : "restored"} successfully.`,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      saving.current = false;
      setSavingId(null);
    }
  };
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterLoading, setFilterLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setFilterLoading(true);
      fetchAssignments({
        search: filters.search,
        batchId: filters.batch,
        subjectId: filters.subject,
        tutorId: filters.tutor,
        status: filters.status,
      })
        .then((rows) => {
          if (active) setFilteredItems(rows);
        })
        .catch((e) => {
          if (active) {
            setFilteredItems([]);
            setError(e.message);
          }
        })
        .finally(() => {
          if (active) setFilterLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters, items]);
  const visible = filterLoading ? [] : filteredItems;
  const { page, pageSize, pageItems, setPage } = useTablePagination(visible);
  const changeFilter = (name, value) => {
    setFilterLoading(true);
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };
  const summary = {
    published: items.filter((item) => item.status === "Published").length,
    draft: items.filter((item) => item.status === "Draft").length,
    submissions: items.reduce((total, item) => total + item.submittedCount, 0),
    pending: items.reduce(
      (total, item) => total + item.submittedCount - item.reviewedCount,
      0,
    ),
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Academic Monitoring"
        title="Assignments"
        icon="assignments"
        meta={`${items.length} assignments`}
      />
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}
      {(loading || filterLoading || detailLoading) && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          {loading || filterLoading
            ? "Loading assignments…"
            : "Loading assignment details…"}
        </p>
      )}
      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Published",
            summary.published,
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          ],
          [
            "Draft",
            summary.draft,
            "border-amber-200 bg-amber-50 text-amber-700",
          ],
          [
            "Submissions",
            summary.submissions,
            "border-sky-200 bg-sky-50 text-sky-700",
          ],
          [
            "Pending Review",
            summary.pending,
            "border-violet-200 bg-violet-50 text-violet-700",
          ],
        ].map(([label, value, tone]) => (
          <article
            key={label}
            className={`rounded-2xl border border-l-4 p-4 shadow-sm ${tone}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider">
              {label}
            </p>
            <strong className="mt-1 block font-heading text-2xl text-brand-navy">
              {value}
            </strong>
          </article>
        ))}
      </section>
      <div className="mt-4 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-5">
        <input
          aria-label="Search assignments"
          placeholder="Search assignments"
          value={filters.search}
          onChange={(e) => changeFilter("search", e.target.value)}
          className="rounded-lg border p-2 text-xs"
        />
        {[
          ["Batch", "batchId", "batchName"],
          ["Subject", "subjectId", "subject"],
          ["Tutor", "tutorId", "tutorName"],
        ].map(([name, id, label]) => (
          <select
            key={name}
            aria-label={`Filter by ${name}`}
            value={filters[name]}
            onChange={(e) => changeFilter(name, e.target.value)}
            className="rounded-lg border p-2 text-xs"
          >
            <option value=""> {name}</option>
            {[
              ...new Map(
                items.map((item) => [item[id], item[label]]),
              ).entries(),
            ].map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        ))}
        <select
          // aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => changeFilter("status", e.target.value)}
          className="rounded-lg border p-2 text-xs"
        >
          <option value=""> Status</option>
          {["Published", "Draft", "Archived"].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
      <section className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1050px] table-fixed text-left text-xs">
          <thead className="bg-gradient-to-r from-[#102044] to-[#1d3b73] text-white">
            <tr>
              <th className="w-[19%] border border-blue-300/20 px-4 py-3">
                Assignment
              </th>
              <th className="w-[18%] border border-blue-300/20 px-4 py-3">
                Batch & Subject
              </th>
              <th className="w-[12%] border border-blue-300/20 px-4 py-3">
                Tutor
              </th>
              <th className="w-[11%] border border-blue-300/20 px-4 py-3">
                Due Date
              </th>
              <th className="w-[10%] border border-blue-300/20 px-4 py-3 text-center">
                Submitted
              </th>
              <th className="w-[10%] border border-blue-300/20 px-4 py-3 text-center">
                Reviewed
              </th>
              <th className="w-[10%] border border-blue-300/20 px-4 py-3 text-center">
                Status
              </th>
              <th className="w-[10%] border border-blue-300/20 px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              return (
                <tr key={item.id} className="transition hover:bg-sky-50/40">
                  <td className="border border-slate-200 p-4">
                    <strong className="block truncate text-brand-navy">
                      {item.title}
                    </strong>
                    <span className="block text-slate-400">
                      {item.type} · {item.totalMarks} marks
                    </span>
                  </td>
                  <td className="border border-slate-200 p-4">
                    <span className="block truncate">{item.batchName}</span>
                    <span className="block text-slate-400">{item.subject}</span>
                  </td>
                  <td className="border border-slate-200 p-4">
                    <span className="block truncate">{item.tutorName}</span>
                  </td>
                  <td className="border border-slate-200 p-4">
                    {item.dueDate}
                  </td>
                  <td className="border border-slate-200 p-4 text-center font-bold text-sky-700">
                    {item.submittedCount}
                  </td>
                  <td className="border border-slate-200 p-4 text-center font-bold text-violet-700">
                    {item.reviewedCount}
                  </td>
                  <td className="border border-slate-200 p-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${item.status === "Archived" ? "bg-slate-100 text-slate-600" : item.status === "Draft" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="border border-slate-200 p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={detailLoading || Boolean(savingId)}
                        onClick={() => openDetails(item)}
                        aria-label={`View ${item.title}`}
                        title="View complete details"
                        style={{ color: "#0369a1" }}
                        className="admin-action-native flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 transition hover:bg-sky-100"
                      >
                        <AdminActionIcon name="view" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(savingId) || detailLoading}
                        onClick={() => toggleArchive(item)}
                        aria-label={`${item.status === "Archived" ? "Restore" : "Archive"} ${item.title}`}
                        title={
                          item.status === "Archived"
                            ? "Restore assignment"
                            : "Archive assignment"
                        }
                        style={{
                          color:
                            item.status === "Archived" ? "#047857" : "#be123c",
                        }}
                        className={`admin-action-native flex h-9 w-9 items-center justify-center rounded-lg border transition ${item.status === "Archived" ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "border-rose-200 bg-rose-50 hover:bg-rose-100"}`}
                      >
                        <AdminActionIcon
                          name={
                            item.status === "Archived" ? "restore" : "archive"
                          }
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && !filterLoading && !visible.length && (
              <tr>
                <td colSpan="8" className="p-10 text-center text-slate-400">
                  No assignments match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={visible.length}
          onPageChange={setPage}
        />
      </section>

      {selected && (
        <AssignmentDetails
          selected={selected}
          savingId={savingId}
          toggleArchive={toggleArchive}
          onClose={() => setSelected(null)}
          error={error}
          notice={notice}
        />
      )}
    </div>
  );
}

export default AssignmentsMonitor;
