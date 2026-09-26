import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import anjaliMehta from "../../assets/mentors/anjali-mehta.webp";
import rajeshTiwari from "../../assets/mentors/rajesh-tiwari.webp";
import sureshNair from "../../assets/mentors/suresh-nair.webp";
import SectionHeading from "../../components/common/SectionHeading";
import homeHeroImage from "../../assets/home/home-hero-v2.webp";
import parentProgressImage from "../../assets/about/parent-progress-meeting.webp";
import collaborativeAssessmentImage from "../../assets/home/hero-carousel/collaborative-assessment.webp";
import mentorFeedbackImage from "../../assets/home/mentor-feedback.webp";

const heroSlides = [
  { image: homeHeroImage, alt: 'A mentor guiding students during a focused small-group class' },
  { image: parentProgressImage, alt: 'A mentor discussing a student progress plan with a parent and learner' },
  { image: collaborativeAssessmentImage, alt: 'Students solving an assessment together with mentor support' },
];

const stats = [
  [
    "1–12",
    "Complete Grade Coverage",
    "Structured academic support from primary to senior secondary.",
    "hover:border-sky-300 hover:bg-sky-50",
  ],
  [
    "4",
    "Learning Stages",
    "Age-appropriate programs that grow with every learner.",
    "hover:border-emerald-300 hover:bg-emerald-50",
  ],
  [
    "3",
    "Senior Secondary Tracks",
    "Focused Science, Commerce and Economics pathways.",
    "hover:border-violet-300 hover:bg-violet-50",
  ],
  [
    "Free",
    "Initial Demo Class",
    "Experience the teaching approach before enrollment.",
    "hover:border-amber-300 hover:bg-amber-50",
  ],
];

const courses = [
  [
    "01",
    "Grades 1-5",
    "Primary Foundation",
    "English, Hindi/second language, Mathematics, EVS, Computer Studies and General Knowledge with conceptual clarity and homework support.",
    "hover:border-amber-300 hover:from-amber-50 hover:to-orange-50",
    "bg-amber-100 text-amber-800",
    "group-hover:text-orange-500",
  ],
  [
    "02",
    "Grades 6-10",
    "Middle & Board Prep",
    "Board-aligned English, languages, Mathematics, Science, Social Studies and Computer support with regular practice and tests.",
    "hover:border-sky-300 hover:from-sky-50 hover:to-indigo-50",
    "bg-sky-100 text-sky-800",
    "group-hover:text-sky-600",
  ],
  [
    "03",
    "Grades 11-12",
    "Senior Secondary",
    "Science, Commerce and specialized Economics tracks with subject mastery and exam foundations.",
    "hover:border-violet-300 hover:from-violet-50 hover:to-fuchsia-50",
    "bg-violet-100 text-violet-800",
    "group-hover:text-violet-600",
  ],
];

const steps = [
  [
    "Book a Free Demo",
    "Fill a short form and our team will contact you to schedule a convenient time.",
  ],
  [
    "Attend the Demo Class",
    "Experience our teaching style first-hand with zero cost and no obligation.",
  ],
  [
    "Enroll & Pay Fees",
    "Select a batch and complete enrollment with full fee transparency.",
  ],
  [
    "Start Learning",
    "Follow a structured plan with classes, practice, assessments and mentor guidance.",
  ],
];

const benefits = [
  [
    "Focused Batches",
    "Small-group teaching is designed to give students more space to ask questions and resolve learning gaps.",
    "hover:border-sky-400/60 hover:bg-sky-400/10",
    "bg-sky-400/15 text-sky-300",
    "text-sky-300",
  ],
  [
    "Regular Assessment",
    "Structured practice and topic tests help mentors identify where a student needs additional support.",
    "hover:border-emerald-400/60 hover:bg-emerald-400/10",
    "bg-emerald-400/15 text-emerald-300",
    "text-emerald-300",
  ],
  [
    "Subject Guidance",
    "Stream-focused teaching supports school concepts, numerical practice and examination preparation.",
    "hover:border-violet-400/60 hover:bg-violet-400/10",
    "bg-violet-400/15 text-violet-300",
    "text-violet-300",
  ],
  [
    "Transparent Planning",
    "Programs, approximate fees and inclusions are discussed clearly before enrollment.",
    "hover:border-amber-400/60 hover:bg-amber-400/10",
    "bg-amber-400/15 text-amber-300",
    "text-amber-300",
  ],
];

