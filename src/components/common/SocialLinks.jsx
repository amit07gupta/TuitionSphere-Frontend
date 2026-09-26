const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/tuitionsphere/',
    color: 'text-pink-500',
    hover: 'hover:border-pink-400 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white',
    icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/tuitionsphere/',
    color: 'text-[#1877F2]',
    hover: 'hover:border-blue-500 hover:bg-[#1877F2] hover:text-white',
    icon: <path d="M14 8h3V4.3c-.5-.1-2.2-.3-4.2-.3C8.7 4 6 6.5 6 11v3H2v4h4v10h5V18h4l.7-4H11v-2.6C11 9.4 11.8 8 14 8Z" fill="currentColor" stroke="none" />,
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/919876543210?text=Hello%20TuitionSphere%2C%20I%20would%20like%20to%20know%20more.',
    color: 'text-[#25D366]',
    hover: 'hover:border-emerald-500 hover:bg-[#25D366] hover:text-white',
    icon: <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a12 12 0 0 0 5.4 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.5-8.4Zm-8.4 18.2c-1.7 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.4 4.7Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.8-.9-3-1.6-4.2-3.7-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.2-.2-.5-.3-.8-.4Z" fill="currentColor" stroke="none" />,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tuitionsphere/',
    color: 'text-[#0A66C2]',
    hover: 'hover:border-blue-600 hover:bg-[#0A66C2] hover:text-white',
    icon: <path d="M5.3 7.9H1.4V20h3.9V7.9ZM3.4 2A2.3 2.3 0 1 0 3.4 6.6 2.3 2.3 0 0 0 3.4 2ZM20.6 13.1c0-3.7-2-5.5-4.7-5.5-2.2 0-3.1 1.2-3.7 2V7.9H8.3V20h3.9v-6c0-1.6.3-3.2 2.3-3.2 2 0 2 1.8 2 3.3V20h4v-6.9Z" fill="currentColor" stroke="none" />,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/tuitionsphere',
    color: 'text-[#1DA1F2]',
    hover: 'hover:border-sky-400 hover:bg-[#1DA1F2] hover:text-white',
    icon: <path d="M23.5 4.6c-.9.4-1.8.6-2.8.8a4.9 4.9 0 0 0 2.1-2.7c-.9.5-1.9.9-3 1.1A4.8 4.8 0 0 0 11.5 7c0 .4 0 .7.1 1.1A13.6 13.6 0 0 1 1.7 3c-.4.7-.7 1.5-.7 2.4 0 1.7.9 3.2 2.1 4.1-.8 0-1.5-.2-2.2-.6v.1c0 2.3 1.7 4.3 3.9 4.7-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 1.9 2.4 3.3 4.5 3.3A9.7 9.7 0 0 1 1.2 19H0a13.6 13.6 0 0 0 7.4 2.2c8.9 0 13.7-7.3 13.7-13.7v-.6c.9-.7 1.7-1.5 2.4-2.3Z" fill="currentColor" stroke="none" />,
  },
];

function SocialLinks({ dark = false, showLabels = false }) {
  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="TuitionSphere social media links">
      {socialLinks.map((social) => (
        <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.name} - opens in a new tab`} className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'border-white/15 bg-white/[0.06]' : 'border-brand-navy/10 bg-white'} ${social.color} ${social.hover}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">{social.icon}</svg>
          {showLabels && <span>{social.name}</span>}
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
