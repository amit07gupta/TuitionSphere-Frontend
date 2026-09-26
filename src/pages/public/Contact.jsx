import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import SocialLinks from '../../components/common/SocialLinks';
import contactHeroImage from '../../assets/contact/contact-hero.webp';
import useDemoSetup from '../../hooks/useDemoSetup';
import { createInquiry } from '../../services/inquiryApi';

const contactOptions = [
  {
    number: '01',
    label: 'Call Us',
    value: '+91 98765 43210',
    detail: 'For courses, batches and enrollment support',
    href: 'tel:+919876543210',
  },
  {
    number: '02',
    label: 'WhatsApp',
    value: 'Chat with our team',
    detail: 'Quick questions and demo-class assistance',
    href: 'https://wa.me/919876543210',
    external: true,
  },
  {
    number: '03',
    label: 'Email',
    value: 'info@tuitionsphere.com',
    detail: 'Detailed academic and partnership inquiries',
    href: 'mailto:info@tuitionsphere.com',
  },
];

const supportPoints = [
  ['Course guidance', 'Help choosing the right grade, stream and subject combination.'],
  ['Demo scheduling', 'Find an available demo batch that suits the student’s schedule.'],
  ['Fee clarification', 'Understand approximate fees, inclusions and payment options.'],
  ['Enrollment support', 'Get assistance with the next steps after the demo class.'],
];

const contactNamePattern = /^[A-Za-z.' -]+$/;
const inputClass = 'h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-brand-text outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15';

function getContactReviewItems(details) {
  return [
    ['Name', details.name], ['Phone', `+91 ${details.phone}`], ['Email', details.email || 'Not provided'], ['Student Grade', `Grade ${details.grade}`],
    ['Inquiry Type', details.inquiryType], ['Contact Method', details.contactMethod], ['Contact Time', details.contactTime], ['Learning Preference', details.learningMode],
  ];
}

function FieldError({ errors, name }) {
  return errors[name] ? <span className="text-xs font-medium text-red-600" role="alert">{errors[name]}</span> : null;
}

function validateContactForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  const nextErrors = {};
  const name = String(values.name ?? '').trim();

  if (!name) nextErrors.name = 'Parent or student name is required.';
  else if (name.length < 2) nextErrors.name = 'Name must contain at least 2 characters.';
  else if (!contactNamePattern.test(name)) nextErrors.name = 'Name can contain letters, spaces, apostrophes and hyphens only.';

  if (!values.phone) nextErrors.phone = 'Phone number is required.';
  else if (!/^\d{10}$/.test(String(values.phone))) nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.';

  if (values.email && !form.elements.email.validity.valid) nextErrors.email = 'Enter a valid email address.';
  if (!values.grade) nextErrors.grade = 'Select the student grade.';
  if (!values.inquiryType) nextErrors.inquiryType = 'Select an inquiry type.';
  if (!values.contactMethod) nextErrors.contactMethod = 'Select a preferred contact method.';
  if (!values.contactTime) nextErrors.contactTime = 'Select a preferred contact time.';
  if (!form.elements.consent.checked) nextErrors.consent = 'Please accept the contact consent to continue.';

  return nextErrors;
}

