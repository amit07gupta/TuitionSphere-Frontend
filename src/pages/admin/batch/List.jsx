import { useEffect, useRef, useState } from "react";
import NewBatch from "./NewBatch";
import EditBatch from "./EditBatch";
import BatchDetails from "./BatchDetails";
import "../board/board.css";
import "../tutor/tutor.css";
import "./batch.css";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminPagination from "../../../components/admin/AdminPagination";
import useTablePagination from "../../../hooks/useTablePagination";
import { fetchAcademicSessions } from "../../../services/academicSessionApi";
import {
  fetchBatches,
  createBatch,
  updateBatch,
} from "../../../services/batchApi";
import { fetchBoards } from "../../../services/boardApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchSubjects } from "../../../services/subjectApi";
import { fetchTutors } from "../../../services/tutorApi";
import BatchFilters from "./BatchFilters";

const modeOptions = ["Offline", "Online"];
const emptyBatch = {
  id: "",
  academicSessionId: "",
  name: "",
  gradeId: "",
  grade: "",
  boardId: "",
  board: "",
  stream: "",
  subjectIds: [],
  subjects: [],
  tutorAssignments: [],
  mode: "Offline",
  capacity: 20,
  status: "Active",
};

function StatusBadge({ status }) {
  const tone =
    status === "Active"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Full"
        ? "bg-violet-100 text-violet-700"
        : "bg-slate-200 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${tone}`}>
      {status}
    </span>
  );
}

