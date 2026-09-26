import { Link } from 'react-router-dom';

function LegalPage({ eyebrow, title, introduction, sections, updatedOn }) {
  return (
    <div className="bg-slate-50 px-5 py-10 md:px-12 md:py-14">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-brand-navy/10 bg-white shadow-brand-card">
        <header className="bg-brand-navy px-6 py-9 text-white md:px-10 md:py-11">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{introduction}</p>
          <p className="mt-4 text-xs text-slate-400">Last updated: {updatedOn}</p>
        </header>

        <div className="space-y-7 px-6 py-8 md:px-10 md:py-10">
          {sections.map((section, index) => (
            <section key={section.title} className="border-b border-slate-200 pb-7 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-xs font-bold text-brand-gold-dark">{String(index + 1).padStart(2, '0')}</span>
                <div><h2 className="font-heading text-lg font-semibold text-brand-navy">{section.title}</h2><p className="mt-2 text-sm leading-7 text-brand-muted">{section.content}</p></div>
              </div>
            </section>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 bg-brand-cream px-6 py-5 sm:flex-row sm:items-center md:px-10">
          <p className="text-xs text-brand-muted">Questions about this document?</p>
          <div className="flex gap-3"><Link to="/contact" className="text-xs font-semibold text-brand-navy no-underline hover:text-brand-gold-dark">Contact TuitionSphere</Link><Link to="/" className="text-xs font-semibold text-brand-navy no-underline hover:text-brand-gold-dark">Back to Home</Link></div>
        </div>
      </div>
    </div>
  );
}

export default LegalPage;
