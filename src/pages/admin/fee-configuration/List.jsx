import { useEffect, useMemo, useRef, useState } from "react";
import NewFeePlan from "./NewFeePlan";
import EditFeePlan from "./EditFeePlan";
import FeePlanDetails from "./FeePlanDetails";
import AdminMetricIcon from "../../../components/admin/AdminMetricIcon";
import AdminActionIcon from "../../../components/admin/AdminActionIcon";
import "../board/board.css";
import "../tutor/tutor.css";
import "./fee-configuration.css";
import AdminPagination from "../../../components/admin/AdminPagination";
import { fetchAcademicSessions } from "../../../services/academicSessionApi";
import { fetchGrades } from "../../../services/gradeApi";
import {
  createFeePlan,
  fetchFeePlans,
  updateFeePlan,
} from "../../../services/feePlanApi";
import FeePlanFilters from "./FeePlanFilters";

const emptyForm = {
  name: "",
  academicSessionId: "",
  gradeId: "",
  grade: "",
  admissionFee: "",
  tuitionFee: "",
  billingFrequency: "Monthly",
  installments: "12",
  dueDay: "5",
  lateFee: "0",
  gracePeriodDays: "3",
  effectiveFrom: "",
  effectiveTo: "",
  status: "Draft",
};
const statusTone = {
  Active: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Archived: "bg-slate-200 text-slate-600",
};
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const getPlanGradeValue = (plan) => {
  const storedValue = Number(plan.grade);
  if (Number.isFinite(storedValue)) return storedValue;

  const matchedValue = Number(String(plan.name || "").match(/\d+/)?.[0]);
  return Number.isFinite(matchedValue) ? matchedValue : Number.MAX_SAFE_INTEGER;
};

