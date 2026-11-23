import { useEffect, useMemo, useState } from "react";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import { fetchBoards } from "../../../services/boardApi";
import {
  createGrade,
  fetchGrades,
  updateGrade,
} from "../../../services/gradeApi";
import EditGrade from "./EditGrade";
import NewGrade from "./NewGrade";
import "../board/board.css";
import "./grade.css";

export default function GradeList() {
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");

  const orderedGrades = useMemo(
    () =>
      grades
        .filter(
          (grade) =>
            (statusFilter === "all" || grade.status === statusFilter) &&
            (boardFilter === "all" || grade.boardIds.includes(boardFilter)) &&
            `${grade.name} ${grade.value} ${grade.learningStage}`
              .toLowerCase()
              .includes(search.trim().toLowerCase()),
        )
        .sort((first, second) => Number(first.value) - Number(second.value)),
    [grades, search, statusFilter, boardFilter],
  );
  const activeBoards = useMemo(
    () => boards.filter((board) => board.status === "Active"),
    [boards],
  );
  const activeCount = useMemo(
    () => grades.filter((grade) => grade.status === "Active").length,
    [grades],
  );

  const loadGrades = async () => {
    const items = await fetchGrades();
    setGrades(items);
  };

  useEffect(() => {
    let active = true;

    Promise.all([fetchGrades(), fetchBoards()])
      .then(([gradeItems, boardItems]) => {
        if (!active) return;
        setGrades(gradeItems);
        setBoards(boardItems);
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

  const openEdit = (grade) => {
    setFormError("");
    setNotice("");
    setEditingGrade(grade);
  };

  const closeForms = () => {
    if (isSaving) return;
    setShowCreate(false);
    setEditingGrade(null);
    setFormError("");
  };

  const validateGrade = (form, editingId = null) => {
    const numericValue = Number(form.value);
    if (
      !Number.isInteger(numericValue) ||
      numericValue < 1 ||
      numericValue > 12
    ) {
      return "Numeric value must be between 1 and 12.";
    }
    const gradeNumberInName = /^(?:grade|class)\s+(\d+)$/i.exec(form.name.trim());
    if (gradeNumberInName && Number(gradeNumberInName[1]) !== numericValue) {
      return "Grade name and numeric value must match.";
    }
    if (!form.boardIds.length) return "Select at least one applicable Board.";
    if (
      grades.some(
        (grade) =>
          grade.id !== editingId && Number(grade.value) === numericValue,
      )
    ) {
      return "This numeric Grade value already exists.";
    }
    return "";
  };

  const saveNewGrade = async (form) => {
    const validationError = validateGrade(form);
    if (validationError) return setFormError(validationError);

    setIsSaving(true);
    setFormError("");
    try {
      await createGrade(form);
      await loadGrades();
      setShowCreate(false);
      setNotice("Grade created successfully.");
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveEditedGrade = async (id, form) => {
    const validationError = validateGrade(form, id);
    if (validationError) return setFormError(validationError);

    setIsSaving(true);
    setFormError("");
    try {
      await updateGrade(id, form);
      await loadGrades();
      setEditingGrade(null);
      setNotice("Grade updated successfully.");
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (grade) => {
    const nextStatus = grade.status === "Active" ? "Inactive" : "Active";
    try {
      await updateGrade(grade.id, { ...grade, status: nextStatus });
      await loadGrades();
      setNotice(
        `Grade ${nextStatus === "Active" ? "activated" : "deactivated"} successfully.`,
      );
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    }
  };

  const boardCodes = (grade) =>
    grade.boardIds
      .map((id) => boards.find((board) => board.id === id)?.code || id)
      .join(" · ");

  return (
    <div className="admin-page board-page grade-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="programs" />
          </span>
          <div>
            <p>Academic setup / Grades</p>
            <h1>Grades</h1>
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i /> {loading ? "Loading…" : `${activeCount} active grades`}
          </span>
          <button
            type="button"
            onClick={openCreate}
            disabled={loading || !activeBoards.length}
            title={
              !activeBoards.length
                ? "Create or activate a Board first"
                : "Add grade"
            }
          >
            <b>+</b> Add grade
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
        aria-label="Grade summary"
      >
        {[
          ["Total grades", "all", "programs", "board-metric-indigo"],
          ["Active", "Active", "resolved", "board-metric-emerald"],
          ["Inactive", "Inactive", "inactive", "board-metric-rose"],
        ].map(([label, status, icon, tone]) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={`board-metric ${tone} ${statusFilter === status ? "is-selected" : ""}`}
          >
            <span>
              <small>{label}</small>
              <strong>
                {loading
                  ? "…"
                  : status === "all"
                    ? grades.length
                    : grades.filter((grade) => grade.status === status).length}
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
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Grade Directory
            </h2>
          </div>
          <strong>
            {loading ? "Loading…" : `${orderedGrades.length} results`}
          </strong>
        </div>
        <div className="board-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search grades"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search grade or learning stage"
            />
          </label>
         
          <select
            value={boardFilter}
            onChange={(event) => setBoardFilter(event.target.value)}
            aria-label="Applicable education boards"
          >
            <option value="all">Board</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.code}
              </option>
            ))}
          </select>
           <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Grade availability"
          >
            <option value="all">Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          {(search || statusFilter !== "all" || boardFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setBoardFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Grade",
                  "Numeric Value",
                  "Applicable Boards",
                  "Learning Stage",
                  "Status",
                  "Actions",
                ].map((heading) => (
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
                    colSpan="6"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading grades...
                  </td>
                </tr>
              ) : orderedGrades.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {grades.length
                      ? "No grades match your filters."
                      : "No grades found. Add your first Grade."}
                  </td>
                </tr>
              ) : (
                orderedGrades.map((grade) => (
                  <tr
                    key={grade.id}
                    className={
                      grade.status === "Active" ? "active-board-row" : ""
                    }
                  >
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="board-name-cell">
                        <strong>{grade.name}</strong>
                      </div>
                    </td>
                    <td className="border border-slate-200 px-4 py-3 font-semibold">
                      <span className="board-code">{grade.value}</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {boardCodes(grade) || "—"}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {grade.learningStage}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          grade.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {grade.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(grade)}
                          aria-label={`Edit ${grade.name}`}
                          title="Edit grade"
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(grade)}
                          aria-label={`${
                            grade.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          } ${grade.name}`}
                          title={
                            grade.status === "Active"
                              ? "Deactivate grade"
                              : "Activate grade"
                          }
                          className={`admin-action-native ${
                            grade.status === "Active"
                              ? "!border-rose-200 !bg-rose-50 !text-rose-700"
                              : "!border-emerald-200 !bg-emerald-50 !text-emerald-700"
                          }`}
                        >
                          <AdminActionIcon
                            name={
                              grade.status === "Active"
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
        <NewGrade
          boards={activeBoards}
          error={formError}
          isSaving={isSaving}
          onClose={closeForms}
          onSave={saveNewGrade}
        />
      )}
      {editingGrade && (
        <EditGrade
          grade={editingGrade}
          boards={boards}
          error={formError}
          isSaving={isSaving}
          onClose={closeForms}
          onSave={saveEditedGrade}
        />
      )}
    </div>
  );
}
