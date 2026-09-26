function SectionHeading({ eyebrow, title, description, align = 'center', dark = false, compact = false }) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center';
  const gradient = dark
    ? 'from-white via-brand-gold to-white'
    : 'from-brand-navy via-brand-navy-light to-brand-gold-dark';

  return (
    <div className={`${compact ? 'mb-7' : 'mb-10'} flex flex-col ${alignment}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
          {eyebrow}
        </p>
      )}
      <h2 className={`animated-gradient-text bg-gradient-to-r ${gradient} bg-clip-text font-heading text-3xl font-bold tracking-tight text-transparent md:text-4xl`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 max-w-2xl text-sm leading-7 md:text-base ${dark ? 'text-slate-300' : 'text-brand-muted'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
