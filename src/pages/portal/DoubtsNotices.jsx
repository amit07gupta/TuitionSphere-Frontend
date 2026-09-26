import { useEffect, useState } from "react";
import PortalIcon from "../../components/portal/PortalIcon";
import { fetchStudentNotices } from "../../services/studentNoticeApi";

function DoubtsNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const result = await fetchStudentNotices();
        if (active) { setNotices(result.notices); setError(""); }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);
  return (
    <div>
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
          Institute communication
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy">
          Updates
        </h1>
      </header>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
      <section className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
        {notices.map((notice) => (
          <article
            key={notice.id}
            className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                <PortalIcon name="notice" className="h-4 w-4" />
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(`${notice.publishDate}T00:00:00`).toLocaleDateString(
                  "en-IN",
                )}
              </span>
            </div>
            <h2 className="mt-3 break-words font-heading text-base font-semibold text-brand-navy [overflow-wrap:anywhere]">
              {notice.title}
            </h2>
            <div className="mt-2 flex gap-2 text-[9px] font-bold uppercase tracking-wide">
              <span className="rounded-full bg-orange-100 px-2 py-1 text-orange-800">{notice.category}</span>
              {notice.priority !== "Normal" && <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">{notice.priority}</span>}
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 [overflow-wrap:anywhere]">
              {notice.message}
            </p>
          </article>
        ))}
        {loading && <p className="rounded-2xl border bg-white p-8 text-center text-xs text-slate-400 md:col-span-2">Loading updates…</p>}
        {!loading && !notices.length && (
          <p className="rounded-2xl border bg-white p-8 text-center text-xs text-slate-400 md:col-span-2">
            {error ? "Unable to load updates." : "No active updates."}
          </p>
        )}
      </section>
    </div>
  );
}

export default DoubtsNotices;
