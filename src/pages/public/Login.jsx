import { useState } from "react";
import { Link } from "react-router-dom";
import LoginWithPassword from "../../components/auth/LoginWithPassword";
import LoginWithOtp from "../../components/auth/LoginWithOtp";

const portalPreviewCards = [
  ["Upcoming Classes", "04", "bg-sky-400/15 text-sky-300"],
  ["Active Notices", "03", "bg-violet-400/15 text-violet-300"],
  ["Attendance", "92%", "bg-emerald-400/15 text-emerald-300"],
  ["Fee Status", "Paid", "bg-amber-400/15 text-amber-300"],
];

function Login() {
  const [loginMode, setLoginMode] = useState("password");

  return (
    <section className="min-h-[calc(100svh-64px)] bg-[#f4f6fa] px-4 py-6 md:min-h-[calc(100svh-76px)] md:px-8 md:py-8">
      <div className="mx-auto grid min-h-[680px] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_80px_rgba(27,42,74,0.16)] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden overflow-hidden bg-brand-navy p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-28 h-72 w-72 rounded-full border-[55px] border-brand-gold/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-28 h-80 w-80 rounded-full border-[60px] border-white/[0.035]"
          />
          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-3 font-heading text-xl font-bold text-white no-underline"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-brand-navy shadow-lg">
                TS
              </span>
              TuitionSphere Portal
            </Link>
            <h1 className="mt-10 max-w-md font-heading text-4xl font-bold leading-tight text-white">
              Your complete academic journey, in one place.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Access classes, learning resources, performance, attendance and
              fee information through a secure role-based portal.
            </p>
          </div>

          <div className="relative my-8 grid grid-cols-2 gap-3">
            {portalPreviewCards.map(([label, value, style]) => (
              <article
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.09]"
              >
                <span
                  className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold ${style}`}
                >
                  {label}
                </span>
                <strong className="mt-4 block font-heading text-2xl text-white">
                  {value}
                </strong>
                <span className="mt-1 block text-[11px] text-slate-400">
                  Portal preview
                </span>
              </article>
            ))}
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/10 pt-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              ✓
            </span>
            <div>
              <strong className="block text-sm text-white">
                Secure role-based access
              </strong>
              <span className="text-xs text-slate-400">
                Student and tutor accounts open their correct portal automatically.
              </span>
            </div>
          </div>
        </aside>

        <div className="flex items-center p-5 sm:p-8 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-lg">
            <div className="lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-heading text-lg font-bold text-brand-navy no-underline"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy text-xs text-brand-gold">
                  TS
                </span>
                TuitionSphere Portal
              </Link>
            </div>
            <div className="mt-7 lg:mt-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
                Welcome Back
              </p>
              <h2 className="mt-2 font-heading text-[30px] font-bold text-brand-navy">
                Sign in to your portal
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#748096]">
                Enter your registered details to securely access your portal.
              </p>
            </div>

            <div className="mt-5 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setLoginMode("password")}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition ${loginMode === "password" ? "border-brand-gold text-brand-navy" : "border-transparent text-slate-400"}`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("otp")}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition ${loginMode === "otp" ? "border-brand-gold text-brand-navy" : "border-transparent text-slate-400"}`}
              >
                Mobile OTP
              </button>
            </div>

            {loginMode === "password" ? <LoginWithPassword /> : <LoginWithOtp />}

            <p className="mt-6 text-center text-xs text-[#7a869a]">
              Need help accessing your account?{" "}
              <Link
                to="/contact"
                className="font-semibold text-brand-navy no-underline hover:text-brand-gold-dark"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
