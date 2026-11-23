import { useEffect, useMemo, useState } from "react";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import {
  createBoard,
  fetchBoards,
  updateBoard,
} from "../../../services/boardApi";
import NewBoard from "./NewBoard";
import EditBoard from "./EditBoard";
import "./board.css";

const boardMetrics = [
  ["Total boards", "all", "educationBoard", "board-metric-indigo"],
  ["Active", "Active", "resolved", "board-metric-emerald"],
  ["Inactive", "Inactive", "inactive", "board-metric-rose"],
];

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionId, setActionId] = useState("");

  const activeCount = useMemo(
    () => boards.filter((board) => board.status === "Active").length,
    [boards],
  );
  const filteredBoards = useMemo(() => {
    const term = search.trim().toLowerCase();
    return boards.filter((board) => {
      const statusMatches =
        statusFilter === "all" || board.status === statusFilter;
      return (
        statusMatches &&
        (!term || `${board.name} ${board.code}`.toLowerCase().includes(term))
      );
    });
  }, [boards, search, statusFilter]);

  const loadBoards = async () => {
    const items = await fetchBoards();
    setBoards(items);
  };

  useEffect(() => {
    let active = true;
    fetchBoards()
      .then((items) => {
        if (!active) return;
        setBoards(items);
        setPageError("");
      })
      .catch((error) => {
        if (active) setPageError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setFormError("");
    setNotice("");
    setShowCreate(true);
  };

  const openEdit = (board) => {
    setFormError("");
    setNotice("");
    setEditingBoard(board);
  };

  const closeForms = () => {
    if (isSaving) return;
    setShowCreate(false);
    setEditingBoard(null);
    setFormError("");
  };

  const saveNewBoard = async (form) => {
    setIsSaving(true);
    setFormError("");
    try {
      await createBoard(form);
      await loadBoards();
      setShowCreate(false);
      setNotice("Board created successfully.");
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveEditedBoard = async (id, form) => {
    setIsSaving(true);
    setFormError("");
    try {
      await updateBoard(id, form);
      await loadBoards();
      setEditingBoard(null);
      setNotice("Board updated successfully.");
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (board) => {
    if (actionId) return;
    const nextStatus = board.status === "Active" ? "Inactive" : "Active";
    setActionId(board.id);
    try {
      await updateBoard(board.id, { ...board, status: nextStatus });
      await loadBoards();
      setNotice(
        `Board ${nextStatus === "Active" ? "activated" : "deactivated"} successfully.`,
      );
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="admin-page board-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="educationBoard" />
          </span>
          <div>
            <p>Academic setup / Boards</p>
            <h1>Education boards</h1>
        
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i /> {activeCount} active boards
          </span>
          <button type="button" onClick={openCreate}>
            <b>+</b> Add board
          </button>
        </div>
      </header>

      {pageError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {pageError}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          {notice}
        </p>
      )}

      <section
        className="board-metrics mt-4 grid gap-3 sm:grid-cols-3"
        aria-label="Board summary"
      >
        {boardMetrics.map(([label, status, icon, tone]) => (
          <button
            type="button"
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`board-metric ${tone} ${statusFilter === status ? "is-selected" : ""}`}
          >
            <span>
              <small>{label}</small>
              <strong>
                {status === "all"
                  ? boards.length
                  : boards.filter((board) => board.status === status).length}
              </strong>
            </span>
            <i>
              <AdminMetricIcon name={icon} className="h-[17px] w-[17px]" />
            </i>
          </button>
        ))}
      </section>

      <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="board-directory-heading">
          <div>
            <h2>Board directory</h2>
           
          </div>
          <strong>{filteredBoards.length} results</strong>
        </div>
        <div className="board-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search board name or code"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter boards"
          >
            <option value="all">Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {["Board", "Code", "Status", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/25 px-4 py-3 ${
                      heading === "Actions" ? "text-center" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading boards...
                  </td>
                </tr>
              ) : filteredBoards.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {boards.length
                      ? "No boards match the selected filters."
                      : "No boards found. Add your first board."}
                  </td>
                </tr>
              ) : (
                filteredBoards.map((board) => (
                  <tr
                    key={board.id}
                    className={
                      board.status === "Active" ? "active-board-row" : ""
                    }
                  >
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="board-name-cell">
                        <span>
                          <AdminMetricIcon
                            name="educationBoard"
                            className="h-4 w-4"
                          />
                        </span>
                        <strong>{board.name}</strong>
                      </div>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span className="board-code">{board.code}</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          board.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {board.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(board)}
                          disabled={Boolean(actionId)}
                          aria-label={`Edit ${board.name}`}
                          title="Edit board"
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(board)}
                          disabled={Boolean(actionId)}
                          aria-label={`${
                            board.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          } ${board.name}`}
                          title={
                            board.status === "Active"
                              ? "Deactivate board"
                              : "Activate board"
                          }
                          className={`admin-action-native ${
                            board.status === "Active"
                              ? "!border-rose-200 !bg-rose-50 !text-rose-700"
                              : "!border-emerald-200 !bg-emerald-50 !text-emerald-700"
                          }`}
                        >
                          <AdminActionIcon
                            name={
                              board.status === "Active"
                                ? "deactivate"
                                : "activate"
                            }
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && (
        <NewBoard
          error={formError}
          isSaving={isSaving}
          onClose={closeForms}
          onSave={saveNewBoard}
        />
      )}
      {editingBoard && (
        <EditBoard
          board={editingBoard}
          error={formError}
          isSaving={isSaving}
          onClose={closeForms}
          onSave={saveEditedBoard}
        />
      )}
    </div>
  );
}
