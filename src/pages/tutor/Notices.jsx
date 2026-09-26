import { useCallback, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PortalIcon from "../../components/portal/PortalIcon";
import {
  archiveTutorUpdate,
  createTutorUpdate,
  fetchTutorUpdates,
  updateTutorUpdate,
} from "../../services/tutorUpdateApi";

const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const blank = () => ({
  title: "",
  message: "",
  category: "Academic",
  priority: "Normal",
  audienceType: "Batch",
  audienceValue: "",
  publishDate: dateKey(),
  expiryDate: "",
  status: "Draft",
});
const statusTone = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Archived: "bg-slate-200 text-slate-600",
};
const priorityTone = {
  Normal: "bg-sky-100 text-sky-700",
  Important: "bg-amber-100 text-amber-700",
  Urgent: "bg-rose-100 text-rose-700",
};
const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm text-brand-navy outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
const parseDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);

function TutorNotices() {
  const [notices, setNotices] = useState([]);
  const [receivedNotices, setReceivedNotices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = useCallback(
    () =>
      fetchTutorUpdates()
        .then((data) => {
          setNotices(data.updates || []);
          setReceivedNotices(data.receivedUpdates || []);
          setBatches(data.assignedBatches || []);
        })
        .catch((requestError) => setError(requestError.message)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  const assignedBatchIds = useMemo(
    () => new Set(batches.map((item) => item.id)),
    [batches],
  );
  const owned = notices;
  const visible = owned.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (!search ||
        `${item.title} ${item.message}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const close = () => {
    setEditingId(null);
    setForm(blank());
    setError("");
  };
  const openAdd = () => {
    const values = blank();
    values.audienceValue = batches[0]?.id || "";
    setForm(values);
    setEditingId("new");
    setError("");
  };
  const openEdit = (notice) => {
    setForm({ ...notice });
    setEditingId(notice.id);
    setError("");
  };
  const save = async (event) => {
    event.preventDefault();
    if (!assignedBatchIds.has(form.audienceValue)) {
      setError("Select one of your assigned batches.");
      return;
    }
    if (form.expiryDate && form.expiryDate < form.publishDate) {
      setError("Expiry date cannot be before publish date.");
      return;
    }
    try {
      if (editingId === "new") await createTutorUpdate(form);
      else await updateTutorUpdate(editingId, form);
      await load();
      close();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const archive = async (id) => {
    try {
      await archiveTutorUpdate(id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
              Batch communication
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
              Updates
            </h1>
          </div>
          <button
            type="button"
            onClick={openAdd}
            disabled={!batches.length}
            className="rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-40"
          >
            + Create Update
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Institute announcements</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-brand-navy">Updates for you</h2>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{receivedNotices.length}</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {receivedNotices.map((item) => (
            <article key={item.id} className="rounded-xl border border-blue-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h3 className="font-heading text-sm font-bold text-brand-navy">{item.title}</h3><p className="mt-1 text-[10px] text-slate-500">{item.category} · {item.publishDate}</p></div>
                <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${priorityTone[item.priority]}`}>{item.priority}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{item.message}</p>
            </article>
          ))}
          {!receivedNotices.length && <p className="rounded-xl border border-dashed border-blue-200 bg-white/70 p-5 text-center text-xs text-slate-500 lg:col-span-2">No active institute announcements.</p>}
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {["Published", "Draft", "Archived"].map((label) => (
          <article
            key={label}
            className={`rounded-2xl p-4 ${statusTone[label]}`}
          >
            <p className="text-xs font-semibold">{label}</p>
            <strong className="mt-1 block text-2xl text-brand-navy">
              {owned.filter((item) => item.status === label).length}
            </strong>
          </article>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b bg-slate-50 p-4 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your updates"
            className={fieldClass}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={fieldClass}
          >
            <option value="all">Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead className="bg-[#102044] text-white">
              <tr>
                {[
                  "Update",
                  "Batch",
                  "Publish / Expiry",
                  "Priority",
                  "Status",
                  "Actions",
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
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/50">
                  <td className="max-w-sm border border-slate-200 px-4 py-3">
                    <strong className="text-brand-navy">{item.title}</strong>
                    <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                      {item.message}
                    </p>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    {batches.find((batch) => batch.id === item.audienceValue)
                      ?.name || "Batch unavailable"}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    {item.publishDate}
                    <span className="block text-[10px] text-slate-400">
                      to {item.expiryDate || "No expiry"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${priorityTone[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusTone[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        title="Edit"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700"
                      >
                        <PortalIcon name="edit" className="h-4 w-4" />
                      </button>
                      {item.status !== "Archived" && (
                        <button
                          type="button"
                          onClick={() => archive(item.id)}
                          aria-label={`Archive ${item.title}`}
                          title="Archive"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700"
                        >
                          <PortalIcon name="delete" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400">
                    No tutor updates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {editingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 sm:p-4">
          <form
            onSubmit={save}
            className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl"
          >
            <header className="flex items-center justify-between border-b p-4">
              <h2 className="font-heading text-xl font-bold text-brand-navy">
                {editingId === "new" ? "Create Update" : "Edit Update"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </header>
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
              <label className="text-xs font-semibold sm:col-span-2">
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold sm:col-span-2">
                Message
                <textarea
                  required
                  minLength="10"
                  rows="4"
                  value={form.message}
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold">
                Assigned Batch
                <select
                  required
                  value={form.audienceValue}
                  onChange={(event) =>
                    setForm({ ...form, audienceValue: event.target.value })
                  }
                  className={fieldClass}
                >
                  <option value="">Select batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className={fieldClass}
                >
                  {["Academic", "Schedule", "Exam", "General"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                  className={fieldClass}
                >
                  {Object.keys(priorityTone).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={fieldClass}
                >
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Archived</option>
                </select>
              </label>
              <label className="text-xs font-semibold">
                Publish Date
                <DatePicker
                  required
                  selected={parseDate(form.publishDate)}
                  onChange={(date) =>
                    setForm({
                      ...form,
                      publishDate: dateKey(date),
                      expiryDate:
                        form.expiryDate && form.expiryDate < dateKey(date)
                          ? ""
                          : form.expiryDate,
                    })
                  }
                  dateFormat="dd/MM/yyyy"
                  wrapperClassName="w-full"
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold">
                Expiry Date
                <DatePicker
                  selected={parseDate(form.expiryDate)}
                  minDate={parseDate(form.publishDate)}
                  onChange={(date) =>
                    setForm({ ...form, expiryDate: date ? dateKey(date) : "" })
                  }
                  isClearable
                  dateFormat="dd/MM/yyyy"
                  wrapperClassName="w-full"
                  className={fieldClass}
                />
              </label>
              {error && (
                <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 sm:col-span-2">
                  {error}
                </p>
              )}
            </div>
            <footer className="flex justify-end gap-3 border-t bg-slate-50 p-4">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border px-4 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white"
              >
                Save Update
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

export default TutorNotices;
