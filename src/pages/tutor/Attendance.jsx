import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  fetchTutorAttendance,
  saveTutorAttendance,
} from "../../services/tutorAttendanceApi";

const statuses = ["Present", "Absent", "Leave"];
const tone = {
  Present: "border-emerald-300 bg-emerald-100 text-emerald-700",
  Absent: "border-rose-300 bg-rose-100 text-rose-700",
  Leave: "border-violet-300 bg-violet-100 text-violet-700",
};
const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const emptyData = { schedules: [], students: [], records: [] };

function TutorAttendance() {
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [selectedClassId, setSelectedClassId] = useState("");
  const [draft, setDraft] = useState({});
  const [message, setMessage] = useState("");
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchTutorAttendance(selectedDate)
      .then((result) => {
        if (active) setData(result || emptyData);
      })
      .catch((requestError) => {
        if (active) {
          setData(emptyData);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);
  const sessions = useMemo(
    () =>
      [...data.schedules].sort((a, b) =>
        String(a.startTime).localeCompare(String(b.startTime)),
      ),
    [data.schedules],
  );
  const selectedSession =
    sessions.find((item) => item.classId === selectedClassId) || null;
  const roster = useMemo(
    () =>
      selectedSession
        ? data.students.filter(
            (student) => student.batchId === selectedSession.batchId,
          )
        : [],
    [data.students, selectedSession],
  );
  const savedStatus = (studentId) =>
    data.records.find(
      (item) =>
        item.studentId === studentId &&
        item.date === selectedDate &&
        item.batchId === selectedSession?.batchId &&
        item.classId === selectedClassId,
    )?.status || "Present";
  const statusFor = (studentId) => draft[studentId] || savedStatus(studentId);
  const save = async () => {
    if (!selectedSession?.markable || !roster.length) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await saveTutorAttendance(
        selectedDate,
        roster.map((student) => ({
          classId: selectedClassId,
          studentId: student.id,
          status: statusFor(student.id),
        })),
      );
      setData(result);
      setDraft({});
      setMessage(`Attendance saved for ${roster.length} students.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Tutor workspace
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
              Class Attendance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Select your completed/current class and update its enrolled
              students.
            </p>
          </div>
          <span className="w-fit rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
            {sessions.length} assigned classes
          </span>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            Attendance Date
            <DatePicker
              selected={new Date(`${selectedDate}T00:00:00`)}
              onChange={(date) => {
                if (date) {
                  setLoading(true);
                  setError("");
                  setSelectedDate(dateKey(date));
                  setSelectedClassId("");
                  setDraft({});
                  setMessage("");
                }
              }}
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              wrapperClassName="mt-2 w-full"
              className="h-11 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-brand-navy"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Assigned Class
            <select
              disabled={loading}
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setDraft({});
                setMessage("");
              }}
              className="mt-2 h-11 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-brand-navy"
            >
              <option value="">
                {loading ? "Loading classes..." : "Select class"}
              </option>
              {sessions.map((item) => (
                <option
                  key={item.classId}
                  value={item.classId}
                  disabled={!item.markable}
                >
                  {item.subject} · {item.startTime} ·{" "}
                  {item.batchName || item.batchId}
                  {!item.markable ? " (Upcoming)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}
        {!loading && !error && !sessions.length && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
            No class assigned to you on this date.
          </p>
        )}
      </section>
      {selectedSession && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-navy">
                {selectedSession.subject}{" "}
                <span className="font-normal text-slate-400">
                  ({selectedSession.topic || "Class session"})
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {selectedSession.batchName || selectedSession.batchId} ·{" "}
                {selectedSession.startTime}–{selectedSession.endTime}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setDraft(
                    Object.fromEntries(
                      roster.map((student) => [student.id, "Present"]),
                    ),
                  )
                }
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
              >
                Mark all present
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || !selectedSession.markable || !roster.length}
                className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </header>
          {message && (
            <p className="m-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
              {message}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="bg-[#102044] text-white">
                <tr>
                  {["Student", "Grade & Board", "Batch", "Attendance"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border border-blue-300/20 px-4 py-3"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {roster.map((student) => (
                  <tr key={student.id}>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">
                        {student.name}
                      </strong>
                      <span className="block text-[10px] text-slate-400">
                        {student.id}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      Grade {student.grade} · {student.board}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {selectedSession.batchName || selectedSession.batchId}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {statuses.map((status) => (
                          <button
                            disabled={saving}
                            key={status}
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                [student.id]: status,
                              }))
                            }
                            className={`rounded-lg border px-3 py-2 text-[10px] font-bold ${statusFor(student.id) === status ? tone[status] : "border-slate-200 bg-white text-slate-500"}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!roster.length && (
              <p className="p-10 text-center text-sm text-slate-500">
                No active students are enrolled in this batch.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default TutorAttendance;