function CoursesBatches() {
  const [sessions, setSessions] = useState([]),
    [sessionFilter, setSessionFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all"),
    [subjectFilter, setSubjectFilter] = useState("all"),
    [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false),
    [notice, setNotice] = useState("");
  const busy = useRef(false);
  const [activeSession, setActiveSession] = useState(null);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [form, setForm] = useState(emptyBatch);
  const [error, setError] = useState("");

  const loadBatches = async () => {
    const items = await fetchBatches();
    setBatches(items);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchAcademicSessions(),
      fetchBoards(),
      fetchGrades(),
      fetchSubjects(),
      fetchTutors(),
      fetchBatches(),
    ])
      .then(
        ([
          sessions,
          boardItems,
          gradeItems,
          subjectItems,
          tutorItems,
          batchItems,
        ]) => {
          if (!mounted) return;
          setSessions(sessions);
          setSessionFilter(
            sessions.find((s) => s.status === "Active")?.id ||
              sessions[0]?.id ||
              "",
          );
          setActiveSession(
            sessions.find((item) => item.status === "Active") || null,
          );
          setBoards(boardItems);
          setGrades(gradeItems);
          setSubjects(subjectItems);
          setTutors(tutorItems);
          setBatches(batchItems);
          setError("");
        },
      )
      .catch((loadError) => {
        if (mounted) setError(loadError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const enrollmentCount = (id) =>
    batches.find((b) => b.id === id)?.enrolled || 0;
  const batchesWithCounts = batches.filter(
    (b) => b.academicSessionId === sessionFilter,
  );
  const filtered = (() => {
    const term = search.trim().toLowerCase();
    return batchesWithCounts.filter(
      (batch) =>
        (!term ||
          [
            batch.id,
            batch.name,
            batch.grade,
            batch.board,
            batch.stream,
            ...(batch.subjects || []),
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(term),
          )) &&
        (boardFilter === "all" || batch.boardId === boardFilter) &&
        (modeFilter === "all" || batch.mode === modeFilter) &&
        (gradeFilter === "all" || batch.gradeId === gradeFilter) &&
        (subjectFilter === "all" || batch.subjectIds.includes(subjectFilter)) &&
        (statusFilter === "all" || batch.status === statusFilter),
    );
  })();
  const {
    page,
    pageSize,
    setPage,
    pageItems,
    serialNumber: serial,
  } = useTablePagination(filtered, 10);

  const selectedGrade =
    grades.find((item) => item.id === form.gradeId) ||
    grades.find((item) => String(item.value) === String(form.grade));
  const subjectMatchesGrade = (subject, grade) =>
    (subject.gradeIds || []).some((id) => String(id) === String(grade?.id));
  const subjectMatchesBoard = (subject, board) =>
    String(subject.boardId || subject.boardIds?.[0] || "") ===
    String(board?.id);
  const gradeSupportsBoard = (grade, board) =>
    (grade?.boardIds || []).some((id) => String(id) === String(board.id)) ||
    (grade?.boards || []).some(
      (value) =>
        String(value).toUpperCase() === String(board.code).toUpperCase(),
    ) ||
    subjects.some(
      (subject) =>
        subjectMatchesGrade(subject, grade) &&
        subjectMatchesBoard(subject, board),
    );
  const availableBoards = boards.filter(
    (item) =>
      (item.status === "Active" || item.id === form.boardId) &&
      gradeSupportsBoard(selectedGrade, item),
  );
  const selectedBoard =
    boards.find((item) => item.id === form.boardId) ||
    boards.find((item) => item.code === form.board);
  const seniorGradeSelected = Number(selectedGrade?.value) >= 11;
  const availableSubjects =
    selectedGrade && selectedBoard && (!seniorGradeSelected || form.stream)
      ? subjects.filter(
          (subject) =>
            subject.status === "Active" &&
            subjectMatchesGrade(subject, selectedGrade) &&
            subjectMatchesBoard(subject, selectedBoard) &&
            (!seniorGradeSelected ||
              !subject.streams?.length ||
              subject.streams.includes(form.stream)),
        )
      : [];
  const compatibleTutors = (subject) =>
    tutors.filter((tutor) => {
      const subjectMatch =
        tutor.subjectIds?.includes(subject.id) ||
        tutor.subjects?.some(
          (item) => String(item).toLowerCase() === subject.name.toLowerCase(),
        );
      const gradeMatch =
        tutor.gradeIds?.includes(selectedGrade?.id) ||
        tutor.grades?.some(
          (item) => String(item) === String(selectedGrade?.value),
        );
      const boardMatch =
        tutor.boardIds?.includes(selectedBoard?.id) ||
        tutor.boards?.some(
          (item) =>
            String(item).toUpperCase() ===
            String(selectedBoard?.code).toUpperCase(),
        );
      const streamMatch =
        !seniorGradeSelected ||
        !form.stream ||
        !tutor.streams?.length ||
        tutor.streams.includes(form.stream);
      const modeMatch = !tutor.mode?.length || tutor.mode.includes(form.mode);
      return (
        tutor.status === "Active" &&
        subjectMatch &&
        gradeMatch &&
        boardMatch &&
        streamMatch &&
        modeMatch
      );
    });
  const availableSeats = batchesWithCounts
    .filter((b) => b.status === "Active")
    .reduce((sum, b) => sum + Math.max(0, b.capacity - b.enrolled), 0);
  const totalEnrolled = batchesWithCounts.reduce(
    (sum, item) => sum + item.enrolled,
    0,
  );
  const editorSessionLabel =
    sessions.find((s) => s.id === form.academicSessionId)?.name ||
    "Session unavailable";
  const summary = [
    [
      "Total Batches",
      batchesWithCounts.length,
      "border-sky-200 bg-sky-50 text-sky-900",
      "programs",
    ],
    [
      "Active Batches",
      batchesWithCounts.filter((item) => item.status === "Active").length,
      "border-emerald-200 bg-emerald-50 text-emerald-900",
      "batches",
    ],
    [
      "Enrolled Students",
      totalEnrolled,
      "border-violet-200 bg-violet-50 text-violet-900",
      "enrolled",
    ],
    [
      "Available Seats",
      availableSeats,
      "border-amber-200 bg-amber-50 text-amber-900",
      "seats",
    ],
  ];

  const openEditor = (batch = null) => {
    setError("");
    const firstGrade = grades.find((g) => g.status === "Active");
    const firstBoard = boards.find(
      (item) =>
        item.status === "Active" && gradeSupportsBoard(firstGrade, item),
    );
    if (batch) {
      const grade =
        grades.find((item) => item.id === batch.gradeId) ||
        grades.find((item) => String(item.value) === String(batch.grade));
      const board =
        boards.find((item) => item.id === batch.boardId) ||
        boards.find((item) => item.code === batch.board);
      const matchingSubjects =
        grade && board
          ? subjects.filter(
              (subject) =>
                subjectMatchesGrade(subject, grade) &&
                subjectMatchesBoard(subject, board) &&
                (Number(grade.value) < 11 ||
                  !subject.streams?.length ||
                  subject.streams.includes(batch.stream)),
            )
          : [];
      const legacyNames = Array.isArray(batch.subjects) ? batch.subjects : [];
      const subjectIds = batch.subjectIds?.length
        ? batch.subjectIds
        : matchingSubjects
            .filter((subject) => legacyNames.includes(subject.name))
            .map((subject) => subject.id);
      setForm({
        ...emptyBatch,
        ...batch,
        gradeId: grade?.id || "",
        grade: String(grade?.value || batch.grade || ""),
        boardId: board?.id || "",
        board: board?.code || batch.board || "",
        subjectIds,
        subjects: legacyNames,
      });
    } else {
      setForm({
        ...emptyBatch,
        academicSessionId: activeSession?.id || "",
        gradeId: firstGrade?.id || "",
        grade: String(firstGrade?.value || ""),
        boardId: firstBoard?.id || "",
        board: firstBoard?.code || "",
      });
    }
    setEditingBatch(batch || { id: "" });
    setSelectedBatch(null);
  };

  const selectGrade = (gradeId) => {
    const grade = grades.find((item) => item.id === gradeId);
    const firstBoard = boards.find(
      (item) => item.status === "Active" && gradeSupportsBoard(grade, item),
    );
    setForm((current) => ({
      ...current,
      gradeId,
      grade: String(grade?.value || ""),
      boardId: firstBoard?.id || "",
      board: firstBoard?.code || "",
      stream: Number(grade?.value) >= 11 ? current.stream : "",
      subjectIds: [],
      subjects: [],
      tutorAssignments: [],
    }));
    setError("");
  };

  const selectBoard = (boardId) => {
    const board = boards.find((item) => item.id === boardId);
    setForm((current) => ({
      ...current,
      boardId,
      board: board?.code || "",
      subjectIds: [],
      subjects: [],
      tutorAssignments: [],
    }));
    setError("");
  };

  const toggleSubject = (subject, checked) => {
    setForm((current) => ({
      ...current,
      subjectIds: checked
        ? [...current.subjectIds, subject.id]
        : current.subjectIds.filter((item) => item !== subject.id),
      tutorAssignments: checked
        ? current.tutorAssignments
        : current.tutorAssignments.filter(
            (item) => item.subjectId !== subject.id,
          ),
    }));
    setError("");
  };

  const assignTutor = (subjectId, tutorId) => {
    setForm((current) => ({
      ...current,
      tutorAssignments: [
        ...current.tutorAssignments.filter(
          (item) => item.subjectId !== subjectId,
        ),
        ...(tutorId ? [{ subjectId, tutorId }] : []),
      ],
    }));
    setError("");
  };

  const saveBatch = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    if (!activeSession && !form.id) {
      setError("Activate an academic session before creating a batch.");
      return;
    }
    if (!form.name.trim()) {
      setError("Enter a batch name.");
      return;
    }
    if (!selectedGrade || !selectedBoard) {
      setError("Select a valid active grade and board.");
      return;
    }
    if (Number(form.grade) >= 11 && !form.stream) {
      setError("Select a stream for Grade 11 or 12.");
      return;
    }
    if (!form.subjectIds.length) {
      setError("Select at least one subject.");
      return;
    }
    const capacity = Number(form.capacity);
    const currentEnrollment = form.id ? enrollmentCount(form.id) : 0;
    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity < currentEnrollment
    ) {
      setError(
        `Capacity must be a whole number and cannot be below ${currentEnrollment}.`,
      );
      return;
    }
    const sessionId = form.id ? form.academicSessionId : activeSession.id;
    const duplicate = batches.some(
      (item) =>
        item.id !== form.id &&
        item.academicSessionId === sessionId &&
        item.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
    );
    if (duplicate) {
      setError("A batch with this name already exists in the active session.");
      return;
    }
    const selectedSubjects = availableSubjects.filter((subject) =>
      form.subjectIds.includes(subject.id),
    );
    if (selectedSubjects.length !== form.subjectIds.length) {
      setError(
        "One or more selected subjects are inactive or no longer applicable. Select the subjects again.",
      );
      return;
    }
    const tutorAssignments = selectedSubjects.map((subject) => ({
      subjectId: subject.id,
      tutorId:
        form.tutorAssignments.find((item) => item.subjectId === subject.id)
          ?.tutorId || "",
    }));
    if (tutorAssignments.some((item) => !item.tutorId)) {
      setError("Assign a default tutor to every selected subject.");
      return;
    }
    const record = {
      ...form,
      academicSessionId: sessionId,
      name: form.name.trim(),
      gradeId: selectedGrade.id,
      boardId: selectedBoard.id,
      stream: Number(selectedGrade.value) >= 11 ? form.stream : "",
      tutorAssignments,
      mode: form.mode,
      capacity,
      status: form.status,
    };
    busy.current = true;
    setSaving(true);
    try {
      if (form.id) await updateBatch(form.id, record);
      else await createBatch(record);
      await loadBatches();
      setEditingBatch(null);
      setSessionFilter(sessionId);
      setNotice("Batch saved successfully.");
      setError("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const updateStatus = async (batch, status) => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const updated = await updateBatch(batch.id, { ...batch, status });
      setBatches((current) =>
        current.map((b) => (b.id === updated.id ? updated : b)),
      );
      if (selectedBatch?.id === batch.id) setSelectedBatch(updated);
      setNotice("Batch status updated.");
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const BatchEditor = form.id ? EditBatch : NewBatch;

  return (
    <div className="admin-page board-page batch-page">
      <header className="tutor-page-heading">
        <span className="tutor-heading-icon">
          <AdminMetricIcon name="batches" />
        </span>
        <div>
          <h1>Batches</h1>
        </div>
        <label className="batch-session-label">
          Academic Session
          <select
            aria-label="Academic session"
            value={sessionFilter}
            onChange={(e) => {
              setSessionFilter(e.target.value);
              setPage(1);
            }}
          >
            {!sessions.length && (
              <option value="">No sessions available</option>
            )}
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      {error && !editingBatch && (
        <p role="alert" className="batch-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="batch-success">
          {notice}
        </p>
      )}
      <section
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Batch summary"
      >
        {summary.map(([label, value, style, icon]) => (
          <article
            key={label}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm ${style}`}
          >
            <span>
              <span className="block text-[10px] font-semibold opacity-75">
                {label}
              </span>
              <strong className="mt-0.5 block font-heading text-xl">
                {loading ? "…" : value}
              </strong>
            </span>
            <span className="tutor-heading-icon">
              <AdminMetricIcon name={icon} className="h-[18px] w-[18px]" />
            </span>
          </article>
        ))}
      </section>

      <section className="board-directory mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Batch Directory
            </h2>
           
          </div>
          <button
            type="button"
            disabled={!activeSession || !grades.length || !boards.length}
            onClick={() => openEditor()}
            className="min-h-11 rounded-xl bg-brand-gold px-5 text-xs font-bold text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Batch
          </button>
        </header>
        <BatchFilters
          search={search}
          setSearch={setSearch}
          gradeFilter={gradeFilter}
          setGradeFilter={setGradeFilter}
          boardFilter={boardFilter}
          setBoardFilter={setBoardFilter}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          boards={boards}
          grades={grades}
          subjects={subjects}
          modes={modeOptions}
          onClear={() => {
            setSearch("");
            setGradeFilter("all");
            setBoardFilter("all");
            setSubjectFilter("all");
            setModeFilter("all");
            setStatusFilter("all");
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "S.N.",
                  "Batch",
                  "Grade & Board",
                  "Subjects",
                  "Mode",
                  "Students",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-3 py-3 ${heading === "Actions" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-500">
                    Loading batches...
                  </td>
                </tr>
              ) : (
                pageItems.map((batch, index) => (
                  <tr key={batch.id} className="hover:bg-blue-50/50">
                    <td className="border border-slate-200 px-3 py-3 text-center text-slate-500">
                      {serial(index)}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <strong className="text-brand-navy">{batch.name}</strong>
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <strong>
                        Grade {batch.grade} · {batch.board}
                      </strong>
                      {batch.stream && (
                        <span className="block text-[10px] text-slate-400">
                          {batch.stream}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[260px] border border-slate-200 px-3 py-3 text-slate-600">
                      {batch.subjects?.slice(0, 2).join(", ") ||
                        "Not configured"}
                      {batch.subjects?.length > 2 && (
                        <button
                          className="tutor-more"
                          onClick={() => setSelectedBatch(batch)}
                        >
                          +{batch.subjects.length - 2}
                        </button>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      {batch.mode}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 font-semibold">
                      {batch.enrolled}/{batch.capacity}
                      {batch.enrolled >= batch.capacity && (
                        <span className="batch-full">Full</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBatch(batch)}
                          title="View batch"
                          aria-label={`View ${batch.name}`}
                          className="admin-action-native !border-sky-200 !bg-sky-50 !text-sky-700"
                        >
                          <AdminActionIcon name="view" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(batch)}
                          title="Edit batch"
                          aria-label={`Edit ${batch.name}`}
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          disabled={saving}
                          onClick={() =>
                            updateStatus(
                              batch,
                              batch.status === "Active" ? "Inactive" : "Active",
                            )
                          }
                          aria-label={`Change ${batch.name} status`}
                          className="admin-action-native !border-slate-200 !bg-slate-50 !text-slate-700"
                        >
                          <AdminActionIcon
                            name={
                              batch.status === "Active"
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
        {!loading && !filtered.length && (
          <div className="p-12 text-center text-sm text-slate-500">
            No batches found. Create the first batch after configuring session,
            board and grade.
          </div>
        )}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {selectedBatch && (
        <BatchDetails
          batch={selectedBatch}
          sessionName={
            sessions.find((s) => s.id === selectedBatch.academicSessionId)?.name
          }
          subjects={subjects}
          tutors={tutors}
          onClose={() => setSelectedBatch(null)}
          onEdit={() => openEditor(selectedBatch)}
        />
      )}

      {editingBatch && (
        <BatchEditor
          form={form}
          setForm={setForm}
          editorSessionLabel={editorSessionLabel}
          saveBatch={saveBatch}
          onClose={() => {
            if (!busy.current) setEditingBatch(null);
          }}
          grades={grades.filter(
            (g) => g.status === "Active" || g.id === form.gradeId,
          )}
          selectGrade={selectGrade}
          availableBoards={availableBoards}
          selectBoard={selectBoard}
          seniorGradeSelected={seniorGradeSelected}
          availableSubjects={availableSubjects}
          toggleSubject={toggleSubject}
          compatibleTutors={compatibleTutors}
          assignTutor={assignTutor}
          enrollmentCount={enrollmentCount}
          error={error}
          saving={saving}
        />
      )}
    </div>
  );
}

export default CoursesBatches;
