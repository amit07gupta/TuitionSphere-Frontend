import { Link } from 'react-router-dom';
import SocialLinks from '../common/SocialLinks';

const quickLinks = [
  ['About Us', '/about'],
  ['Courses', '/courses'],
  ['Fee Structure', '/fees'],
  ['Book Free Demo', '/book-demo'],
  ['Contact Us', '/contact'],
];

const legalLinks = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms-and-conditions'],
];

function Footer() {
  return (
    <footer className="mt-auto bg-brand-navy pb-6 pt-12 text-slate-200 md:pt-16">
      <div className="mx-auto w-[min(calc(100%-40px),1200px)] md:w-[min(calc(100%-96px),1200px)]">
        <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr_1fr] lg:gap-12">
          <div>
            <Link to="/" className="mb-4 inline-block font-heading text-2xl font-bold text-white no-underline">TuitionSphere</Link>
            <p className="max-w-sm text-sm leading-6 text-slate-300">Building strong academic foundations for Grades 1 to 12 through small batches, expert mentorship and regular assessments.</p>
            <div className="mt-5"><SocialLinks dark /></div>
          </div>

          <div>
            <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.1em] text-brand-gold">Quick Links</h2>
            <nav className="flex flex-col items-start gap-3" aria-label="Footer navigation">
              {quickLinks.map(([label, path]) => <Link key={path} to={path} className="text-sm text-slate-300 no-underline transition hover:text-brand-gold">{label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.1em] text-brand-gold">Contact</h2>
            <address className="flex flex-col gap-3 text-sm not-italic text-slate-300">
              <a href="tel:+919876543210" className="no-underline transition hover:text-brand-gold">+91 98765 43210</a>
              <a href="mailto:info@tuitionsphere.com" className="no-underline transition hover:text-brand-gold">info@tuitionsphere.com</a>
              <span>Lucknow, Uttar Pradesh</span>
            </address>
          </div>

          <div>
            <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.1em] text-brand-gold">Class Hours</h2>
            <div className="space-y-1.5 text-sm text-slate-300"><p>Monday-Saturday</p><p>8:00 AM-8:00 PM</p><p>Sunday: Closed</p></div>
            <Link to="/book-demo" className="mt-4 inline-block border-b border-brand-gold pb-1 text-sm font-semibold text-brand-gold no-underline">Book a Free Demo</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} TuitionSphere. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal navigation">{legalLinks.map(([label, path]) => <Link key={path} to={path} className="text-slate-400 no-underline transition hover:text-brand-gold">{label}</Link>)}</nav>
          <p>Designed for better learning and measurable academic progress.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
