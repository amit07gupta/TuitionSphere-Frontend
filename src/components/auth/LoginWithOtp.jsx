import { useState } from 'react';

function LoginWithOtp() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(null);
    if (!/^\d{10}$/.test(mobile)) {
      setMessage({ type: 'error', text: 'Enter a valid 10-digit mobile number.' });
      return;
    }
    if (!otpSent) {
      setOtpSent(true);
      setMessage({ type: 'info', text: 'OTP service will be enabled after backend integration.' });
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ type: 'error', text: 'Enter a valid 6-digit OTP.' });
      return;
    }
    setMessage({ type: 'info', text: 'OTP verification API will be connected during backend integration.' });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#34415a]">Mobile Number<input required value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" inputMode="numeric" autoComplete="tel" placeholder="Enter 10-digit mobile number" className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/15" /></label>
      {otpSent && <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-[#34415a]">Enter OTP<input required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength="6" placeholder="6-digit OTP" className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-center font-heading text-lg tracking-[0.35em] text-brand-navy outline-none transition focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/15" /></label>}
      {message && <div role="status" className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${message.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>{message.text}</div>}
      <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-lg">{otpSent ? 'Verify OTP' : 'Send OTP'}</button>
    </form>
  );
}

export default LoginWithOtp;
