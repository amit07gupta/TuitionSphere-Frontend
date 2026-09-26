import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminPagination from "../../../components/admin/AdminPagination";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import { fetchInquiries, updateInquiry } from "../../../services/inquiryApi";
import "../board/board.css";
import "./inquiry.css";

const PAGE_SIZE = 10;
const STATUS_STYLE = {
  New: "bg-violet-100 text-violet-700",
  Contacted: "bg-sky-100 text-sky-700",
  "Follow-up Required": "bg-amber-100 text-amber-700",
  Closed: "bg-emerald-100 text-emerald-700",
};
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IN";

function Inquiries() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [note, setNote] = useState("");
  const modalRef = useAccessibleModal(Boolean(selected), () =>
    setSelected(null),
  );
  const [requestError, setRequestError] = useState("");
  useEffect(() => {
    let active = true;
    fetchInquiries()
      .then((records) => {
        if (active) setLeads(records);
      })
      .catch((error) => {
        if (active) setRequestError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const inquiries = useMemo(
    () => leads.filter((item) => item.type === "Inquiry"),
    [leads],
  );
  const visibleRecords = useMemo(
    () =>
      inquiries.filter((item) => {
        const query = search.trim().toLowerCase();
        const matches =
          !query ||
          [
            item.id,
            item.name,
            item.phone,
            item.email,
            item.inquiryType,
            item.message,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          );
        return matches && (status === "all" || item.status === status);
      }),
    [inquiries, search, status],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(visibleRecords.length / PAGE_SIZE)),
  );
  const pageRecords = visibleRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const refresh = async (changes) => {
    try {
      const apiRecord = await updateInquiry(
        selected.backendId || selected.id,
        changes,
      );
      const updated = { ...selected, ...changes, ...apiRecord };
      setLeads((current) =>
        current.map((item) => (item.id === selected.id ? updated : item)),
      );
      setSelected(updated);
      setNote("");
      return updated;
    } catch (error) {
      setRequestError(error.message);
      return null;
    }
  };
  const addFollowUp = async () => {
    if (!note.trim()) return;
    const history = [
      ...(selected.followUpHistory || []),
      { note: note.trim(), createdAt: new Date().toISOString() },
    ];
    await refresh({
      status: "Follow-up Required",
      followUpNote: note.trim(),
      followUpHistory: history,
    });
  };
  const readyForAdmission = async () => {
    const updated = await refresh({
      type: "Admission",
      source: "Inquiry",
      studentName: selected.studentName || selected.name,
      parentName: selected.parentName || selected.name,
      status: "Ready for Admission",
      admissionInterest: "Direct inquiry",
      admissionReadyAt: new Date().toISOString(),
    });
    if (updated)
      navigate(`/admin/admissions?leadId=${encodeURIComponent(updated.id)}`);
  };

  return (
    <div className="admin-page board-page inquiry-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="contacted" />
          </span>
          <div>
            <p>Admissions / Inquiries</p>
            <h1>Inquiries</h1>
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i />
            {inquiries.length} total inquiries
          </span>
        </div>
      </header>
      {requestError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {requestError}
        </p>
      )}
      <section className="board-metrics mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["All inquiries", "all", "total", "board-metric-indigo"],
          [
            "New",
            "New",
            "new",
            "board-metric-rose",
          ],
          [
            "Follow-up",
            "Follow-up Required",
            "progress",
            "board-metric-amber",
          ],
          [
            "Resolved",
            "Closed",
            "resolved",
            "board-metric-emerald",
          ],
        ].map(([label, value, icon, tone]) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`board-metric ${tone} ${status === value ? "is-selected" : ""}`}
          >
            <span>
              <small>{label}</small>
              <strong>
                {value === "all"
                  ? inquiries.length
                  : inquiries.filter((item) => item.status === value).length}
              </strong>
            </span>
            <i>
              <AdminMetricIcon name={icon} className="h-[17px] w-[17px]" />
            </i>
          </button>
        ))}
      </section>

      <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="board-directory-heading">
          <div>
            <h2>Inquiry Directory</h2>
            <p>Review questions and manage follow-up activity.</p>
          </div>
          <strong>{visibleRecords.length} results</strong>
        </header>
        <div className="board-filters inquiry-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search inquiries"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, email or inquiry type"
            />
          </label>
          <select
            aria-label="Inquiry status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Status</option>
            {Object.keys(STATUS_STYLE).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {(search || status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Person",
                  "Inquiry",
                  "Requirement",
                  "Contact Preference",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-4 py-3 ${heading === "Action" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inquiry-avatar">
                        {initials(item.name || item.studentName)}
                      </span>
                      <div>
                        <strong className="text-brand-navy">
                          {item.name || item.studentName}
                        </strong>
                        <span className="block text-[10px] text-slate-500">
                          {item.phone ? `+91 ${item.phone}` : item.email || "No contact"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="border border-slate-200 px-4 py-3 font-semibold">
                    {item.inquiryType || "General inquiry"}
                    <span className="block text-[10px] font-normal text-slate-500">
                      {item.grade ? `Grade ${item.grade}` : "Grade not selected"}
                    </span>
                  </td>
                  <td className="max-w-xs border border-slate-200 px-4 py-3">
                    <p className="line-clamp-2 text-slate-600">
                      {item.message || "No message provided"}
                    </p>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <strong>{item.contactMethod || "Phone"}</strong>
                    <span className="block text-[10px] text-slate-400">
                      {item.preferredTime || "Flexible"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${STATUS_STYLE[item.status] || STATUS_STYLE.New}`}
                    >
                      {item.status === "Closed" ? "Resolved" : item.status}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setNote("");
                      }}
                      aria-label={`View ${item.name || item.studentName} inquiry`}
                      title="View inquiry"
                      className="admin-action-native inquiry-view-action !border-slate-200 !bg-slate-50 !text-slate-700"
                    >
                      <AdminActionIcon name="view" />
                    </button>
                  </td>
                </tr>
              ))}
              {!pageRecords.length && (
                <tr>
                  <td
                    colSpan="6"
                    className="border p-10 text-center text-slate-400"
                  >
                    No inquiries match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={visibleRecords.length}
          onPageChange={setPage}
        />
      </section>

      {selected &&
        createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            ref={modalRef}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            className="inquiry-modal flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-2xl sm:rounded-3xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b p-4 sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                  {selected.inquiryType || "General inquiry"}
                </p>
                <h2 id="inquiry-title" className="mt-1 break-words font-heading text-xl font-bold text-brand-navy">
                  {selected.name || selected.studentName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close inquiry details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </header>
            <div className="inquiry-modal-body min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Phone",
                    selected.phone ? `+91 ${selected.phone}` : "Not provided",
                  ],
                  ["Email", selected.email || "Not provided"],
                  [
                    "Grade",
                    selected.grade ? `Grade ${selected.grade}` : "Not selected",
                  ],
                  ["Learning Mode", selected.learningMode || "Need guidance"],
                  ["Contact Method", selected.contactMethod || "Phone"],
                  ["Preferred Contact", selected.preferredTime || "Flexible"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="inquiry-detail-card rounded-xl border bg-slate-50 p-3"
                  >
                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      {label}
                    </p>
                    <strong className="mt-1 block text-xs text-brand-navy">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="inquiry-message-card mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Question / Requirement
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selected.message || "No detailed message provided."}
                </p>
              </div>
              {selected.followUpNote && (
                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  <strong>Latest follow-up:</strong> {selected.followUpNote}
                </div>
              )}
              {selected.status !== "Closed" && (
                <label className="mt-4 block text-xs font-semibold text-slate-600">
                  Follow-up note
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows="3"
                    placeholder="What needs to happen next?"
                    className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-gold"
                  />
                </label>
              )}
              <div className="inquiry-modal-actions mt-5 flex flex-wrap gap-2 border-t pt-5">
                {selected.status === "New" && (
                  <button
                    type="button"
                    onClick={() =>
                      refresh({
                        status: "Contacted",
                        contactedAt: new Date().toISOString(),
                      })
                    }
                    className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Mark Contacted
                  </button>
                )}
                {selected.status !== "New" && selected.status !== "Closed" && (
                  <>
                    <button
                      type="button"
                      disabled={!note.trim()}
                      onClick={addFollowUp}
                      className="rounded-xl bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-800 disabled:opacity-40"
                    >
                      Save Follow-up
                    </button>
                    <button
                      type="button"
                      onClick={readyForAdmission}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"
                    >
                      Ready for Admission
                    </button>
                  </>
                )}
                {selected.status !== "Closed" && (
                  <button
                    type="button"
                    onClick={() =>
                      refresh({
                        status: "Closed",
                        resolvedAt: new Date().toISOString(),
                      })
                    }
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700"
                  >
                    Resolve Inquiry
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default Inquiries;
