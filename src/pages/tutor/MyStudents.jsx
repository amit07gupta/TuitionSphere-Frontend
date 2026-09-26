import { useCallback, useEffect, useMemo, useState } from "react";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchTutorStudents } from "../../services/tutorStudentApi";
import "./my-students.css";

const emptyData = { students: [], assignedBatches: [], academicSession: null };
const selectClass =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-brand-navy outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";

function MyStudents() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadStudents = useCallback(() => {
    fetchTutorStudents()
      .then((result) => setData(result))
      .catch((requestError) =>
        setError(requestError.message || "Unable to load your students."),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const options = useMemo(
    () => ({
      grades: [
        ...new Map(
          data.students.map((item) => [
            item.gradeId,
            { id: item.gradeId, name: item.grade },
          ]),
        ).values(),
      ],
      boards: [
        ...new Map(
          data.students.map((item) => [
            item.boardId,
            { id: item.boardId, name: item.boardCode || item.board },
          ]),
        ).values(),
      ],
    }),
    [data.students],
  );
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.students.filter(
      (student) =>
        (!gradeFilter || student.gradeId === gradeFilter) &&
        (!boardFilter || student.boardId === boardFilter) &&
        (!batchFilter || student.batchId === batchFilter) &&
        (!statusFilter || student.status === statusFilter) &&
        (!query ||
          [
            student.name,
            student.studentCode,
            student.email,
            student.phone,
            student.batchName,
            student.grade,
            student.board,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          )),
    );
  }, [
    batchFilter,
    boardFilter,
    data.students,
    gradeFilter,
    search,
    statusFilter,
  ]);

  return (
    <div className="my-students-page space-y-5">
      <section className="my-students-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-100/70 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">
              Teaching workspace
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
              My Students
            </h1>

          </div>
          <div className="assigned-students-card flex w-fit items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <span className="assigned-students-icon flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
              <PortalIcon name="profile" className="h-5 w-5" />
            </span>
            <div>
              <p className="assigned-students-label text-[10px] font-bold uppercase text-cyan-700">
                Assigned students
              </p>
              <strong className="assigned-students-count text-xl text-brand-navy">
                {data.students.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="relative">
            <span className="sr-only">Search students</span>
            <PortalIcon
              name="search"
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, ID or contact"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-xs text-brand-navy outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label>
            <span className="sr-only">Grade</span>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className={selectClass}
            >
              <option value="">Grade</option>
              {options.grades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Board</span>
            <select
              value={boardFilter}
              onChange={(event) => setBoardFilter(event.target.value)}
              className={selectClass}
            >
              <option value="">Board</option>
              {options.boards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Assigned batch</span>
            <select
              value={batchFilter}
              onChange={(event) => setBatchFilter(event.target.value)}
              className={selectClass}
            >
              <option value="">Batch</option>
              {data.assignedBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </div>
        {error && (
          <div className="m-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                loadStudents();
              }}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "S.N.",
                  "Student",
                  "Grade & Board",
                  "Assigned Batch",
                  "My Subjects",
                  "Parent / Guardian",
                  "Contact",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border border-blue-300/20 px-4 py-3"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                visibleStudents.map((student, index) => (
                  <tr key={student.admissionId} className="hover:bg-cyan-50/50">
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">
                        {student.name}
                      </strong>
                      <span className="block text-[10px] text-slate-400">
                        {student.studentCode}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {student.grade} · {student.boardCode || student.board}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong>{student.batchName}</strong>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {student.tutorSubjects
                        .map((subject) => subject.name)
                        .join(", ") || "—"}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {student.parentName || "—"}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span className="block">{student.email || "—"}</span>
                      <span className="block text-[10px] text-slate-400">
                        {student.phone || "—"}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${student.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              {loading && (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-500">
                    Loading assigned students…
                  </td>
                </tr>
              )}
              {!loading && !visibleStudents.length && (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-500">
                    No students found in your assigned batches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {loading && (
            <p className="py-10 text-center text-xs text-slate-500">
              Loading assigned students…
            </p>
          )}
          {!loading &&
            visibleStudents.map((student) => (
              <article
                key={student.admissionId}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-base font-bold text-brand-navy">
                      {student.name}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      {student.studentCode}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-bold text-cyan-800">
                    {student.grade}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-bold uppercase text-[9px] text-slate-400">
                      Board & Batch
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {student.boardCode || student.board} · {student.batchName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase text-[9px] text-slate-400">
                      My Subjects
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {student.tutorSubjects
                        .map((subject) => subject.name)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase text-[9px] text-slate-400">
                      Parent / Guardian
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {student.parentName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase text-[9px] text-slate-400">
                      Contact
                    </dt>
                    <dd className="mt-1 break-all text-slate-700">
                      {student.email || student.phone || "—"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          {!loading && !visibleStudents.length && (
            <p className="py-10 text-center text-xs text-slate-500">
              No students found in your assigned batches.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyStudents;
