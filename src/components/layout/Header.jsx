import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navigationLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Fees', path: '/fees' },
  { label: 'Contact', path: '/contact' },
];

function BrandLogo() {
  return (
    <svg className="h-10 w-10 shrink-0 drop-shadow-md transition duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-2" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="13" className="fill-brand-navy" />
      <path d="M13 18.5C17.5 17.2 21.2 18.3 24 21.3C26.8 18.3 30.5 17.2 35 18.5V31.5C30.6 30.4 27 31.2 24 34C21 31.2 17.4 30.4 13 31.5V18.5Z" fill="white" />
      <path d="M24 21.5V33.5" fill="none" stroke="#1b2a4a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 27C8.2 19.6 12.8 12.3 20 10" fill="none" stroke="#e8a33d" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="21" cy="9.8" r="2.8" className="fill-brand-gold" />
    </svg>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-white/90 shadow-[0_8px_30px_rgba(27,42,74,0.06)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy-light" />
      <div className="relative mx-auto flex min-h-16 w-[min(calc(100%-40px),1200px)] items-center justify-between gap-5 md:min-h-[76px] md:w-[min(calc(100%-96px),1200px)]">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5 no-underline" aria-label="TuitionSphere home" onClick={closeMenu}>
          <BrandLogo />
          <span className="font-heading text-[17px] font-bold tracking-tight text-brand-navy sm:text-xl">TuitionSphere</span>
        </Link>

        <nav id="primary-navigation" aria-label="Primary navigation" className={`${isMenuOpen ? 'flex' : 'hidden'} absolute inset-x-[-20px] top-full flex-col gap-1 border-b border-brand-navy/10 bg-brand-cream p-5 shadow-xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-1 lg:rounded-full lg:border lg:border-brand-navy lg:bg-brand-navy lg:p-1 lg:shadow-md`}>
          {navigationLinks.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={closeMenu} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition lg:rounded-full lg:py-2 ${isActive ? 'bg-brand-gold text-brand-navy shadow-sm' : 'text-brand-text hover:bg-brand-gold/10 hover:text-brand-navy lg:text-white lg:hover:bg-white/10 lg:hover:text-brand-gold'}`}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/book-demo" onClick={closeMenu} className={({ isActive }) => `mt-2 rounded-lg px-4 py-3 text-center text-sm font-semibold no-underline transition lg:hidden ${isActive ? 'bg-brand-gold text-brand-navy shadow-sm' : 'bg-brand-navy text-white'}`}>Book Free Demo</NavLink>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <NavLink to="/login" className={({ isActive }) => `hidden rounded-full px-3 py-2 text-sm font-semibold no-underline transition sm:block ${isActive ? 'bg-brand-gold text-brand-navy shadow-sm' : 'text-brand-navy hover:bg-brand-gold/10 hover:text-brand-gold-dark'}`}>Login</NavLink>
          <NavLink to="/book-demo" className={({ isActive }) => `hidden rounded-full px-5 py-2.5 text-sm font-semibold no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg lg:block ${isActive ? 'bg-brand-gold text-brand-navy ring-2 ring-brand-navy/10' : 'bg-gradient-to-br from-brand-navy to-brand-navy-light text-white'}`}>Book Free Demo</NavLink>
          <button type="button" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg bg-transparent lg:hidden" aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMenuOpen} aria-controls="primary-navigation" onClick={() => setIsMenuOpen((open) => !open)}>
            <span className={`h-0.5 w-6 rounded bg-brand-navy transition ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 rounded bg-brand-navy transition ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 rounded bg-brand-navy transition ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
