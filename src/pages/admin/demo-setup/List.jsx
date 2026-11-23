import NewDemoSetup from "./NewDemoSetup";
import EditDemoSetup from "./EditDemoSetup";
import DemoSetupDetails from "./DemoSetupDetails";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import "../board/board.css";
import "../tutor/tutor.css";
import "./demo-setup.css";
import { useEffect, useRef, useState } from "react";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import AdminPagination from "../../../components/admin/AdminPagination";
import useTablePagination from "../../../hooks/useTablePagination";
import { fetchAcademicSessions } from "../../../services/academicSessionApi";
import { fetchBoards } from "../../../services/boardApi";
import {
  createDemoSetup,
  fetchDemoSetups,
  updateDemoSetup,
} from "../../../services/demoSetupApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchTutors } from "../../../services/tutorApi";
import DemoSetupFilters from "./DemoSetupFilters";

const initialForm = {
  id: "",
  name: "",
  tutorId: "",
  gradeId: "",
  boardIds: [],
  stream: "",
  mode: "Offline",
  demoStartDate: "",
  demoEndDate: "",
  availableDays: [],
  timeSlots: [{ id: "SLOT-1", startTime: "", endTime: "", capacity: 10 }],
  status: "Active",
};

const displayDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

function DemoSetup() {
  const [sessions, setSessions] = useState([]),
    [sessionFilter, setSessionFilter] = useState("");
  const [search, setSearch] = useState(""),
    [modeFilter, setModeFilter] = useState("");
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [notice, setNotice] = useState(""),
    [viewing, setViewing] = useState(null);
  const busy = useRef(false);
  const [setups, setSetups] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const seniorSelected =
    Number(grades.find((grade) => grade.id === form.gradeId)?.value) >= 11;

  const loadSetups = async () => setSetups(await fetchDemoSetups());
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchAcademicSessions(),
      fetchGrades(),
      fetchBoards(),
      fetchTutors(),
      fetchDemoSetups(),
    ])
      .then(([sessions, gradeItems, boardItems, tutorItems, setupItems]) => {
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
        setGrades(gradeItems);
        setBoards(boardItems);
        setTutors(tutorItems);
        setSetups(setupItems);
        setError("");
      })
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

  const update = (name, value) =>
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (["gradeId", "boardIds", "stream", "mode"].includes(name))
        next.tutorId = "";
      if (name === "gradeId") {
        next.boardIds = [];
        next.stream = "";
      }
      return next;
    });
  const eligibleBoards = boards.filter(
    (b) =>
      (b.status === "Active" || form.boardIds.includes(b.id)) &&
      grades.find((g) => g.id === form.gradeId)?.boardIds.includes(b.id),
  );
  const eligibleTutors = tutors.filter(
    (t) =>
      t.status === "Active" &&
      t.gradeIds.includes(form.gradeId) &&
      form.boardIds.length &&
      form.boardIds.every((id) => t.boardIds.includes(id)) &&
      (!t.mode.length || t.mode.includes(form.mode)) &&
      (!seniorSelected ||
        (form.stream &&
          (!t.streams.length || t.streams.includes(form.stream)))),
  );
  const toggle = (name, value) =>
    update(
      name,
      form[name].includes(value)
        ? form[name].filter((item) => item !== value)
        : [...form[name], value],
    );
  const openAdd = () => {
    setForm({ ...initialForm, academicSessionId: activeSession?.id || "" });
    setError("");
    setOpen(true);
  };
  const openEdit = (setup) => {
    setForm({
      ...initialForm,
      ...setup,
      gradeId: setup.gradeId || setup.gradeIds?.[0] || "",
      stream: setup.stream || setup.streams?.[0] || "",
      demoStartDate: setup.demoStartDate || setup.bookingStartDate || "",
      demoEndDate: setup.demoEndDate || setup.bookingEndDate || "",
      timeSlots: setup.timeSlots?.length
        ? setup.timeSlots
        : [
            {
              id: "SLOT-1",
              startTime: setup.startTime || "",
              endTime: setup.endTime || "",
              capacity: setup.capacity || 10,
            },
          ],
    });
    setError("");
    setOpen(true);
  };

  const updateSlot = (id, name, value) =>
    setForm((current) => ({
      ...current,
      timeSlots: current.timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [name]: value } : slot,
      ),
    }));
  const addSlot = () => {
    const nextNumber =
      form.timeSlots.reduce(
        (highest, slot) =>
          Math.max(highest, Number(String(slot.id).replace("SLOT-", "")) || 0),
        0,
      ) + 1;
    update("timeSlots", [
      ...form.timeSlots,
      { id: `SLOT-${nextNumber}`, startTime: "", endTime: "", capacity: 10 },
    ]);
  };
  const removeSlot = (id) =>
    form.timeSlots.length > 1 &&
    update(
      "timeSlots",
      form.timeSlots.filter((slot) => slot.id !== id),
    );

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    if (
      !form.name.trim() ||
      !form.tutorId ||
      !form.gradeId ||
      !form.boardIds.length ||
      !form.demoStartDate ||
      !form.demoEndDate ||
      !form.availableDays.length ||
      !form.timeSlots.length
    )
      return setError(
        "Complete all required fields and select at least one demo day.",
      );
    if (form.demoEndDate < form.demoStartDate)
      return setError("Demo end date must be after the start date.");
    if (
      form.timeSlots.some(
        (slot) => !slot.startTime || !slot.endTime || Number(slot.capacity) < 1,
      )
    )
      return setError("Complete time and capacity for every slot.");
    if (form.timeSlots.some((slot) => slot.endTime <= slot.startTime))
      return setError("Every slot end time must be after its start time.");
    if (
      form.timeSlots.some((slot, index) =>
        form.timeSlots.some(
          (other, otherIndex) =>
            index !== otherIndex &&
            slot.startTime < other.endTime &&
            other.startTime < slot.endTime,
        ),
      )
    )
      return setError("Time slots for the same tutor cannot overlap.");
    if (seniorSelected && !form.stream)
      return setError("Select a stream for Grade 11 or 12.");
    const tutor = tutors.find((item) => item.id === form.tutorId);
    const saved = {
      ...form,
      academicSessionId: form.academicSessionId || activeSession?.id || "",
      name: form.name.trim(),
      tutorId: form.tutorId,
      tutorName: tutor?.name || "",
      gradeId: form.gradeId,
      boardIds: form.boardIds,
      stream: seniorSelected ? form.stream : "",
      mode: form.mode,
      demoStartDate: form.demoStartDate,
      demoEndDate: form.demoEndDate,
      availableDays: form.availableDays,
      timeSlots: form.timeSlots.map((slot) => ({
        ...slot,
        capacity: Math.max(1, Number(slot.capacity)),
      })),
      status: form.status,
    };
    if (!saved.academicSessionId)
      return setError(
        "Activate an academic session before creating a demo setup.",
      );
    busy.current = true;
    setSaving(true);
    try {
      if (form.id) await updateDemoSetup(form.id, saved);
      else await createDemoSetup(saved);
      await loadSetups();
      setOpen(false);
      setSessionFilter(saved.academicSessionId);
      setNotice("Demo setup saved successfully.");
      setError("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const toggleStatus = async (id) => {
    const setup = setups.find((item) => item.id === id);
    if (!setup || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await updateDemoSetup(id, {
        ...setup,
        status: setup.status === "Active" ? "Inactive" : "Active",
      });
      await loadSetups();
      setNotice("Demo setup status updated.");
      setError("");
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const names = (ids, records, field) =>
    ids
      .map((id) => records.find((item) => item.id === id)?.[field])
      .filter(Boolean)
      .join(", ");
  const filteredSetups = (() => {
    const gradeNumber = (setup) => {
      const gradeId = setup.gradeId || setup.gradeIds?.[0] || "";
      const grade = grades.find((item) => item.id === gradeId);
      const value = Number(grade?.value);
      if (Number.isFinite(value)) return value;
      return (
        Number(String(grade?.name || setup.name || "").match(/\d+/)?.[0]) ||
        Number.MAX_SAFE_INTEGER
      );
    };

    return setups
      .filter((setup) => {
        const setupGradeId = setup.gradeId || setup.gradeIds?.[0] || "";
        return (
          setup.academicSessionId === sessionFilter &&
          setup.name.toLowerCase().includes(search.trim().toLowerCase()) &&
          (!modeFilter || setup.mode === modeFilter) &&
          (!gradeFilter || setupGradeId === gradeFilter) &&
          (!boardFilter || setup.boardIds?.includes(boardFilter)) &&
          (!tutorFilter || setup.tutorId === tutorFilter) &&
          (!statusFilter || setup.status === statusFilter)
        );
      })
      .sort(
        (first, second) =>
          gradeNumber(first) - gradeNumber(second) ||
          String(first.name || "").localeCompare(
            String(second.name || ""),
            undefined,
            { numeric: true },
          ),
      );
  })();
  const sessionSetups = setups.filter(
    (s) => s.academicSessionId === sessionFilter,
  );
  const totalSlots = sessionSetups.reduce(
    (total, setup) => total + (setup.timeSlots?.length || 0),
    0,
  );
  const { page, pageSize, pageItems, setPage, serialNumber } =
    useTablePagination(filteredSetups);

  const Editor = form.id ? EditDemoSetup : NewDemoSetup;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return (
    <div className="admin-page board-page demo-page">
      <header className="tutor-page-heading">
        <span className="tutor-heading-icon">
          <AdminMetricIcon name="schedule" />
        </span>
        <div>
          <h1>Demo Setup</h1>
        </div>
        <label className="demo-session-label">
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
      {error && !open && (
        <p role="alert" className="demo-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="demo-success">
          {notice}
        </p>
      )}
      <section className="demo-metrics">
        {[
          ["Total Setups", sessionSetups.length, "total"],
          [
            "Active Setups",
            sessionSetups.filter((s) => s.status === "Active").length,
            "resolved",
          ],
          [
            "Inactive Setups",
            sessionSetups.filter((s) => s.status === "Inactive").length,
            "inactive",
          ],
          ["Configured Time Slots", totalSlots, "schedule"],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <div>
              <small>{label}</small>
              <strong>{loading ? "…" : value}</strong>
            </div>
            <span className="tutor-heading-icon">
              <AdminMetricIcon name={icon} />
            </span>
          </article>
        ))}
      </section>
      <section className="board-directory mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Demo Setup Directory
            </h2>
          </div>
          <button
            type="button"
            disabled={!activeSession || saving}
            onClick={openAdd}
            className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-bold text-white"
          >
            + Add Demo Setup
          </button>
        </div>
        <DemoSetupFilters
          grades={grades}
          boards={boards}
          tutors={tutors}
          values={{
            search,
            grade: gradeFilter,
            board: boardFilter,
            tutor: tutorFilter,
            mode: modeFilter,
            status: statusFilter,
          }}
          onChange={(name, value) => {
            ({
              search: setSearch,
              grade: setGradeFilter,
              board: setBoardFilter,
              tutor: setTutorFilter,
              mode: setModeFilter,
              status: setStatusFilter,
            })[name](value);
            if (name === "grade") {
              setBoardFilter("");
              setTutorFilter("");
            }
            if (name === "board" || name === "mode") setTutorFilter("");
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setGradeFilter("");
            setBoardFilter("");
            setTutorFilter("");
            setModeFilter("");
            setStatusFilter("");
            setPage(1);
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "S.N.",
                  "Setup",
                  "Grade & Board",
                  "Tutor",
                  "Mode",
                  "Schedule",
                  "Slots",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-3 py-3 ${["S.N.", "Status", "Actions"].includes(heading) ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="p-10 text-center">
                    Loading demo setups…
                  </td>
                </tr>
              )}
              {pageItems.map((setup, index) => {
                const slots = setup.timeSlots?.length
                  ? setup.timeSlots
                  : [
                      {
                        startTime: setup.startTime,
                        endTime: setup.endTime,
                        capacity: setup.capacity,
                      },
                    ];
                const setupGrade = grades.find(
                  (item) => item.id === (setup.gradeId || setup.gradeIds?.[0]),
                );
                return (
                  <tr key={setup.id} className="hover:bg-blue-50/50">
                    <td className="border border-slate-200 px-3 py-3 text-center text-slate-500">
                      {serialNumber(index)}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <strong className="text-brand-navy">{setup.name}</strong>
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <strong>
                        {setupGrade?.name || "Not available"} ·{" "}
                        {names(setup.boardIds || [], boards, "code") ||
                          "No board"}
                      </strong>
                      {(setup.stream || setup.streams?.[0]) && (
                        <span className="block text-[10px] text-slate-400">
                          {setup.stream || setup.streams?.[0]}
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <strong>
                        {setup.tutorName ||
                          tutors.find((item) => item.id === setup.tutorId)
                            ?.name ||
                          "Not assigned"}
                      </strong>
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      {setup.mode}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      {setup.availableDays
                        ?.map((day) => day.slice(0, 3))
                        .join(", ") || "Not selected"}
                      <small className="block text-slate-500">
                        {displayDate(setup.demoStartDate)} –{" "}
                        {displayDate(setup.demoEndDate)}
                      </small>
                      {setup.demoEndDate < today && (
                        <span className="demo-ended">Ended</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <button
                        className="tutor-more"
                        onClick={() => setViewing(setup)}
                      >
                        {slots.length} slots
                      </button>
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${setup.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {setup.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          className="admin-action-native !border-slate-200 !bg-slate-50 !text-slate-700"
                          aria-label={`View ${setup.name}`}
                          onClick={() => setViewing(setup)}
                        >
                          <AdminActionIcon name="view" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(setup)}
                          aria-label={`Edit ${setup.name}`}
                          title="Edit demo setup"
                          className="admin-action-native !border-indigo-200 !bg-indigo-50 !text-indigo-700"
                        >
                          <AdminActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => toggleStatus(setup.id)}
                          aria-label={`${setup.status === "Active" ? "Deactivate" : "Activate"} ${setup.name}`}
                          title={`${setup.status === "Active" ? "Deactivate" : "Activate"} demo setup`}
                          className={`admin-action-native ${setup.status === "Active" ? "!border-rose-200 !bg-rose-50 !text-rose-700" : "!border-emerald-200 !bg-emerald-50 !text-emerald-700"}`}
                        >
                          <AdminActionIcon
                            name={
                              setup.status === "Active"
                                ? "deactivate"
                                : "activate"
                            }
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && !pageItems.length && (
          <div className="p-10 text-center text-sm text-slate-500">
            {setups.length
              ? "No demo setup matches the selected filters."
              : "No demo setup configured yet."}
          </div>
        )}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={filteredSetups.length}
          onPageChange={setPage}
        />
      </section>

      {open && (
        <Editor
          form={form}
          sessionName={
            sessions.find(
              (s) => s.id === (form.academicSessionId || activeSession?.id),
            )?.name || "No active session"
          }
          grades={grades.filter(
            (g) => g.status === "Active" || g.id === form.gradeId,
          )}
          eligibleBoards={eligibleBoards}
          eligibleTutors={eligibleTutors}
          seniorSelected={seniorSelected}
          update={update}
          toggle={toggle}
          submit={submit}
          updateSlot={updateSlot}
          removeSlot={removeSlot}
          addSlot={addSlot}
          error={error}
          saving={saving}
          onClose={() => {
            if (!busy.current) setOpen(false);
          }}
        />
      )}
      {viewing && (
        <DemoSetupDetails
          setup={viewing}
          sessionName={
            sessions.find((s) => s.id === viewing.academicSessionId)?.name
          }
          gradeName={grades.find((g) => g.id === viewing.gradeId)?.name}
          boardNames={names(viewing.boardIds, boards, "code")}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setViewing(null);
            openEdit(viewing);
          }}
        />
      )}
    </div>
  );
}

export default DemoSetup;
