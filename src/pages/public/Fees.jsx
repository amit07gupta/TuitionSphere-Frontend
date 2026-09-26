import { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import SectionHeading from "../../components/common/SectionHeading";
import feesHeroImage from "../../assets/fees/fees-hero.webp";

const billingCycles = ["monthly", "annual"];

const feePlans = [
  {
    category: "Primary Foundation",
    classes: "Grades 1–5",
    monthly: "₹1,200",
    annual: "₹12,000",
    annualLabel: "per year",
    badge: "Approx. 15% Annual Saving",
    features: [
      "All primary subjects",
      "Regular test papers",
      "Daily homework support",
      "Concept-building activities",
    ],
  },
  {
    category: "Middle School",
    classes: "Grades 6–8",
    monthly: "₹1,800",
    annual: "₹18,000",
    annualLabel: "per year",
    features: [
      "Mathematics and Science",
      "English and Social Studies",
      "Weekly revision tests",
      "Doubt-clearing support",
    ],
  },
  {
    category: "Board Preparation",
    classes: "Grades 9–10",
    monthly: "₹2,500",
    annual: "₹25,000",
    annualLabel: "per year",
    badge: "Most Popular",
    featured: true,
    features: [
      "Complete CBSE and ICSE preparation",
      "Sample-paper solving",
      "Chapter-wise assessments",
      "Dedicated doubt sessions",
    ],
  },
  {
    category: "Science Stream",
    classes: "Grades 11–12",
    monthly: "₹3,500",
    annual: "₹35,000",
    annualLabel: "per year",
    features: [
      "Physics and Chemistry",
      "Mathematics or Biology",
      "Regular test series",
      "JEE/NEET foundation guidance",
    ],
  },
  {
    category: "Commerce Stream",
    classes: "Grades 11–12",
    monthly: "₹3,000",
    annual: "₹30,000",
    annualLabel: "per year",
    features: [
      "Accountancy",
      "Business Studies",
      "Economics",
      "Practical case-study sessions",
    ],
  },
  {
    category: "Economics Only",
    classes: "Grades 11–12",
    monthly: "₹1,200",
    monthlyLabel: "per subject / month",
    annual: "₹12,000",
    annualLabel: "per subject / year",
    features: [
      "Microeconomics",
      "Macroeconomics",
      "Indian Economic Development",
      "Numerical and diagram practice",
    ],
  },
];

const paymentBenefits = [
  [
    "No hidden charges",
    "The applicable plan and inclusions are explained before enrollment.",
  ],
  [
    "Flexible options",
    "Choose a monthly plan or discuss an annual/installment option with the team.",
  ],
  [
    "Payment records",
    "Students can view fee status and download official receipts through the student portal.",
  ],
  [
    "Due-date visibility",
    "Upcoming fee dates and reminders remain clear for students and parents.",
  ],
];

const enrollmentSteps = [
  [
    "01",
    "Book a free demo",
    "Experience the teaching style and discuss the student’s academic requirements.",
  ],
  [
    "02",
    "Confirm the program",
    "Select the right class, stream, subjects, batch and payment option.",
  ],
  [
    "03",
    "Complete enrollment",
    "Submit enrollment details and pay through the available online or offline method.",
  ],
];

const faqs = [
  [
    "Are the displayed fees final?",
    "The amounts shown are approximate reference fees. Final fees may vary by subjects, batch format, schedule and selected program.",
  ],
  [
    "Can we pay in installments?",
    "Yes. Monthly, annual and flexible installment options are available. The applicable schedule is confirmed before enrollment.",
  ],
  [
    "Is the demo class chargeable?",
    "No. The initial demo class is free and does not require a payment commitment.",
  ],
  [
    "What does the fee include?",
    "Inclusions vary by program and can cover classes, tests, homework support, doubt sessions and selected study resources.",
  ],
];

const paymentMethods = [
  [
    "Monthly",
    "Pay month by month with clear due-date reminders.",
    "bg-sky-100 text-sky-700",
  ],
  [
    "Annual",
    "Choose a single annual payment with applicable savings.",
    "bg-emerald-100 text-emerald-700",
  ],
  [
    "Installments",
    "Discuss a flexible schedule suited to the selected program.",
    "bg-violet-100 text-violet-700",
  ],
  [
    "Payment Modes",
    "UPI, cards, bank transfer and cash at the institute.",
    "bg-amber-100 text-amber-700",
  ],
];

function Fees() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div>
      <PageHero
        eyebrow="Simple & Transparent Fees"
        title="Clear Plans for Every Learning Stage"
        description="Compare approximate monthly and annual fee options for Grades 1 to 12, with program inclusions explained before enrollment."
        image={feesHeroImage}
        imageAlt="An academic counsellor explaining course and fee options to a parent and student"
      >
        <a
          href="#fee-plans"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy no-underline transition hover:-translate-y-0.5 hover:bg-brand-gold-dark hover:shadow-brand-hover"
        >
          Compare Plans
        </a>
        <Link
          to="/book-demo"
          className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:border-white hover:bg-white hover:text-brand-navy"
        >
          Book Free Demo
        </Link>
      </PageHero>

      <section
        id="fee-plans"
        className="scroll-mt-24 px-5 py-10 md:px-12 md:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            eyebrow="Fee Structure"
            title="Explore the right plan for your academic needs"
            description="Switch between monthly and annual estimates. Final pricing is confirmed after class, stream, subjects and batch requirements are reviewed."
          />

          <div
            className="mx-auto mb-8 flex w-fit rounded-full border border-brand-navy/10 bg-brand-cream p-1.5"
            role="group"
            aria-label="Billing cycle"
          >
            {billingCycles.map((cycle) => (
              <button
                key={cycle}
                type="button"
                aria-pressed={billingCycle === cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`min-h-11 rounded-full px-6 text-sm font-bold capitalize transition ${billingCycle === cycle ? "bg-brand-navy text-white shadow-md" : "text-brand-navy hover:bg-white"}`}
              >
                {cycle}
              </button>
            ))}
          </div>

          <div className="multi-hover-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {feePlans.map((plan, index) => {
              const price =
                billingCycle === "monthly" ? plan.monthly : plan.annual;
              const priceLabel =
                billingCycle === "monthly"
                  ? (plan.monthlyLabel ?? "per month")
                  : plan.annualLabel;

              return (
                <article
                  key={plan.category}
                  className={`interactive-glow group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:shadow-brand-hover ${plan.featured ? "border-brand-gold ring-2 ring-brand-gold/20" : index % 3 === 0 ? "border-brand-navy/10 hover:border-sky-300" : index % 3 === 1 ? "border-brand-navy/10 hover:border-emerald-300" : "border-brand-navy/10 hover:border-violet-300"}`}
                >
                  {plan.badge && (
                    <span className="absolute right-0 top-0 rounded-bl-xl bg-brand-gold px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
                    {plan.classes}
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-bold text-brand-navy">
                    {plan.category}
                  </h3>
                  <div className="mt-5 border-y border-brand-navy/10 py-5">
                    <div className="flex items-end gap-2">
                      <span
                        key={`${plan.category}-${billingCycle}`}
                        className="animate-price-in font-heading text-4xl font-bold tracking-tight text-brand-navy transition duration-300 group-hover:text-brand-gold-dark"
                      >
                        {price}
                      </span>
                      <span className="pb-1 text-xs text-brand-muted">
                        {priceLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-brand-muted">
                      Approximate fee · subject to final confirmation
                    </p>
                  </div>
                  <ul className="my-5 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-brand-text"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold-dark">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/book-demo?program=${encodeURIComponent(plan.category)}&billing=${billingCycle}&price=${encodeURIComponent(price)}`}
                    className={`group/cta inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold no-underline transition hover:-translate-y-0.5 hover:shadow-lg ${plan.featured ? "bg-brand-gold text-brand-navy hover:bg-brand-gold-dark" : "bg-brand-navy text-white hover:bg-brand-navy-light"}`}
                  >
                    Book a Free Demo{" "}
                    <span
                      aria-hidden="true"
                      className="transition group-hover/cta:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                  <p className="mt-2 text-center text-[10px] font-medium text-brand-muted">
                    No payment required to attend the demo
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-6 max-w-4xl rounded-xl border border-brand-gold/25 bg-brand-gold/10 p-4 text-center text-xs leading-5 text-brand-text">
            Fees displayed above are approximate planning figures. Applicable
            taxes, optional resources, subject combinations and customized
            schedules may affect the final amount.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream px-5 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            eyebrow="Flexible Payments"
            title="Choose how you prefer to pay"
            description="Clear payment schedules and multiple payment modes make enrollment easier for families."
          />
          <div className="multi-hover-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paymentMethods.map(([title, description, badgeStyle], index) => (
              <article
                key={title}
                className="group rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:shadow-brand-hover"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-heading text-xs font-bold transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${badgeStyle}`}
                >
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-heading font-semibold text-brand-navy">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-brand-muted">
            <span>✓ Secure payment records</span>
            <span>✓ Digital receipts</span>
            <span>✓ Clear due dates</span>
            <span>✓ No hidden charges</span>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            dark
            eyebrow="Parent-Friendly Billing"
            title="Fee information without surprises"
            description="A transparent process helps families understand what they are selecting, when payment is due and what support is included."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paymentBenefits.map(([title, description], index) => (
              <article
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-brand-gold/45 hover:bg-white/[0.08]"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold font-heading text-sm font-bold text-brand-navy transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-cream px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            eyebrow="From Demo to Enrollment"
            title="A simple three-step process"
          />
          <div className="multi-hover-grid grid grid-cols-1 gap-5 md:grid-cols-3">
            {enrollmentSteps.map(([step, title, description]) => (
              <article
                key={step}
                className="group rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:border-brand-gold/40 hover:shadow-brand-hover"
              >
                <div className="mb-5 flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy font-heading text-sm font-bold text-brand-gold">
                    {step}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/60 to-transparent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-brand-navy">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-brand-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-gold-dark">
              Common Questions
            </p>
            <h2 className="font-heading text-3xl font-bold leading-tight text-brand-navy md:text-4xl">
              Before you choose a fee plan
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted">
              Need help understanding subject combinations or batch options?
              Book a demo and discuss everything before enrollment.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-xl border border-brand-navy/10 bg-white p-5 shadow-brand-card open:border-brand-gold/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-sm font-semibold text-brand-navy">
                  {question}
                  <span className="text-xl text-brand-gold-dark transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-brand-navy/10 pt-3 text-sm leading-6 text-brand-muted">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 md:px-12 md:pb-14">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-brand-gold to-brand-gold-dark p-7 md:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-navy/70">
              Start Without Commitment
            </p>
            <h2 className="font-heading text-3xl font-bold text-brand-navy">
              Understand the program before you pay
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-navy/80">
              Attend a free demo, discuss the student’s needs and receive a
              clear fee recommendation for the selected program.
            </p>
          </div>
          <Link
            to="/book-demo"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-xl sm:w-auto"
          >
            Book Free Demo Class
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Fees;
