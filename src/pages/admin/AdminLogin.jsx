import { Link } from 'react-router-dom';
import LoginWithPassword from '../../components/auth/LoginWithPassword';

function AdminLogin() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Branding section */}
        <section className="hidden bg-brand-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="text-xl font-bold text-white no-underline">
            TuitionSphere
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
              Admin Portal
            </p>

            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight">
              Manage learning operations from one place.
            </h1>

            <p className="mt-4 max-w-md leading-7 text-slate-300">
              Review demo requests, student information, courses, batches and
              academic activities securely.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            TuitionSphere Academic Management
          </p>
        </section>

        {/* Login section */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="font-heading text-xl font-bold text-brand-navy no-underline lg:hidden"
            >
              TuitionSphere
            </Link>

            <p className="mt-8 text-xs font-bold uppercase tracking-widest text-brand-gold-dark lg:mt-0">
              Welcome Back
            </p>

            <h2 className="mt-2 font-heading text-3xl font-bold text-brand-navy">
              Admin Login
            </h2>

            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Enter your administrator credentials to continue.
            </p>
            <LoginWithPassword portal="admin" />
          </div>
        </section>

      </div>
    </main>
  );
}

export default AdminLogin;