function FeePlanActionIcon({ name }) {
  const icons = {
    edit: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
    archive: (
      <>
        <path d="M4 7h16v13H4Z" />
        <path d="M3 4h18v3H3Z" />
        <path d="M9 11h6" />
      </>
    ),
    restore: (
      <>
        <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.67" />
        <path d="M4 4v4.67h4.67" />
      </>
    ),
  };
  const strokes = { edit: "#4338ca", archive: "#b45309", restore: "#047857" };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke={strokes[name]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

function FeeConfiguration() {
  const [search, setSearch] = useState(""),
    [gradeFilter, setGradeFilter] = useState("all"),
    [billingFilter, setBillingFilter] = useState("all");
  const [viewing, setViewing] = useState(null),
    [saving, setSaving] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState("");
  const busy = useRef(false);
  const pageSize = 10;
  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [grades, setGrades] = useState([]);
  const [sessionFilter, setSessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const loadPlans = async () => setPlans(await fetchFeePlans());
  useEffect(() => {
    let mounted = true;
    Promise.all([fetchAcademicSessions(), fetchGrades(), fetchFeePlans()])
      .then(([sessionItems, gradeItems, planItems]) => {
        if (!mounted) return;
        const active =
          sessionItems.find((item) => item.status === "Active") || null;
        setSessions(sessionItems);
        setActiveSession(active);
        setGrades(gradeItems);
        setPlans(planItems);
        setSessionFilter(active?.id || sessionItems[0]?.id || "");
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
  const sessionPlans = plans.filter(
    (p) => p.academicSessionId === sessionFilter,
  );
  const visible = useMemo(
    () =>
      plans
        .filter(
          (item) =>
            item.academicSessionId === sessionFilter &&
            (statusFilter === "all" || item.status === statusFilter) &&
            (gradeFilter === "all" || item.gradeId === gradeFilter) &&
            (billingFilter === "all" ||
              item.billingFrequency === billingFilter) &&
            item.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .sort(
          (first, second) =>
            getPlanGradeValue(first) - getPlanGradeValue(second) ||
            String(first.name || "").localeCompare(
              String(second.name || ""),
              undefined,
              { numeric: true },
            ),
        ),
    [plans, sessionFilter, statusFilter, gradeFilter, billingFilter, search],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(visible.length / pageSize)),
  );
  const visiblePlans = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      academicSessionId: activeSession?.id ?? "",
      effectiveFrom: activeSession?.startDate ?? "",
      effectiveTo: activeSession?.endDate ?? "",
    });
    setError("");
    setOpen(true);
  };
  const openEdit = (item) => {
    const grade =
      grades.find((record) => record.id === item.gradeId) ||
      grades.find((record) => String(record.value) === String(item.grade));
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
          key,
          typeof value === "number" ? String(value) : value,
        ]),
      ),
      gradeId: grade?.id || "",
      grade: String(grade?.value || item.grade || ""),
    });
    setError("");
    setOpen(true);
  };
  const update = (name, value) =>
    setForm((current) => {
      if (name === "gradeId") {
        const grade = grades.find((item) => item.id === value);
        return {
          ...current,
          gradeId: value,
          grade: String(grade?.value || ""),
          name: grade ? `${grade.name} ${current.billingFrequency} Fee` : "",
        };
      }
      if (name === "billingFrequency") {
        const installments =
          value === "Monthly" ? "12" : value === "Quarterly" ? "4" : "1";
        const grade = grades.find((item) => item.id === current.gradeId);
        return {
          ...current,
          billingFrequency: value,
          installments,
          name: grade ? `${grade.name} ${value} Fee` : current.name,
        };
      }
      return { ...current, [name]: value };
    });
  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    if (
      !form.academicSessionId ||
      !form.gradeId ||
      !form.grade ||
      !form.effectiveFrom ||
      !form.effectiveTo
    )
      return setError("Select an academic session, grade and effective dates.");
    if (form.effectiveTo < form.effectiveFrom)
      return setError("Effective end date must be after the start date.");
    if (
      Number(form.admissionFee) < 0 ||
      Number(form.tuitionFee) <= 0 ||
      Number(form.installments) <= 0 ||
      Number(form.dueDay) < 1 ||
      Number(form.dueDay) > 28
    )
      return setError(
        "Enter valid fee amounts, installments and a due day between 1 and 28.",
      );
    if (Number(form.lateFee) < 0 || Number(form.gracePeriodDays) < 0)
      return setError("Late fee and grace period cannot be negative.");
    const duplicate = plans.some(
      (item) =>
        item.id !== editingId &&
        item.status === "Active" &&
        form.status === "Active" &&
        item.academicSessionId === form.academicSessionId &&
        (item.gradeId
          ? item.gradeId === form.gradeId
          : String(item.grade) === String(form.grade)),
    );
    if (duplicate)
      return setError(
        "An active grade fee already exists for this academic session.",
      );
    const numericFields = [
      "admissionFee",
      "tuitionFee",
      "installments",
      "dueDay",
      "lateFee",
      "gracePeriodDays",
    ];
    const record = {
      ...form,
      name: form.name.trim(),
      ...Object.fromEntries(
        numericFields.map((key) => [key, Number(form[key])]),
      ),
    };
    busy.current = true;
    setSaving(true);
    try {
      if (editingId) await updateFeePlan(editingId, record);
      else await createFeePlan(record);
      await loadPlans();
      setOpen(false);
      setSessionFilter(form.academicSessionId);
      setNotice("Fee plan saved successfully.");
      setError("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const archive = async (id) => {
    const item = plans.find((plan) => plan.id === id);
    if (!item || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await updateFeePlan(id, {
        ...item,
        status: item.status === "Archived" ? "Draft" : "Archived",
      });
      await loadPlans();
      setNotice(
        item.status === "Archived"
          ? "Fee plan restored as Draft."
          : "Fee plan archived.",
      );
      setError("");
    } catch (archiveError) {
      setError(archiveError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const Editor = editingId ? EditFeePlan : NewFeePlan;
  return (
    <div className="admin-page board-page fee-page">
      <header className="tutor-page-heading">
        <span className="tutor-heading-icon">
          <AdminMetricIcon name="revenue" />
        </span>
        <div>
          <h1>Fees Configuration</h1>
        
        </div>
        <label className="fee-session-label">
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
        <p role="alert" className="fee-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="fee-success">
          {notice}
        </p>
      )}
      <section className="fee-metrics">
        {[
          ["Total Plans", sessionPlans.length, "total"],
          [
            "Active",
            sessionPlans.filter((p) => p.status === "Active").length,
            "resolved",
          ],
          [
            "Draft",
            sessionPlans.filter((p) => p.status === "Draft").length,
            "pending",
          ],
          [
            "Archived",
            sessionPlans.filter((p) => p.status === "Archived").length,
            "inactive",
          ],
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Grade Fee Directory
            </h2>
            
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!activeSession}
              onClick={openCreate}
              className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
            >
              + Add Grade Fee
            </button>
          </div>
        </div>
        <FeePlanFilters
          search={search}
          gradeFilter={gradeFilter}
          billingFilter={billingFilter}
          statusFilter={statusFilter}
          grades={grades}
          onChange={(key, value) => {
            ({
              search: setSearch,
              grade: setGradeFilter,
              billing: setBillingFilter,
              status: setStatusFilter,
            })[key](value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setGradeFilter("all");
            setBillingFilter("all");
            setStatusFilter("all");
            setPage(1);
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "S.N.",
                  "Fee Plan",
                  "Grade",
                  "Admission Fee",
                  "Tuition Fee",
                  "Billing",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/25 px-4 py-3 ${heading === "Actions" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="p-10 text-center">
                    Loading fee plans…
                  </td>
                </tr>
              )}
              {visiblePlans.map((item, index) => {
                const archiveAction =
                  item.status === "Archived" ? "restore" : "archive";
                return (
                  <tr key={item.id} className="hover:bg-blue-50/50">
                    <td className="border border-slate-200 px-4 py-3">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">{item.name}</strong>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong>Grade {item.grade}</strong>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {currency.format(item.admissionFee)}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {currency.format(item.tuitionFee)}
                      <small className="block text-slate-500">
                        per installment
                      </small>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      {item.billingFrequency}
                      <span className="block text-[10px] text-slate-400">
                        {item.installments} installments
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusTone[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          className="admin-action-native !border-slate-200 !bg-slate-50 !text-slate-700"
                          onClick={() => setViewing(item)}
                          aria-label={`View fee plan ${item.name}`}
                        >
                          <AdminActionIcon name="view" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit fee plan ${item.name}`}
                          title="Edit fee plan"
                          className="admin-action-native !border-indigo-200 !bg-indigo-50"
                        >
                          <FeePlanActionIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => archive(item.id)}
                          aria-label={`${archiveAction === "restore" ? "Restore" : "Archive"} fee plan ${item.name}`}
                          title={
                            archiveAction === "restore"
                              ? "Restore fee plan"
                              : "Archive fee plan"
                          }
                          className={`admin-action-native ${archiveAction === "restore" ? "!border-emerald-200 !bg-emerald-50" : "!border-amber-200 !bg-amber-50"}`}
                        >
                          <FeePlanActionIcon name={archiveAction} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && !visible.length && (
            <p className="p-10 text-center text-sm text-slate-500">
              No fee plans match the selected filters.
            </p>
          )}
        </div>
        <AdminPagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={visible.length}
          onPageChange={setPage}
        />
      </section>
      {open && (
        <Editor
          form={form}
          editingId={editingId}
          sessions={sessions}
          grades={grades.filter(
            (g) => g.status === "Active" || g.id === form.gradeId,
          )}
          update={update}
          submit={submit}
          onClose={() => {
            if (!busy.current) setOpen(false);
          }}
          error={error}
          saving={saving}
        />
      )}
      {viewing && (
        <FeePlanDetails
          plan={viewing}
          sessionName={
            sessions.find((s) => s.id === viewing.academicSessionId)?.name
          }
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

export default FeeConfiguration;
