import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import AdminPagination from "../../../components/admin/AdminPagination";
import { fetchBoards } from "../../../services/boardApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchStudents, updateStudent } from "../../../services/studentApi";
import StudentFilters from "./StudentFilters";
import "../board/board.css";
import "./student-list.css";

const summaryCards = [
  {
    label: "Total Students",
    status: "all",
    icon: "students",
    tone: "student-metric-indigo",
  },
  {
    label: "Active",
    status: "Active",
    icon: "resolved",
    tone: "student-metric-emerald",
  },
  {
    label: "Incomplete Profiles",
    status: "Incomplete",
    icon: "pending",
    tone: "student-metric-amber",
  },
  {
    label: "Inactive",
    status: "Inactive",
    icon: "inactive",
    tone: "student-metric-rose",
  },
];

const statusOptions = [
  { label: "Status", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Incomplete Profile", value: "Incomplete" },
  { label: "Inactive", value: "Inactive" },
  { label: "Blocked", value: "Blocked" },
];

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-100 text-amber-700 ring-amber-200",
  Inactive: "bg-rose-100 text-rose-700 ring-rose-200",
  Blocked: "bg-rose-100 text-rose-700 ring-rose-200",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : dateFormatter.format(date);
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function Students() {
  const [boards, setBoards] = useState([]);
  const [grades, setGrades] = useState([]);
  const boardOptions = [
    { label: "Board", value: "all" },
    ...boards
      .filter((board) => board.status === "Active")
      .map((board) => ({
        label: board.code,
        value: board.code,
      })),
  ];
  const gradeOptions = [
    { label: "Grade", value: "all" },
    ...grades
      .filter((grade) => grade.status === "Active")
      .map((grade) => ({
        label: grade.name,
        value: String(grade.value),
      })),
  ];
  const navigate = useNavigate();
  const pageSize = 5;
  const [students, setStudents] = useState([]);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBoard, setSelectedBoard] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(1);
  const modalRef = useAccessibleModal(Boolean(selectedStudent), () =>
    setSelectedStudent(null),
  );

  useEffect(() => {
    let active = true;
    Promise.all([fetchStudents(), fetchBoards(), fetchGrades()])
      .then(([records, boardRecords, gradeRecords]) => {
        if (active) {
          setStudents(records);
          setBoards(boardRecords);
          setGrades(gradeRecords);
          setPageError("");
        }
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

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const values = [
        student.id,
        student.name,
        student.parentName,
        student.phone,
        student.email,
        student.batch,
      ];
      return (
        (!search ||
          values.some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(search),
          )) &&
        (selectedStatus === "all" ||
          (selectedStatus === "Incomplete"
            ? student.profileStatus === "Incomplete"
            : student.status === selectedStatus)) &&
        (selectedBoard === "all" || student.board === selectedBoard) &&
        (selectedGrade === "all" || student.grade === selectedGrade)
      );
    });
  }, [students, searchTerm, selectedStatus, selectedBoard, selectedGrade]);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredStudents.length / pageSize)),
  );
  const visibleStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const countStatus = (status) =>
    status === "all"
      ? students.length
      : students.filter((student) =>
          status === "Incomplete"
            ? student.profileStatus === "Incomplete"
            : student.status === status,
        ).length;
  const filtersActive =
    searchTerm ||
    selectedStatus !== "all" ||
    selectedBoard !== "all" ||
    selectedGrade !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedBoard("all");
    setSelectedGrade("all");
  };
  const updateStatus = async (studentId, status) => {
    try {
      const updated = await updateStudent(studentId, {
        status: status.toUpperCase(),
      });
      setStudents((current) =>
        current.map((student) =>
          student.id === studentId ? updated : student,
        ),
      );
      setSelectedStudent((current) =>
        current?.id === studentId ? updated : current,
      );
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    }
  };

  return (
    <div className="admin-page board-page student-directory-page">
      <header className="board-page-header">
        <div className="board-page-title">
          <span className="board-page-icon">
            <AdminMetricIcon name="students" className="h-5 w-5" />
          </span>
          <div>
            <p>Academic Records / Students</p>
            <h1>Students</h1>
          </div>
        </div>
        <div className="board-header-actions">
          <span className="board-active-label">
            <i /> {students.length} student records
          </span>
        </div>
      </header>
      {pageError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {pageError}
        </p>
      )}

      <section
        className="board-metrics mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Student summary"
      >
        {summaryCards.map((card) => (
          <button
            type="button"
            key={card.status}
            onClick={() => setSelectedStatus(card.status)}
            className={`board-metric ${card.tone.replace("student-metric", "board-metric")} ${selectedStatus === card.status ? "is-selected" : ""}`}
          >
            <span>
              <small>{card.label}</small>
              <strong>{countStatus(card.status)}</strong>
            </span>
            <i>
              <AdminMetricIcon name={card.icon} className="h-[18px] w-[18px]" />
            </i>
          </button>
        ))}
      </section>

      <section className="board-directory student-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="board-directory-heading">
          <div>
            <h2>Student Directory</h2>
            <p>Search and manage enrolled student records.</p>
          </div>
          <strong>{filteredStudents.length} results</strong>
        </div>
        <StudentFilters
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(value) => {
            setSelectedStatus(value);
            setPage(1);
          }}
          selectedGrade={selectedGrade}
          onGradeChange={(value) => {
            setSelectedGrade(value);
            setPage(1);
          }}
          selectedBoard={selectedBoard}
          onBoardChange={(value) => {
            setSelectedBoard(value);
            setPage(1);
          }}
         
          statusOptions={statusOptions}
          gradeOptions={gradeOptions}
          boardOptions={boardOptions}
          filtersActive={filtersActive}
          onClear={clearFilters}
        />
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            Loading students…
          </div>
        ) : filteredStudents.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] text-left text-xs">
                <thead className="bg-[#102044] text-white">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Academic</th>
                    <th className="px-5 py-3">Batch</th>
                    <th className="px-5 py-3">Parent Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="student-identity px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                            {initials(student.name)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-brand-navy">
                              {student.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Joined {formatDate(student.joinedOn)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-700">
                          Grade {student.grade} · {student.board}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {student.program || "Program not assigned"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-600">
                          {student.batch || "Batch not assigned"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {student.learningMode || "Mode not assigned"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-600">
                          {student.parentName || "Not provided"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {student.phone ? `+91 ${student.phone}` : "No phone"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={student.status} />
                          <span
                            className={`student-profile-status ${student.profileStatus === "Complete" ? "is-complete" : ""}`}
                          >
                            {student.profileStatus === "Complete"
                              ? "Profile complete"
                              : "Profile incomplete"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="student-row-actions">
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            aria-label={`Preview ${student.name}`}
                            title="Quick preview"
                            className="admin-action-native"
                          >
                            <AdminActionIcon name="view" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/students/${student.id}/edit`)
                            }
                            aria-label={`Edit ${student.name}`}
                            title="Edit student"
                            className="admin-action-native"
                          >
                            <AdminActionIcon name="edit" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 lg:hidden">
              {visibleStudents.map((student) => (
                <article key={student.id} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                      {initials(student.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-semibold text-brand-navy">
                            {student.name}
                          </h2>
                        </div>
                        <StatusBadge status={student.status} />
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        <p>
                          <strong className="text-slate-700">Academic:</strong>{" "}
                          Grade {student.grade}, {student.board}
                        </p>
                        <p>
                          <strong className="text-slate-700">Batch:</strong>{" "}
                          {student.batch}
                        </p>
                        <p>
                          <strong className="text-slate-700">Parent:</strong>{" "}
                          {student.parentName}
                        </p>
                        <p>
                          <strong className="text-slate-700">Phone:</strong> +91{" "}
                          {student.phone}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy hover:border-brand-gold hover:bg-amber-50"
                      >
                        View profile
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              ⌕
            </div>
            <h2 className="mt-4 font-heading text-lg font-semibold text-brand-navy">
              No students found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the selected filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}
        <AdminPagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={filteredStudents.length}
          onPageChange={setPage}
        />
      </section>

      {selectedStudent &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setSelectedStudent(null);
            }}
          >
            <section
              ref={modalRef}
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-profile-title"
              className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-3xl sm:rounded-3xl"
            >
              <header className="z-10 flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold-dark">
                    {selectedStudent.id}
                  </p>
                  <h2
                    id="student-profile-title"
                    className="mt-1 font-heading text-xl font-bold text-brand-navy"
                  >
                    Student Profile
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close student profile"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  ✕
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-4 sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold sm:h-14 sm:w-14 sm:text-base">
                    {initials(selectedStudent.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-words font-heading text-lg font-semibold text-brand-navy sm:text-xl">
                      {selectedStudent.name}
                    </h3>
                    <p className="mt-1 break-words text-xs text-slate-500">
                      Grade {selectedStudent.grade} · {selectedStudent.board} ·{" "}
                      {selectedStudent.program || "Program not assigned"}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Date of Birth", formatDate(selectedStudent.dateOfBirth)],
                    ["Gender", selectedStudent.gender || "Not provided"],
                    [
                      "Learning Mode",
                      selectedStudent.learningMode || "Not assigned",
                    ],
                    ["Batch", selectedStudent.batch || "Not assigned"],
                    [
                      "Subjects",
                      selectedStudent.subjects?.join(", ") || "Not assigned",
                    ],
                    ["Joined On", formatDate(selectedStudent.joinedOn)],
                    [
                      "Parent Name",
                      selectedStudent.parentName || "Not provided",
                    ],
                    [
                      "Parent Phone",
                      selectedStudent.phone
                        ? `+91 ${selectedStudent.phone}`
                        : "Not provided",
                    ],
                    [
                      "Alternate Contact Number",
                      selectedStudent.alternateContactNumber
                        ? `+91 ${selectedStudent.alternateContactNumber}`
                        : "Not provided",
                    ],
                    ["Parent Email", selectedStudent.email || "Not provided"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-slate-700">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      navigate(`/admin/students/${selectedStudent.id}`);
                    }}
                    className="min-h-11 rounded-xl bg-brand-navy px-4 py-3 text-xs font-bold text-white"
                  >
                    Open 360° profile
                  </button>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <label
                      htmlFor="student-status"
                      className="text-xs font-bold text-brand-navy"
                    >
                      Update account status
                    </label>
                    <select
                      id="student-status"
                      value={selectedStudent.status}
                      onChange={(event) =>
                        updateStatus(selectedStudent.id, event.target.value)
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-gold"
                    >
                      {statusOptions
                        .filter((option) =>
                          ["Active", "Inactive", "Blocked"].includes(
                            option.value,
                          ),
                        )
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Students;
