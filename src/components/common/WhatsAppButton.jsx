import { Link, useLocation } from 'react-router-dom';

function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" className={`${className} fill-current`}><path d="M16.04 3A12.94 12.94 0 0 0 4.86 22.45L3 29l6.72-1.76A13 13 0 1 0 16.04 3Zm0 23.74a10.72 10.72 0 0 1-5.47-1.5l-.39-.23-3.99 1.05 1.07-3.89-.25-.4a10.73 10.73 0 1 1 9.03 4.97Zm5.88-8.04c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.71.16-.22.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.33-.16-1.37-.5-2.61-1.61a9.78 9.78 0 0 1-1.81-2.25c-.19-.32-.02-.5.14-.66.15-.14.32-.37.49-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.63-.52-.54-.71-.55h-.61c-.22 0-.56.08-.86.4-.29.32-1.12 1.1-1.12 2.67 0 1.57 1.15 3.09 1.31 3.3.16.22 2.25 3.44 5.46 4.82.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.22-.61-.38Z" /></svg>;
}

function WhatsAppButton() {
  const { pathname } = useLocation();
  const isDemoPage = pathname === '/book-demo';

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 hidden flex-col items-end gap-3 md:flex">
        {!isDemoPage && <Link to="/book-demo" aria-label="Book a free demo" className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-white no-underline shadow-xl transition hover:-translate-y-1 hover:bg-brand-navy-light hover:shadow-2xl"><svg className="h-5 w-5 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /></svg><span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-brand-navy px-3 py-2 text-xs font-semibold opacity-0 shadow-lg transition group-hover:opacity-100">Book Free Demo</span></Link>}
        <a href="https://wa.me/919876543210?text=Hello%20TuitionSphere%2C%20I%20want%20to%20know%20about%20your%20courses." target="_blank" rel="noopener noreferrer" aria-label="Chat with TuitionSphere on WhatsApp" className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#20b957] text-white no-underline shadow-xl transition hover:-translate-y-1 hover:bg-[#169c48] hover:shadow-2xl focus-visible:outline-white"><WhatsAppIcon /><span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-[#169c48] px-3 py-2 text-xs font-semibold opacity-0 shadow-lg transition group-hover:opacity-100">WhatsApp</span></a>
      </div>

      <div className={`fixed inset-x-3 bottom-3 z-40 grid gap-2 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_15px_40px_rgba(27,42,74,0.2)] backdrop-blur-xl md:hidden ${isDemoPage ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <a href="https://wa.me/919876543210?text=Hello%20TuitionSphere%2C%20I%20want%20to%20know%20about%20your%20courses." target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#20b957] px-3 text-sm font-semibold text-white no-underline"><WhatsAppIcon className="h-5 w-5" /> WhatsApp</a>
        {!isDemoPage && <Link to="/book-demo" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-navy px-3 text-sm font-semibold text-white no-underline">Book Free Demo</Link>}
      </div>
    </>
  );
}

export default WhatsAppButton;
