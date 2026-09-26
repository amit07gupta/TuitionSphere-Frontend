import NewNotice from "./NewNotice";
import EditNotice from "./EditNotice";
import {
  blankNotice,
  fieldClass,
  statusStyle,
  priorityStyle,
} from "./noticeUtils";
import { useEffect, useRef, useState } from "react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
import { fetchBatches } from "../../../services/batchApi";
import { fetchGrades } from "../../../services/gradeApi";
import { fetchTutors } from "../../../services/tutorApi";
import {
  fetchNotices,
  createNotice,
  updateNotice,
  archiveNotice,
} from "../../../services/noticeApi";

function NoticeActionIcon({ name }) {
  const paths = {
    edit: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
    archive: (
      <>
        <path d="M4 7h16M6 7l1 14h10l1-14M9 11v6M15 11v6" />
        <path d="M9 4h6l1 3H8l1-3Z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function NoticesManagement() {
  const [notices, setNotices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankNotice);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [visible, setVisible] = useState([]);
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const closeForm = () => {
    if (!busy.current) setEditing(null);
  };
  const modalRef = useAccessibleModal(Boolean(editing), closeForm);
  const activeBatches = batches.filter(
    (item) => item.status === "Active" || item.id === form.audienceValue,
  );
  const availableGrades = grades.filter(
    (item) => item.status === "Active" || item.id === form.audienceValue,
  );
  const availableTutors = tutors.filter(
    (item) => item.status === "Active" || item.id === form.audienceValue,
  );

  useEffect(() => {
    let active = true;
    Promise.all([fetchBatches(), fetchGrades(), fetchTutors()])
      .then(([batchRows, gradeRows, tutorRows]) => {
        if (active) {
          setBatches(batchRows);
          setGrades(gradeRows);
          setTutors(tutorRows);
        }
      })
      .catch((e) => {
        if (active) setPageError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      Promise.all([
        fetchNotices(),
        fetchNotices({ search, status: statusFilter }),
      ])
        .then(([all, filtered]) => {
          if (active) {
            setNotices(all);
            setVisible(filtered);
            setPageError("");
          }
        })
        .catch((e) => {
          if (active) {
            setVisible([]);
            setPageError(e.message);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, statusFilter, revision]);

  const openAdd = () => {
    setForm(blankNotice());
    setFormError("");
    setEditing({ id: null });
  };
  const openEdit = (notice) => {
    setForm({ ...notice });
    setFormError("");
    setEditing(notice);
  };
  const update = (event) => {
    const { name, value } = event.target;
    if (name === "audienceType") {
      const audienceValue =
        value === "Grade"
          ? (grades.find((grade) => grade.status === "Active")?.id ?? "")
          : value === "Batch"
            ? (batches.find((batch) => batch.status === "Active")?.id ?? "")
            : value === "Tutor"
              ? (tutors.find((tutor) => tutor.status === "Active")?.id ?? "")
              : "all";
      setForm((current) => ({
        ...current,
        audienceType: value,
        audienceValue,
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    if (
      ["Grade", "Batch", "Tutor"].includes(form.audienceType) &&
      !form.audienceValue
    ) {
      setFormError("Select a valid audience.");
      return;
    }
    if (form.expiryDate && form.expiryDate < form.publishDate) {
      setFormError("Expiry date cannot be earlier than the publish date.");
      return;
    }
    busy.current = true;
    setIsSaving(true);
    setFormError("");
    setNoticeMessage("");
    try {
      if (editing.id) await updateNotice(editing.id, form);
      else await createNotice(form);
      setEditing(null);
      setNoticeMessage(
        editing.id
          ? "Update saved successfully."
          : "Update created successfully.",
      );
      setRevision((value) => value + 1);
    } catch (e) {
      setFormError(e.message);
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  };
  const archive = async (id) => {
    if (busy.current) return;
    busy.current = true;
    setIsSaving(true);
    setPageError("");
    setNoticeMessage("");
    try {
      await archiveNotice(id);
      setNoticeMessage("Update archived successfully.");
      setRevision((value) => value + 1);
    } catch (e) {
      setPageError(e.message);
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  };
  const NoticeEditor = editing?.id ? EditNotice : NewNotice;
  const audienceLabel = (item) => item.audienceLabel;

  return (
    <div className="admin-page">
      {pageError && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {pageError}
        </p>
      )}
      {noticeMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {noticeMessage}
        </p>
      )}
      {loading && (
        <p role="status" className="mb-3 text-sm text-slate-500">
          Loading updates…
        </p>
      )}
      <AdminPageHeader
        eyebrow="Portal Communication"
        title="Updates Management"
        description="Manage academic, schedule and institute updates with targeted audiences."
        icon="bell"
        meta={`${notices.filter((item) => item.status === "Published").length} published`}
      />
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Published", "border-emerald-300 bg-emerald-50 text-emerald-900"],
          ["Draft", "border-amber-300 bg-amber-50 text-amber-900"],
          ["Archived", "border-slate-300 bg-slate-100 text-slate-700"],
        ].map(([label, style]) => (
          <article
            key={label}
            className={`rounded-xl border border-l-4 px-4 py-3 shadow-sm ${style}`}
          >
            <p className="text-[10px] font-semibold opacity-65">{label}</p>
            <strong className="mt-1 block font-heading text-2xl">
              {notices.filter((item) => item.status === label).length}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Updates register
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage update content, audience and publication dates.
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={openAdd}
            className="min-h-10 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-700"
          >
            + Create Update
          </button>
        </div>
        <div className="grid gap-3 border-b bg-slate-50 p-4 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search updates..."
            className={fieldClass}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={fieldClass}
            // aria-label="Filter updates by status"
          >
            <option value="all">Status</option>
            {Object.keys(statusStyle).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Update",
                  "Category",
                  "Audience",
                  "Publish / Expiry",
                  "Priority",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-4 py-3 ${heading === "Actions" ? "sticky right-0 z-10 w-[120px] min-w-[120px] bg-[#102044] text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="group hover:bg-orange-50/50">
                  <td className="max-w-md border px-4 py-3">
                    <strong className="text-brand-navy">{item.title}</strong>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">
                      {item.message}
                    </p>
                  </td>
                  <td className="border px-4 py-3">{item.category}</td>
                  <td className="border px-4 py-3">{audienceLabel(item)}</td>
                  <td className="border px-4 py-3">
                    <span className="block">{item.publishDate}</span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      to {item.expiryDate || "No expiry"}
                    </span>
                  </td>
                  <td className="border px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${priorityStyle[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="border px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusStyle[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="sticky right-0 z-[2] w-[120px] min-w-[120px] border bg-white px-3 py-3 shadow-[-7px_0_14px_rgba(15,23,42,0.05)] group-hover:bg-orange-50">
                    <div className="flex min-h-9 items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={isSaving || loading}
                        onClick={() => openEdit(item)}
                        className="admin-action-native !text-indigo-700"
                        title="Edit update"
                        aria-label={`Edit ${item.title}`}
                      >
                        <NoticeActionIcon name="edit" />
                      </button>
                      {item.status !== "Archived" && (
                        <button
                          type="button"
                          disabled={isSaving || loading}
                          onClick={() => archive(item.id)}
                          className="admin-action-native !text-rose-700"
                          title="Archive update"
                          aria-label={`Archive ${item.title}`}
                        >
                          <NoticeActionIcon name="archive" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !visible.length && (
                <tr>
                  <td
                    colSpan="7"
                    className="border px-4 py-10 text-center text-slate-400"
                  >
                    No updates match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <NoticeEditor
          modalRef={modalRef}
          save={save}
          closeForm={closeForm}
          isSaving={isSaving}
          form={form}
          update={update}
          availableGrades={availableGrades}
          activeBatches={activeBatches}
          availableTutors={availableTutors}
          setForm={setForm}
          formError={formError}
        />
      )}
    </div>
  );
}

export default NoticesManagement;
