import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-slate-50 px-5 py-12 text-center md:min-h-[calc(100svh-76px)]">
      <div className="max-w-lg">
        <p className="font-heading text-7xl font-black text-brand-gold">404</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-brand-navy">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-brand-muted">The page you are looking for may have been moved or does not exist.</p>
        <Link to="/" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white no-underline transition hover:bg-brand-navy-light">Back to Home</Link>
      </div>
    </section>
  );
}

export default NotFound;
