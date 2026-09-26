function PageHero({ eyebrow, title, description, children, image, imageAlt = '', imagePosition = 'object-[68%_center]', overlayClassName = 'from-brand-navy via-brand-navy/90 to-brand-navy/15', className = '' }) {
  if (image) {
    return (
      <section className={`relative isolate overflow-hidden bg-brand-navy py-12 md:py-14 ${className}`}>
        <img src={image} alt={imageAlt} className={`absolute inset-0 -z-20 h-full w-full object-cover ${imagePosition}`} />
        <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${overlayClassName}`} />
        <div className="mx-auto w-[min(calc(100%-40px),1200px)] md:w-[min(calc(100%-96px),1200px)]">
          <div className="max-w-2xl text-left">
            {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">{eyebrow}</p>}
            <h1 className="font-heading text-[34px] font-bold leading-tight tracking-[-0.035em] text-white md:text-5xl lg:text-[52px]">{title}</h1>
            {description && <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 md:text-lg">{description}</p>}
            {children && <div className="mt-6 flex flex-wrap items-center justify-start gap-3.5">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden bg-[radial-gradient(circle_at_85%_20%,rgba(232,163,61,0.2),transparent_28%),linear-gradient(135deg,#faf8f4_0%,#f0ece2_100%)] py-16 md:py-20 ${className}`}>
      <div aria-hidden="true" className="absolute -left-20 -top-20 h-56 w-56 rounded-full border-[40px] border-brand-navy/5" />
      <div className="relative z-10 mx-auto w-[min(calc(100%-40px),820px)] text-center md:w-[min(calc(100%-96px),820px)]">
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold-dark">{eyebrow}</p>}
        <h1 className="font-heading text-[34px] font-bold leading-tight tracking-[-0.035em] text-brand-navy md:text-5xl lg:text-[54px]">{title}</h1>
        {description && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-muted md:text-lg">{description}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">{children}</div>}
      </div>
    </section>
  );
}

export default PageHero;