const mentors = [
  [
    rajeshTiwari,
    "Rajesh Tiwari",
    "Physics & Mathematics",
    "M.Sc. Physics · 9+ Years Experience",
    "Concept clarity, numerical practice and senior-secondary foundations",
    "hover:border-sky-300 hover:from-sky-50 hover:to-white",
    "group-hover:ring-sky-300",
  ],
  [
    anjaliMehta,
    "Anjali Mehta",
    "Chemistry & Biology",
    "M.Sc. Chemistry · 8+ Years Experience",
    "Visual explanation, structured revision and application-based learning",
    "hover:border-emerald-300 hover:from-emerald-50 hover:to-white",
    "group-hover:ring-emerald-300",
  ],
  [
    sureshNair,
    "Suresh Nair",
    "Accountancy & Economics",
    "M.Com. · 10+ Years Experience",
    "Ledger practice, case studies and analytical problem-solving",
    "hover:border-violet-300 hover:from-violet-50 hover:to-white",
    "group-hover:ring-violet-300",
  ],
];

const portalFeatures = [
  [
    "Schedule",
    "Upcoming classes, batch timings and important academic alerts.",
    "bg-sky-100 text-sky-700",
  ],
  [
    "Study Material",
    "Subject-wise notes, practice sheets and revision resources.",
    "bg-emerald-100 text-emerald-700",
  ],
  [
    "Assignments",
    "Homework tasks, submission information and practice tracking.",
    "bg-violet-100 text-violet-700",
  ],
  [
    "Test Performance",
    "Scores, report cards and subject-level progress visibility.",
    "bg-amber-100 text-amber-700",
  ],
  [
    "Fee Records",
    "Payment status, upcoming dues and downloadable receipts.",
    "bg-rose-100 text-rose-700",
  ],
  [
    "Parent Updates",
    "Attendance visibility and actionable mentor feedback.",
    "bg-indigo-100 text-indigo-700",
  ],
];

const familyExpectations = [
  [
    "Clear academic visibility",
    "Regular assessment and mentor feedback are designed to help families understand progress and next steps.",
  ],
  [
    "Preparation with purpose",
    "Practice moves from concept-building to guided questions, revision and exam-pattern application.",
  ],
];

const trustAvatarLetters = ["A", "R", "S"];

function BenefitIcon({ index }) {
  const paths = [
    <path
      key="users"
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />,
    <path key="chart" d="M4 19V9m6 10V5m6 14v-7m5 7H2" />,
    <path
      key="book"
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Zm0 0A2.5 2.5 0 0 0 6.5 22H20"
    />,
    <path
      key="plan"
      d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
    />,
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[index]}
    </svg>
  );
}