function Contact() {
  const demoSetups = useDemoSetup(true);
  const gradeOptions = useMemo(() => Array.from(new Map(demoSetups.filter((setup) => setup.grade).map((setup) => [setup.grade.id, setup.grade])).values()).sort((a, b) => Number(a.value) - Number(b.value)), [demoSetups]);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [reviewDetails, setReviewDetails] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateContactForm(event.currentTarget);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalidName = Object.keys(nextErrors)[0];
      window.requestAnimationFrame(() => formRef.current?.elements[firstInvalidName]?.focus());
      return;
    }

    setErrors({});
    setReviewDetails(Object.fromEntries(new FormData(event.currentTarget).entries()));
  };

  const confirmSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const grade = gradeOptions.find((item) => String(item.value) === String(reviewDetails.grade));
      await createInquiry({
        name: String(reviewDetails.name).trim(),
        email: String(reviewDetails.email ?? '').trim(),
        phone: String(reviewDetails.phone),
        gradeId: grade.id,
        inquiryType: String(reviewDetails.inquiryType),
        message: String(reviewDetails.message ?? '').trim(),
        contactMethod: String(reviewDetails.contactMethod),
        preferredTime: String(reviewDetails.contactTime),
        learningMode: String(reviewDetails.learningMode),
      });
      navigate('/thank-you?type=inquiry');
    } catch (error) {
      setSubmitError(error.message);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name } = event.target;
    if (name && errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  return (
    <div>
      <div className="flex min-h-[calc(100svh-64px)] flex-col md:min-h-[calc(100svh-76px)]">
        <PageHero
        eyebrow="Contact TuitionSphere"
        title="Let’s Find the Right Learning Path"
        description="Ask about courses, fees, batches or a free demo class. Our academic support team is here to guide students and parents clearly."
        image={contactHeroImage}
        imageAlt="A TuitionSphere academic counsellor assisting a parent and student"
        className="flex min-h-[320px] flex-none items-center py-8 md:h-[340px] md:min-h-0 md:py-7"
      >
        <a href="#contact-form" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy no-underline transition hover:-translate-y-0.5 hover:bg-brand-gold-dark hover:shadow-brand-hover">
          Send an Inquiry
        </a>
        <Link to="/book-demo" className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:border-white hover:bg-white hover:text-brand-navy">
          Book Free Demo
        </Link>
        </PageHero>

        <section className="shrink-0 px-5 py-4 md:px-12 md:py-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-dark">Get In Touch</p><h2 className="mt-1 font-heading text-2xl font-bold text-brand-navy md:text-[27px]">Choose the easiest way to reach us</h2></div><p className="max-w-xl text-xs leading-5 text-brand-muted md:text-right">Course guidance, batch availability, fee information and enrollment support—all in one place.</p></div>
            <div className="multi-hover-grid grid grid-cols-1 gap-3 md:grid-cols-3">
            {contactOptions.map((option, index) => (
              <a key={option.label} href={option.href} target={option.external ? '_blank' : undefined} rel={option.external ? 'noopener noreferrer' : undefined} className={`interactive-glow group rounded-xl border border-brand-navy/10 bg-white p-3.5 text-brand-text no-underline shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover ${index === 0 ? 'hover:border-sky-300 hover:bg-sky-50' : index === 1 ? 'hover:border-emerald-300 hover:bg-emerald-50' : 'hover:border-violet-300 hover:bg-violet-50'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy font-heading text-[10px] font-bold text-brand-gold">{option.number}</span>
                  <span className="text-xl text-brand-gold-dark transition group-hover:translate-x-1" aria-hidden="true">↗</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-dark">{option.label}</p>
                <h2 className="mt-1 break-words font-heading text-base font-semibold text-brand-navy">{option.value}</h2>
                <p className="mt-1.5 text-xs leading-5 text-brand-muted">{option.detail}</p>
              </a>
            ))}
            </div>
            <div className="mt-3 flex flex-col items-center justify-between gap-2 rounded-xl border border-brand-navy/10 bg-brand-cream p-2.5 text-center sm:flex-row sm:text-left"><div><h2 className="font-heading text-sm font-semibold text-brand-navy">Follow TuitionSphere</h2><p className="text-[11px] text-brand-muted">Academic tips, course updates and batch announcements.</p></div><SocialLinks showLabels /></div>
          </div>
        </section>
      </div>

      <section id="contact-form" className="scroll-mt-24 bg-brand-cream px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-gold-dark">How Can We Help?</p>
            <h2 className="font-heading text-3xl font-bold leading-tight text-brand-navy md:text-4xl">Tell us what the student needs</h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted md:text-base">Share a few details and the academic support team can guide you toward the most relevant course, batch or next step.</p>

            <div className="mt-7 space-y-4">
              {supportPoints.map(([title, description]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold-dark">✓</span>
                  <div><h3 className="text-sm font-semibold text-brand-navy">{title}</h3><p className="mt-1 text-sm leading-6 text-brand-muted">{description}</p></div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-brand-navy p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold">Class Hours</p>
              <div className="mt-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm"><span className="text-slate-300">Monday–Saturday</span><strong>8:00 AM–8:00 PM</strong></div>
              <div className="flex items-center justify-between gap-4 pt-3 text-sm"><span className="text-slate-300">Sunday</span><strong>Closed</strong></div>
            </div>
          </div>

          <form ref={formRef} noValidate onSubmit={handleSubmit} onChange={handleChange} className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-brand-hover transition duration-300 hover:border-brand-gold/30 hover:shadow-2xl md:p-8">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-brand-navy">Send an inquiry</h2>
              <p className="mt-2 text-sm text-brand-muted">Fields marked with * are required.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Parent/Student Name *
                <input required minLength="2" pattern="[A-Za-z.' -]+" name="name" autoComplete="name" placeholder="Enter full name" aria-invalid={Boolean(errors.name)} className={`${inputClass} ${errors.name ? 'border-red-400 ring-4 ring-red-100' : ''}`} />
                <FieldError errors={errors} name="name" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Phone Number *
                <input required name="phone" type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9]{10}" maxLength="10" placeholder="10-digit mobile number" aria-invalid={Boolean(errors.phone)} className={`${inputClass} ${errors.phone ? 'border-red-400 ring-4 ring-red-100' : ''}`} />
                <FieldError errors={errors} name="phone" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Email Address
                <input name="email" type="email" autoComplete="email" placeholder="Enter email address" aria-invalid={Boolean(errors.email)} className={`${inputClass} ${errors.email ? 'border-red-400 ring-4 ring-red-100' : ''}`} />
                <FieldError errors={errors} name="email" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Student Grade *
                <select required name="grade" defaultValue="" aria-invalid={Boolean(errors.grade)} className={`${inputClass} ${errors.grade ? 'border-red-400 ring-4 ring-red-100' : ''}`}>
                  <option value="" disabled>Select grade</option>
                  {gradeOptions.map((grade) => <option key={grade.id} value={grade.value}>{grade.name}</option>)}
                </select>
                <FieldError errors={errors} name="grade" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy sm:col-span-2">
                Inquiry Type *
                <select required name="inquiryType" defaultValue="" aria-invalid={Boolean(errors.inquiryType)} className={`${inputClass} ${errors.inquiryType ? 'border-red-400 ring-4 ring-red-100' : ''}`}>
                  <option value="" disabled>Select inquiry type</option>
                  <option value="course">Course guidance</option>
                  <option value="demo">Demo class</option>
                  <option value="fees">Fee information</option>
                  <option value="batch">Batch availability</option>
                  <option value="other">Other inquiry</option>
                </select>
                <FieldError errors={errors} name="inquiryType" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy sm:col-span-2">
                Message
                <textarea name="message" rows="5" placeholder="Tell us about subjects, learning goals or preferred timing" className="resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal leading-6 text-brand-text outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Preferred Contact Method *
                <select required name="contactMethod" defaultValue="" aria-invalid={Boolean(errors.contactMethod)} className={`${inputClass} ${errors.contactMethod ? 'border-red-400 ring-4 ring-red-100' : ''}`}><option value="" disabled>Select contact method</option><option value="call">Phone call</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select>
                <FieldError errors={errors} name="contactMethod" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
                Preferred Contact Time *
                <select required name="contactTime" defaultValue="" aria-invalid={Boolean(errors.contactTime)} className={`${inputClass} ${errors.contactTime ? 'border-red-400 ring-4 ring-red-100' : ''}`}><option value="" disabled>Select preferred time</option><option value="morning">Morning · 9 AM–12 PM</option><option value="afternoon">Afternoon · 12 PM–4 PM</option><option value="evening">Evening · 4 PM–8 PM</option></select>
                <FieldError errors={errors} name="contactTime" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy sm:col-span-2">
                Learning Preference
                <select name="learningMode" defaultValue="flexible" className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-brand-text outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15"><option value="flexible">Flexible / Need guidance</option><option value="offline">Offline classroom</option><option value="online">Online live classes</option></select>
              </label>
              <label className={`flex flex-wrap items-start gap-3 rounded-xl border bg-brand-cream p-4 text-sm leading-6 text-brand-text sm:col-span-2 ${errors.consent ? 'border-red-400 ring-4 ring-red-100' : 'border-brand-navy/10'}`}><input required type="checkbox" name="consent" aria-invalid={Boolean(errors.consent)} className="mt-1 h-4 w-4 shrink-0 accent-brand-navy" /><span className="flex-1">I agree to be contacted regarding courses, fees, batch availability and demo scheduling.</span><span className="w-full pl-7"><FieldError errors={errors} name="consent" /></span></label>
            </div>

            <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-brand-hover disabled:cursor-wait disabled:opacity-75 sm:w-auto">
              Review Details →
            </button>
            <p className="mt-4 text-xs leading-5 text-brand-muted">We use these details only to respond to your inquiry and help with course or demo-class guidance.</p>
          </form>
        </div>
      </section>

      {reviewDetails && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contact-review-title">
        <div className="max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">Final Check</p>
          <h2 id="contact-review-title" className="mt-1 font-heading text-2xl font-bold text-brand-navy">Review your inquiry</h2>
          <p className="mt-2 text-sm text-brand-muted">Check your details once before sending them to TuitionSphere.</p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {getContactReviewItems(reviewDetails).map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold capitalize text-brand-navy">{value}</p></div>)}
            {reviewDetails.message && <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Message</p><p className="mt-1 text-sm leading-6 text-brand-navy">{reviewDetails.message}</p></div>}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setReviewDetails(null)} disabled={isSubmitting} className="min-h-11 rounded-xl border border-slate-300 px-6 text-sm font-semibold text-brand-navy transition hover:border-brand-navy disabled:opacity-60">← Edit Details</button>
            <button type="button" onClick={confirmSubmit} disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-6 text-sm font-bold text-brand-navy transition hover:bg-brand-gold-dark disabled:cursor-wait disabled:opacity-70">{isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-navy/30 border-t-brand-navy" />}{isSubmitting ? 'Submitting…' : 'Confirm & Submit'}</button>
          </div>
          {submitError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</p>}
        </div>
      </div>}

      <section className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-brand-navy/10 shadow-brand-hover lg:grid-cols-[1fr_0.9fr]">
          <div className="relative min-h-72 overflow-hidden bg-[radial-gradient(circle_at_30%_40%,rgba(232,163,61,0.22),transparent_25%),linear-gradient(135deg,#1b2a4a,#2d4270)] p-7 text-white md:p-10">
            <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full border-[40px] border-white/5" />
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">Visit TuitionSphere</p>
            <h2 className="mt-3 max-w-lg font-heading text-3xl font-bold">Academic guidance in a welcoming environment</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">Meet the team at Gomti Nagar, Lucknow. Please call before visiting so we can arrange the right academic counsellor for your requirement.</p>
            <a href="tel:+919876543210" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-gold-dark">Call Before Visiting</a>
          </div>
          <div className="flex min-h-72 flex-col items-center justify-center bg-brand-cream p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/15 font-heading text-2xl font-bold text-brand-gold-dark">TS</span>
            <h3 className="mt-5 font-heading text-xl font-semibold text-brand-navy">Gomti Nagar, Lucknow</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-brand-muted">2nd Floor, Shiksha Plaza, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Gomti+Nagar+Lucknow" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-brand-navy px-5 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-navy hover:text-white">Open in Maps ↗</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
