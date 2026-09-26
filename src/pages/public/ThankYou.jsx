import { Link, useSearchParams } from "react-router-dom";

function ThankYou() {
  const [searchParams] = useSearchParams();
  const isInquiry = searchParams.get("type") === "inquiry";

  return (
    <section className="flex min-h-[calc(100svh-76px)] items-center bg-[radial-gradient(circle_at_80%_20%,rgba(232,163,61,0.2),transparent_28%),linear-gradient(135deg,#faf8f4,#f0ece2)] px-5 py-10 md:px-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-brand-navy/10 bg-white p-7 text-center shadow-brand-hover md:p-10">
        <span
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700 shadow-lg"
          aria-hidden="true"
        >
          ✓
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold-dark">
          Request Received
        </p>
        <h1 className="mt-3 font-heading text-[34px] font-bold leading-tight text-brand-navy md:text-5xl">
          Thank you for contacting TuitionSphere
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-brand-muted md:text-base">
          {isInquiry
            ? "Your inquiry has been received. Our academic support team will contact you during your preferred time."
            : "Your free demo request has been received. Our team will contact you to confirm the program and batch."}
        </p>
        <div className="mt-6 rounded-2xl bg-brand-cream p-5">
          <p className="text-sm font-semibold text-brand-navy">
            What happens next?
          </p>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Expect a response within one working day. For faster assistance, you
            can also chat with the team on WhatsApp.
          </p>
        </div>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white no-underline transition hover:-translate-y-1 hover:shadow-lg"
          >
            Continue on WhatsApp
          </a>
          <Link
            to="/courses"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-brand-navy px-6 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-navy hover:text-white"
          >
            Explore Courses
          </Link>
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-brand-muted no-underline hover:text-brand-gold-dark"
        >
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}

export default ThankYou;
