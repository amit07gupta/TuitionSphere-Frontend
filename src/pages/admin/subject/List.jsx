import { useEffect, useMemo, useState } from "react";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import { fetchBoards } from "../../../services/boardApi";
import { fetchGrades } from "../../../services/gradeApi";
import {
  createSubject,
  fetchSubjects,
  updateSubject,
} from "../../../services/subjectApi";
import EditSubject from "./EditSubject";
import NewSubject from "./NewSubject";
import "../board/board.css";
import "./subject.css";

export default function SubjectList() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjects, setSubjects] = useState([]),
    [boards, setBoards] = useState([]),
    [grades, setGrades] = useState([]);
  const [search, setSearch] = useState(""),
    [loading, setLoading] = useState(true),
    [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState(""),
    [formError, setFormError] = useState(""),
    [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false),
    [editingSubject, setEditingSubject] = useState(null);
  const activeBoards = useMemo(
    () => boards.filter((item) => item.status === "Active"),
    [boards],
  );
  const filtered = useMemo(
    () =>
      subjects.filter(
        (item) =>
          (statusFilter === "all" || item.status === statusFilter) &&
          (boardFilter === "all" || item.boardId === boardFilter) &&
          (gradeFilter === "all" || item.gradeIds.includes(gradeFilter)) &&
          `${item.name} ${item.code}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [subjects, search, statusFilter, boardFilter, gradeFilter],
  );
  const loadSubjects = async () => setSubjects(await fetchSubjects());

  useEffect(() => {
    let active = true;
    Promise.all([fetchSubjects(), fetchBoards(), fetchGrades()])
      .then(([s, b, g]) => {
        if (active) {
          setSubjects(s);
          setBoards(b);
          setGrades(g);
          setPageError("");
        }
      })
      .catch((error) => active && setPageError(error.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  const close = () => {
    if (!isSaving) {
      setShowCreate(false);
      setEditingSubject(null);
      setFormError("");
    }
  };
  const save = async (form, id) => {
    if (!form.gradeIds.length)
      return setFormError("Select at least one applicable Grade.");
    setIsSaving(true);
    setFormError("");
    try {
      if (id) await updateSubject(id, form);
      else await createSubject(form);
      await loadSubjects();
      setShowCreate(false);
      setEditingSubject(null);
      setNotice(`Subject ${id ? "updated" : "created"} successfully.`);
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  const toggleStatus = async (subject) => {
    try {
      const status = subject.status === "Active" ? "Inactive" : "Active";
      await updateSubject(subject.id, { ...subject, status });
      await loadSubjects();
      setNotice(
        `Subject ${status === "Active" ? "activated" : "deactivated"} successfully.`,
      );
    } catch (error) {
      setPageError(error.message);
    }
  };
  const gradeNames = (ids) =>
    ids
      .map((id) => grades.find((grade) => grade.id === id)?.name || id)
      .join(", ");

  return (
    <div className="admin-page board-page subject-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="book" />
          </span>
          <div>
            <p>Academic setup / Subjects</p>
            <h1>Subjects</h1>
            
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i />
            {loading
              ? "Loading…"
              : `${subjects.filter((item) => item.status === "Active").length} active subjects`}
          </span>
          <button
            type="button"
            disabled={loading || !activeBoards.length || !grades.length}
            onClick={() => {
              setFormError("");
              setNotice("");
              setShowCreate(true);
            }}
          >
            <b>+</b> Add subject
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
        aria-label="Subject summary"
      >
        {[
          ["All subjects", "all", "book", "board-metric-indigo"],
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
                    ? subjects.length
                    : subjects.filter((item) => item.status === status).length}
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
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Subject Directory
            </h2>
            
          </div>
          <strong>{loading ? "Loading…" : `${filtered.length} results`}</strong>
        </header>
        <div className="board-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search subjects"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subject name or code"
            />
          </label>
          
          <select
            aria-label="Applicable education boards"
            value={boardFilter}
            onChange={(event) => {
              setBoardFilter(event.target.value);
              setGradeFilter("all");
            }}
          >
            <option value="all">Board</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.code}
              </option>
            ))}
          </select>
          <select
            aria-label="Applicable class levels"
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
          >
            <option value="all">Grade</option>
            {grades
              .filter(
                (grade) =>
                  boardFilter === "all" || grade.boardIds.includes(boardFilter),
              )
              .map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
          </select>
           <select
            aria-label="Subject availability"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          {(search ||
            statusFilter !== "all" ||
            boardFilter !== "all" ||
            gradeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setBoardFilter("all");
                setGradeFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="subject-table-scroll">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Subject",
                  "Grades",
                  "Board",
                  "Streams",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-4 py-3 ${heading === "Actions" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    Loading subjects...
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    {subjects.length
                      ? "No subjects match your filters."
                      : "No subjects found. Add your first subject."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.status === "Active" ? "active-board-row" : ""
                    }
                  >
                    <td className="border p-4">
                      <strong className="text-brand-navy">{item.name}</strong>
                      <span className="subject-code">{item.code}</span>
                    </td>
                    <td className="border p-4">{gradeNames(item.gradeIds)}</td>
                    <td className="border p-4">
                      {boards.find((board) => board.id === item.boardId)
                        ?.code || item.boardId}
                    </td>
                    <td className="border p-4">
                      {item.streams?.join(", ") || "Not applicable"}
                    </td>
                    <td className="border p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setEditingSubject(item);
                          }}
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                          aria-label={`Edit ${item.name}`}
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          className={`admin-action-native ${item.status === "Active" ? "!border-rose-200 !bg-rose-50 !text-rose-700" : "!border-emerald-200 !bg-emerald-50 !text-emerald-700"}`}
                          aria-label={`Change ${item.name} status`}
                        >
                          <AdminActionIcon
                            name={
                              item.status === "Active"
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
        <NewSubject
          boards={activeBoards}
          grades={grades.filter((item) => item.status === "Active")}
          error={formError}
          isSaving={isSaving}
          onClose={close}
          onSave={(form) => save(form)}
        />
      )}
      {editingSubject && (
        <EditSubject
          subject={editingSubject}
          boards={boards}
          grades={grades}
          error={formError}
          isSaving={isSaving}
          onClose={close}
          onSave={(id, form) => save(form, id)}
        />
      )}
    </div>
  );
}