function Home() {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  useEffect(() => {
    if (heroPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setActiveHeroSlide((current) => (current + 1) % heroSlides.length), 4500);
    return () => window.clearInterval(timer);
  }, [heroPaused]);


  return (
    <div>
      <section className="relative flex min-h-[calc(100svh-64px)] overflow-hidden bg-[radial-gradient(circle_at_90%_10%,rgba(232,163,61,0.34),transparent_30%),linear-gradient(118deg,#172642_0%,#263d68_62%,#9b5d2d_100%)] md:min-h-[calc(100svh-76px)]">
        <div
          aria-hidden="true"
          className="absolute -bottom-52 -left-44 h-[430px] w-[430px] rounded-full border-[78px] border-white/[0.035]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-brand-gold/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-[4%] top-[10%] hidden h-28 w-28 bg-[radial-gradient(circle,#f5c36f_1.5px,transparent_1.5px)] bg-[length:13px_13px] opacity-40 lg:block"
        />
        <div className="relative z-10 mx-auto grid w-[min(calc(100%-40px),1180px)] grid-cols-1 items-center gap-7 py-8 md:w-[min(calc(100%-96px),1180px)] md:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-8">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
              <span className="text-brand-gold">●</span>Admissions Open for
              Grades 1–12
            </div>
            <h1 className="font-heading text-[34px] font-bold leading-[1.04] tracking-[-0.045em] text-white sm:text-[48px] lg:text-[58px]">
              Expert tuition for{" "}
              <span className="block text-brand-gold">clearer learning</span>
              <span className="block">and stronger results</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-200 lg:mx-0 lg:text-base">
              Structured coaching, experienced mentors and regular assessments
              across Foundation, Science, Commerce and Economics programs.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-100 lg:justify-start">
              <span className="rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2">
                CBSE & ICSE
              </span>
              <span className="rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2">
                All Core Subjects
              </span>
              <span className="rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2">
                Regular Assessments
              </span>
            </div>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/book-demo"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 font-semibold text-brand-navy no-underline transition hover:-translate-y-0.5 hover:bg-brand-gold-dark hover:shadow-brand-hover"
              >
                Book Free Demo
              </Link>
              <Link
                to="/courses"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 font-semibold text-white no-underline transition hover:bg-white hover:text-brand-navy"
              >
                Explore Programs
              </Link>
            </div>
            <div className="mt-5 flex items-center justify-center gap-3 text-left lg:justify-start">
              <div className="flex" aria-hidden="true">
                {trustAvatarLetters.map((letter, index) => (
                  <span
                    key={letter}
                    className={`-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-brand-navy text-xs font-bold text-white first:ml-0 ${index === 0 ? "bg-brand-gold-dark" : index === 1 ? "bg-sky-600" : "bg-violet-600"}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div>
                <strong className="block text-sm text-white">
                  Trusted academic support
                </strong>
                <p className="text-xs text-slate-300">
                  Small batches and individual mentor attention
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[445px] lg:max-w-[520px]"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocusCapture={() => setHeroPaused(true)}
            onBlurCapture={() => setHeroPaused(false)}
          >
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-full border border-white/15"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-full bg-gradient-to-br from-brand-gold via-amber-300 to-orange-400 shadow-[0_30px_80px_rgba(8,19,39,0.38)]"
            />
            <div className="absolute inset-1 overflow-hidden rounded-full border-[8px] border-white/95">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.image}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeHeroSlide === index ? "z-[1] opacity-100" : "z-0 opacity-0"}`}
                  aria-hidden={activeHeroSlide !== index}
                >
                  <img
                    src={slide.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
                  />
                  <img
                    src={slide.image}
                    alt={activeHeroSlide === index ? slide.alt : ""}
                    className={`relative h-full w-full object-contain ${activeHeroSlide === index ? "hero-image-pop" : ""}`}
                  />
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-tr from-brand-navy/20 via-transparent to-brand-gold/10" />
            </div>
            <div
              className="absolute -bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2"
              aria-label="Choose hero image"
            >
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setActiveHeroSlide(index)}
                  aria-current={activeHeroSlide === index ? "true" : undefined}
                  aria-label={`Show hero image ${index + 1}`}
                  className={`h-2.5 rounded-full border border-white/70 transition-all ${activeHeroSlide === index ? "w-7 bg-brand-gold" : "w-2.5 bg-white/55 hover:bg-white"}`}
                />
              ))}
            </div>
            <div className="hero-float-slow absolute -left-3 top-[12%] z-20 hidden rounded-2xl border border-white/20 bg-white px-4 py-3 shadow-[0_16px_36px_rgba(8,19,39,0.28)] sm:block lg:-left-8">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
                Grades 1–12
              </span>
              <strong className="mt-1 block font-heading text-sm text-brand-navy">
                Complete Support
              </strong>
            </div>
            <div className="hero-float-reverse absolute -bottom-2 right-0 z-20 hidden rounded-2xl border border-white/20 bg-white px-4 py-3 shadow-[0_16px_36px_rgba(8,19,39,0.28)] sm:block lg:-right-5">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                <i className="h-2 w-2 rounded-full bg-emerald-500" />
                Mentor Guided
              </span>
              <strong className="mt-1 block font-heading text-sm text-brand-navy">
                Focused Small Batches
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white px-5 py-8 md:px-12 md:py-10"
        aria-label="Academic snapshot"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold-dark">
              Academic Snapshot
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-brand-navy">
              Support designed for every learning stage
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([value, label, detail, hoverStyle]) => (
              <article
                key={label}
                className={`group rounded-2xl border border-brand-navy/10 bg-slate-50 p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover ${hoverStyle}`}
              >
                <strong className="font-heading text-3xl font-bold text-brand-gold-dark">
                  {value}
                </strong>
                <h3 className="mt-2 font-heading text-sm font-semibold text-brand-navy">
                  {label}
                </h3>
                <p className="mt-2 text-xs leading-5 text-brand-muted">
                  {detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            title="Our Academic Tracks"
            description="A structured curriculum that grows with your child at every stage of school."
          />
          <div className="multi-hover-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            {courses.map(
              ([
                number,
                classes,
                title,
                text,
                hoverStyle,
                badgeStyle,
                numberStyle,
              ]) => (
                <article
                  key={title}
                  className={`group relative overflow-hidden rounded-2xl border border-brand-navy/[0.08] bg-gradient-to-br from-white to-white p-7 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:shadow-brand-hover ${hoverStyle}`}
                >
                  <span
                    className={`absolute right-5 top-3 font-heading text-6xl font-bold text-brand-navy/[0.035] transition duration-300 ${numberStyle}`}
                  >
                    {number}
                  </span>
                  <p
                    className={`relative mb-5 inline-flex rounded-full px-3 py-1 text-xs font-bold ${badgeStyle}`}
                  >
                    {classes}
                  </p>
                  <h3 className="relative mb-3 font-heading text-xl font-semibold text-brand-navy">
                    {title}
                  </h3>
                  <p className="relative text-sm leading-6 text-brand-muted">
                    {text}
                  </p>
                  <Link
                    to="/courses"
                    className="relative mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-navy no-underline transition group-hover:translate-x-1"
                  >
                    View program <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-12 md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl bg-brand-navy p-6 text-white shadow-brand-hover md:flex-row md:items-center md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
              Find Your Program
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-white">
              Not sure which course fits?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Use the Grade and Stream Finder on our Courses page to see the
              most relevant learning path.
            </p>
          </div>
          <Link
            to="/courses#programs"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-lg bg-brand-gold px-6 text-sm font-semibold text-brand-navy no-underline transition hover:-translate-y-0.5 hover:bg-brand-gold-dark md:w-auto"
          >
            Find My Program
          </Link>
        </div>
      </section>

      <section className="px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading compact title="How It Works" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4">
            {steps.map(([title, text], index) => (
              <article key={title} className="text-center">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy font-heading text-sm font-bold text-brand-gold">
                  {index + 1}
                </span>
                <h3 className="mb-2 font-heading text-sm font-semibold text-brand-navy md:text-base">
                  {title}
                </h3>
                <p className="text-xs leading-5 text-brand-muted md:text-sm md:leading-6">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            dark
            eyebrow="Learning With Direction"
            title="Why Families Choose Our Approach"
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={mentorFeedbackImage}
                alt="A mentor reviewing practice work with a student"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-heading text-xl font-semibold text-white">
                  Practice. Feedback. Progress.
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
                  Every assessment should lead to a practical next step—not just
                  a score.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {benefits.map(
                ([title, text, hoverStyle, iconStyle, titleStyle], index) => (
                  <article
                    key={title}
                    className={`group rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left transition duration-300 hover:-translate-y-1 ${hoverStyle}`}
                  >
                    <span
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${iconStyle}`}
                    >
                      <BenefitIcon index={index} />
                    </span>
                    <h3
                      className={`mb-2 font-heading font-semibold ${titleStyle}`}
                    >
                      {title}
                    </h3>
                    <p className="text-sm leading-6 text-slate-300">{text}</p>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-brand-cream px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold-dark">
              Connected Learning Experience
            </p>
            <h2 className="animated-gradient-text mt-2 bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-gold-dark bg-clip-text font-heading text-[28px] font-bold leading-tight text-transparent md:text-4xl">
              One portal for learning, progress and communication
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted md:text-base">
              The Student and Parent Portal keeps everyday academic information
              organized after enrollment—from schedules and resources to test
              performance and fee records.
            </p>
            <div className="mt-5 rounded-xl border border-brand-gold/25 bg-brand-gold/10 p-4 text-xs leading-5 text-brand-text">
              <strong className="text-brand-navy">
                Everything in one place:
              </strong>{" "}
              Students learn with structure while parents stay informed about
              progress and important updates.
            </div>
            <Link
              to="/book-demo"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white no-underline transition hover:-translate-y-1 hover:bg-brand-navy-light hover:shadow-brand-hover"
            >
              Ask About Portal Access
            </Link>
          </div>

          <div className="multi-hover-grid grid grid-cols-1 gap-4 sm:grid-cols-2">
            {portalFeatures.map(([title, description, badgeStyle], index) => (
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
        </div>
      </section>

      <section className="px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            compact
            eyebrow="Meet Our Tutors"
            title="Experienced Mentors Across Key Streams"
            description="Subject specialists who combine clear explanation, structured practice and focused academic guidance."
          />
          <div className="multi-hover-grid grid grid-cols-1 gap-5 md:grid-cols-3">
            {mentors.map(
              ([
                image,
                name,
                subject,
                credential,
                detail,
                hoverStyle,
                imageStyle,
              ]) => (
                <article
                  key={name}
                  className={`group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-white p-6 text-center shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover ${hoverStyle}`}
                >
                  <img
                    src={image}
                    alt={`${name}, ${subject} mentor`}
                    loading="lazy"
                    className={`mx-auto h-36 w-36 rounded-full border-4 border-white object-cover object-top shadow-lg ring-0 transition duration-300 group-hover:ring-4 ${imageStyle}`}
                  />
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-gold-dark">
                    {subject}
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-brand-navy">
                    {name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-brand-navy-light">
                    {credential}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">
                    {detail}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-brand-cream px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading compact title="What Families Can Expect" />
          <div className="multi-hover-grid grid grid-cols-1 gap-5 md:grid-cols-2">
            {familyExpectations.map(([title, text], index) => (
              <article
                key={title}
                className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 font-heading text-sm font-bold text-brand-gold-dark">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-brand-navy">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      {text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-gold to-brand-gold-dark px-5 py-10 text-center md:px-12 md:py-12">
        <h2 className="animated-gradient-text bg-gradient-to-r from-brand-navy via-white to-brand-navy bg-clip-text font-heading text-3xl font-bold text-transparent">
          Ready to see the difference?
        </h2>
        <p className="mb-5 mt-2 text-brand-navy">
          Book a free demo class today — no cost, no commitment.
        </p>
        <Link
          to="/book-demo"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-xl"
        >
          Book Free Demo Class
        </Link>
      </section>
    </div>
  );
}

export default Home;
