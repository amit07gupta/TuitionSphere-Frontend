import { useEffect, useMemo, useState } from "react";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import TutorDetails from "./TutorDetails";
import "../board/board.css";
import "./tutor.css";
import { fetchBoards } from "../../../services/boardApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchSubjects } from "../../../services/subjectApi";
import {
  createTutor,
  fetchTutors,
  updateTutor,
} from "../../../services/tutorApi";
import EditTutor from "./EditTutor";
import NewTutor from "./NewTutor";

const badge = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-rose-100 text-rose-700",
};
const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TutorList() {
  const [tutors, setTutors] = useState([]),
    [boards, setBoards] = useState([]),
    [grades, setGrades] = useState([]),
    [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState(""),
    [statusFilter, setStatusFilter] = useState("all"),
    [loading, setLoading] = useState(true),
    [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState(""),
    [formError, setFormError] = useState(""),
    [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false),
    [editingTutor, setEditingTutor] = useState(null);
  const [boardFilter, setBoardFilter] = useState("all"),
    [gradeFilter, setGradeFilter] = useState("all"),
    [subjectFilter, setSubjectFilter] = useState("all"),
    [modeFilter, setModeFilter] = useState("all");
  const [viewingTutor, setViewingTutor] = useState(null),
    [statusBusy, setStatusBusy] = useState("");
  const filterGrades = grades.filter(
    (g) => boardFilter === "all" || g.boardIds.includes(boardFilter),
  );
  const filterSubjects = subjects.filter(
    (s) =>
      (boardFilter === "all" || s.boardId === boardFilter) &&
      (gradeFilter === "all" || s.gradeIds.includes(gradeFilter)),
  );
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBoardFilter("all");
    setGradeFilter("all");
    setSubjectFilter("all");
    setModeFilter("all");
  };
  const activeBoards = useMemo(
    () => boards.filter((item) => item.status === "Active"),
    [boards],
  );
  const filtered = useMemo(
    () =>
      tutors.filter(
        (tutor) =>
          (statusFilter === "all" || tutor.status === statusFilter) &&
          (boardFilter === "all" || tutor.boardIds.includes(boardFilter)) &&
          (gradeFilter === "all" || tutor.gradeIds.includes(gradeFilter)) &&
          (subjectFilter === "all" ||
            tutor.subjectIds.includes(subjectFilter)) &&
          (modeFilter === "all" || tutor.mode.includes(modeFilter)) &&
          `${tutor.phone} ${tutor.name} ${tutor.email} ${tutor.employeeCode} ${tutor.designation}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [
      tutors,
      search,
      statusFilter,
      boardFilter,
      gradeFilter,
      subjectFilter,
      modeFilter,
    ],
  );
  const loadTutors = async () => setTutors(await fetchTutors());

  useEffect(() => {
    let active = true;
    Promise.all([fetchTutors(), fetchBoards(), fetchGrades(), fetchSubjects()])
      .then(([t, b, g, s]) => {
        if (active) {
          setTutors(t);
          setBoards(b);
          setGrades(g);
          setSubjects(s);
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
      setEditingTutor(null);
      setFormError("");
    }
  };
  const validate = (form) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length !== 10)
      return "Phone number must contain exactly 10 digits.";
    if (
      !form.boardIds.length ||
      !form.gradeIds.length ||
      !form.subjectIds.length ||
      !form.mode.length
    )
      return "Select at least one Board, Grade, Subject and Teaching Mode.";
    return "";
  };
  const save = async (form, id) => {
    const message = validate(form);
    if (message) return setFormError(message);
    setIsSaving(true);
    setFormError("");
    try {
      if (id) await updateTutor(id, form);
      else await createTutor(form);
      await loadTutors();
      setShowCreate(false);
      setEditingTutor(null);
      setNotice(`Tutor ${id ? "updated" : "created"} successfully.`);
      setPageError("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  const toggleStatus = async (tutor) => {
    if (statusBusy) return;
    setStatusBusy(tutor.id);
    try {
      const status = tutor.status === "Active" ? "Inactive" : "Active";
      await updateTutor(tutor.id, { ...tutor, status });
      await loadTutors();
      setNotice(
        `Tutor ${status === "Active" ? "activated" : "deactivated"} successfully.`,
      );
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setStatusBusy("");
    }
  };
  const namesFor = (ids, items, field = "name") =>
    ids
      .map((id) => items.find((item) => item.id === id)?.[field] || id)
      .join(", ");

  return (
    <div className="admin-page board-page tutor-page">
      <header className="tutor-page-heading">
        <span className="tutor-heading-icon">
          <AdminMetricIcon name="tutor" />
        </span>
        <div>
          <h1>Tutors</h1>
         
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
        aria-label="Tutor summary"
      >
        {[
          ["All tutors", "all", "tutor", "board-metric-indigo"],
          ["Active", "Active", "resolved", "board-metric-emerald"],
          ["Inactive", "Inactive", "inactive", "board-metric-rose"],
        ].map(([label, value, icon, tone]) => (
          <button
            key={value}
            type="button"
            aria-pressed={statusFilter === value}
            onClick={() => setStatusFilter(value)}
            className={`board-metric ${tone} ${statusFilter === value ? "is-selected" : ""}`}
          >
            <span>
              <small>{label}</small>
              <strong>
                {loading
                  ? "…"
                  : value === "all"
                    ? tutors.length
                    : tutors.filter((tutor) => tutor.status === value).length}
              </strong>
            </span>
            <i>
              <AdminMetricIcon name={icon} className="h-[17px] w-[17px]" />
            </i>
          </button>
        ))}
      </section>
      <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Tutor Directory
            </h2>
            <p className="text-xs text-slate-500">
              {filtered.length} tutors ·{" "}
              {tutors.filter((t) => t.status === "Active").length} active
            </p>
          </div>
          <button
            type="button"
            disabled={
              !activeBoards.length || !grades.length || !subjects.length
            }
            onClick={() => {
              setFormError("");
              setNotice("");
              setShowCreate(true);
            }}
            className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            + Add Tutor
          </button>
        </header>
        <div className="board-filters tutor-filters">
          <label>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search tutors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or code"
            />
          </label>
          <select
            aria-label="Grade"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setSubjectFilter("all");
            }}
          >
            <option value="all">Grade</option>
            {filterGrades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Education board"
            value={boardFilter}
            onChange={(e) => {
              setBoardFilter(e.target.value);
              setGradeFilter("all");
              setSubjectFilter("all");
            }}
          >
            <option value="all">Board</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code}
              </option>
            ))}
          </select>
          <select
            aria-label="Subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">Subject</option>
            {filterSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {boards.find((b) => b.id === s.boardId)?.code}
              </option>
            ))}
          </select>
          <select
            aria-label="Teaching mode"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">Mode</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
          <select
            aria-label="Tutor availability status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          {(search ||
            [
              statusFilter,
              boardFilter,
              gradeFilter,
              subjectFilter,
              modeFilter,
            ].some((v) => v !== "all")) && (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Tutor",
                  "Contact",
                  "Subjects",
                  "Boards & Grades",
                  "Mode",
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
                  <td colSpan="7" className="p-10 text-center text-slate-500">
                    Loading tutors...
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500">
                    No tutors found.
                  </td>
                </tr>
              ) : (
                filtered.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-blue-50/50">
                    <td className="border p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-brand-gold">
                          {initials(tutor.name)}
                        </span>
                        <div>
                          <strong className="text-brand-navy">
                            {tutor.name}
                          </strong>
                          <span className="block text-[10px] text-slate-400">
                            {tutor.employeeCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border p-4">
                      <span>{tutor.email}</span>
                      <span className="block text-slate-500">
                        +91 {tutor.phone}
                      </span>
                    </td>
                    <td className="border p-4">
                      <span title={namesFor(tutor.subjectIds, subjects)}>
                        {namesFor(tutor.subjectIds.slice(0, 2), subjects)}
                        {tutor.subjectIds.length > 2 && (
                          <button
                            className="tutor-more"
                            onClick={() => setViewingTutor(tutor)}
                            aria-label={`View all subjects for ${tutor.name}`}
                          >
                            +{tutor.subjectIds.length - 2}
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="border p-4">
                      <span>{namesFor(tutor.boardIds, boards, "code")}</span>
                      <span className="block text-slate-500">
                        {namesFor(tutor.gradeIds.slice(0, 3), grades)}
                        {tutor.gradeIds.length > 3 && (
                          <button
                            className="tutor-more"
                            onClick={() => setViewingTutor(tutor)}
                            aria-label={`View all grades for ${tutor.name}`}
                          >
                            +{tutor.gradeIds.length - 3}
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="border p-4">
                      <div className="tutor-modes">
                        {tutor.mode.map((mode) => (
                          <span key={mode}>{mode}</span>
                        ))}
                      </div>
                    </td>
                    <td className="border p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${badge[tutor.status]}`}
                      >
                        {tutor.status}
                      </span>
                    </td>
                    <td className="border p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`View ${tutor.name}`}
                          onClick={() => setViewingTutor(tutor)}
                          className="admin-action-native !border-slate-200 !bg-slate-50 !text-slate-700"
                        >
                          <AdminActionIcon name="view" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setEditingTutor(tutor);
                          }}
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                          aria-label={`Edit ${tutor.name}`}
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(statusBusy)}
                          onClick={() => toggleStatus(tutor)}
                          className={`admin-action-native ${tutor.status === "Active" ? "!border-rose-200 !bg-rose-50 !text-rose-700" : "!border-emerald-200 !bg-emerald-50 !text-emerald-700"}`}
                          aria-label={`Change ${tutor.name} status`}
                        >
                          <AdminActionIcon
                            name={
                              tutor.status === "Active"
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
      {viewingTutor && (
        <TutorDetails
          tutor={viewingTutor}
          boards={boards}
          grades={grades}
          subjects={subjects}
          onClose={() => setViewingTutor(null)}
        />
      )}
      {showCreate && (
        <NewTutor
          boards={activeBoards}
          grades={grades.filter((item) => item.status === "Active")}
          subjects={subjects}
          error={formError}
          isSaving={isSaving}
          onClose={close}
          onSave={(form) => save(form)}
        />
      )}
      {editingTutor && (
        <EditTutor
          tutor={editingTutor}
          boards={boards}
          grades={grades}
          subjects={subjects}
          error={formError}
          isSaving={isSaving}
          onClose={close}
          onSave={(id, form) => save(form, id)}
        />
      )}
    </div>
  );
}
