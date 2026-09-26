import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, loginUser } from "../../services/authApi";
import { applyTheme } from "../../services/themeService";

function LoginWithPassword({ portal = "user" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (!email.trim() || !password.trim()) {
      setMessage({
        type: "error",
        text: "Enter your email address and password to continue.",
      });
      return;
    }
    setIsSubmitting(true);

    if (portal === "admin") {
      try {
        const { token, user } = await loginAdmin(email.trim(), password);
        const displayRole = user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin";

        sessionStorage.setItem("tuitionsphere_admin_token", token);
        sessionStorage.setItem("tuitionsphere_admin_session", "active");
        sessionStorage.setItem("tuitionsphere_admin_id", user.id);
        sessionStorage.setItem("tuitionsphere_admin_name", user.name);
        sessionStorage.setItem("tuitionsphere_admin_role", displayRole);
        sessionStorage.setItem("tuitionsphere_auth_role", "admin");
        applyTheme((user.themePreference || "SYSTEM").toLowerCase());
        navigate("/admin/dashboard");
      } catch (error) {
        sessionStorage.removeItem("tuitionsphere_admin_token");
        sessionStorage.removeItem("tuitionsphere_admin_session");
        setMessage({ type: "error", text: error.message });
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const { token, user } = await loginUser(email.trim(), password);
      if (user.role === 'TUTOR' && user.tutorId) {
        sessionStorage.setItem('tuitionsphere_tutor_token', token);
        sessionStorage.setItem('tuitionsphere_tutor_session', 'active');
        sessionStorage.setItem('tuitionsphere_tutor_id', user.tutorId);
        sessionStorage.setItem('tuitionsphere_tutor_user_id', user.id);
        sessionStorage.setItem('tuitionsphere_tutor_name', user.name);
        sessionStorage.setItem('tuitionsphere_tutor_email', user.email);
        sessionStorage.setItem('tuitionsphere_auth_role', 'tutor');
        applyTheme((user.themePreference || 'SYSTEM').toLowerCase());
        navigate('/tutor/dashboard');
        return;
      }
      if (user.role === 'STUDENT' && user.studentId) {
        sessionStorage.setItem('tuitionsphere_portal_token', token);
        sessionStorage.setItem('tuitionsphere_portal_session', 'active');
        sessionStorage.setItem('tuitionsphere_portal_student_id', user.studentId);
        sessionStorage.setItem('tuitionsphere_auth_role', 'student');
        applyTheme((user.themePreference || 'LIGHT').toLowerCase());
        navigate('/portal/dashboard');
        return;
      }
      throw new Error('This account does not have portal access.');
    } catch (error) {
      setIsSubmitting(false);
      sessionStorage.removeItem('tuitionsphere_portal_token');
      sessionStorage.removeItem('tuitionsphere_portal_session');
      setMessage({ type: 'error', text: error.message || 'Invalid email or password, or the account is inactive.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#34415a]">
        Email Address
        <input
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter registered email"
          className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/15"
        />
      </label>
      <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-[#34415a]">
        Password
        <div className="relative">
          <input
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter password"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 pr-14 font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-brand-navy"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <div className="mt-4 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-[#68758c]">
          <input type="checkbox" className="h-4 w-4 accent-brand-navy" />
          Remember me
        </label>
        <button
          type="button"
          onClick={() =>
            setMessage({
              type: "info",
              text: "Password reset will be connected during backend integration.",
            })
          }
          className="text-xs font-semibold text-brand-gold-dark hover:text-brand-navy"
        >
          Forgot password?
        </button>
      </div>
      {message && (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}
        >
          {message.text}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-lg disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        )}
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export default LoginWithPassword;
