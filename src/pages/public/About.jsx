import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import SectionHeading from "../../components/common/SectionHeading";
import aboutHeroImage from "../../assets/about/about-hero.webp";
import teachingApproachImage from "../../assets/about/teaching-approach.webp";
import parentProgressImage from "../../assets/about/parent-progress-meeting.webp";
import founderImage from "../../assets/about/founder-neha-sharma.webp";
import missionPillarImage from "../../assets/about/pillars/mission-concept-clarity.webp";
import visionPillarImage from "../../assets/about/pillars/vision-collaborative-learning.webp";
import promisePillarImage from "../../assets/about/pillars/promise-personal-guidance.webp";
import commitmentPillarImage from "../../assets/about/pillars/commitment-parent-progress.webp";

const parentTransparencyPoints = [
  "Regular performance updates",
  "Transparent fee schedules",
  "Attendance visibility",
  "Actionable mentor feedback",
];

const teachingPrinciples = [
  {
    title: "Conceptual Clarity",
    description:
      "Students learn the reasoning behind every concept instead of depending only on memorization.",
    style: "hover:border-sky-300 hover:from-sky-50 hover:to-white",
    badge:
      "bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white",
  },
  {
    title: "Individual Attention",
    description:
      "Small batches help mentors understand every student’s strengths, learning pace and improvement areas.",
    style: "hover:border-emerald-300 hover:from-emerald-50 hover:to-white",
    badge:
      "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    title: "Regular Assessment",
    description:
      "Weekly practice and structured tests help students track progress and prepare confidently for examinations.",
    style: "hover:border-violet-300 hover:from-violet-50 hover:to-white",
    badge:
      "bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white",
  },
  {
    title: "Parent Transparency",
    description:
      "Parents receive clear information about academic progress, attendance and fee schedules.",
    style: "hover:border-amber-300 hover:from-amber-50 hover:to-white",
    badge:
      "bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    title: "Qualified Tutors",
    description:
      "Experienced subject specialists combine academic knowledge with clear, student-friendly explanation.",
    style: "hover:border-rose-300 hover:from-rose-50 hover:to-white",
    badge:
      "bg-rose-100 text-rose-700 group-hover:bg-rose-500 group-hover:text-white",
  },
  {
    title: "Academic Discipline",
    description:
      "Consistent schedules, guided assignments and revision plans help students develop dependable study habits.",
    style: "hover:border-indigo-300 hover:from-indigo-50 hover:to-white",
    badge:
      "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white",
  },
];

const learningJourney = [
  {
    step: "01",
    title: "Understand the learner",
    description:
      "We begin by identifying the student’s current concepts, learning pace and subject-specific gaps.",
    style: "hover:border-sky-400/60 hover:bg-sky-400/10",
    badge: "bg-sky-400 text-brand-navy",
  },
  {
    step: "02",
    title: "Teach with structure",
    description:
      "Every topic moves from explanation to guided practice, independent work and doubt resolution.",
    style: "hover:border-emerald-400/60 hover:bg-emerald-400/10",
    badge: "bg-emerald-400 text-brand-navy",
  },
  {
    step: "03",
    title: "Measure real progress",
    description:
      "Regular assessments and mentor feedback turn performance data into a practical improvement plan.",
    style: "hover:border-violet-400/60 hover:bg-violet-400/10",
    badge: "bg-violet-400 text-brand-navy",
  },
];

const trustPoints = [
  ["1–12", "Complete Grade Coverage"],
  ["Small", "Focused Batches"],
  ["Regular", "Assessments"],
  ["Clear", "Parent Updates"],
];

const instituteProfile = [
  [
    "Founding year",
    "2018",
    "border-sky-200 bg-sky-50 hover:border-sky-300",
    "text-sky-700",
  ],
  [
    "Founder / Director",
    "Neha Sharma",
    "border-emerald-200 bg-emerald-50 hover:border-emerald-300",
    "text-emerald-700",
  ],
  [
    "Teaching experience",
    "12+ years combined experience",
    "border-violet-200 bg-violet-50 hover:border-violet-300",
    "text-violet-700",
  ],
  [
    "Institute milestones",
    "500+ learners supported",
    "border-amber-200 bg-amber-50 hover:border-amber-300",
    "text-amber-700",
  ],
];

const purposePillars = [
  {
    number: "01",
    image: missionPillarImage,
    imageAlt: "A mentor helping a student understand a mathematics concept",
    ring: "ring-sky-200 group-hover:ring-sky-300",
    label: "OUR MISSION",
    title: "Learn With Clarity. Grow With Confidence.",
    description:
      "We help students move beyond memorization by developing strong concepts, deeper understanding, and confident application. Lessons connect ideas with practical questions so learners understand how and where to use each concept. This clarity helps them approach schoolwork and examinations with greater independence.",
    points: [
      "Concept-first learning",
      "Structured practice",
      "Strong academic foundations",
    ],
    style: "border-sky-300/40 hover:border-sky-300 hover:bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    number: "02",
    image: visionPillarImage,
    imageAlt: "Students learning collaboratively with mentor guidance",
    ring: "ring-violet-200 group-hover:ring-violet-300",
    label: "OUR VISION",
    title: "Guidance for Every Stage of Growth",
    description:
      "We envision a learning environment where every student has access to consistent academic guidance, expert mentorship, and the support needed to achieve their potential. Learning pathways evolve with the student’s grade, academic goals, and changing subject requirements. Families and mentors work together to keep every stage purposeful and well supported.",
    points: [
      "Expert-led academic support",
      "Learning pathways for Grades 1–12",
      "Meaningful student–mentor–parent collaboration",
    ],
    style: "border-violet-300/40 hover:border-violet-300 hover:bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    number: "03",
    image: promisePillarImage,
    imageAlt: "A mentor providing personal doubt-solving support to a student",
    ring: "ring-emerald-200 group-hover:ring-emerald-300",
    label: "OUR PROMISE",
    title: "Every Learner Deserves Individual Attention",
    description:
      "We create a focused learning environment where students receive the attention, feedback, and guidance they need to overcome challenges and progress effectively. Mentors observe how each learner understands, practices, and responds to difficult topics. Support can then be adjusted before small learning gaps become larger academic barriers.",
    points: [
      "Focused learning groups",
      "Personalized academic support",
      "Early identification of learning gaps",
    ],
    style: "border-emerald-300/40 hover:border-emerald-300 hover:bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    number: "04",
    image: commitmentPillarImage,
    imageAlt: "A mentor discussing student progress with parents",
    ring: "ring-amber-200 group-hover:ring-amber-300",
    label: "OUR COMMITMENT",
    title: "Make Every Step of Progress Count",
    description:
      "We turn academic progress into something visible and actionable through regular assessment, meaningful feedback, and clearly defined next steps. Students understand what has improved and which skills still require focused practice. Parents receive clearer direction to support progress without relying only on examination marks.",
    points: [
      "Continuous performance tracking",
      "Action-oriented feedback",
      "Transparent goals and progress",
    ],
    style: "border-amber-300/50 hover:border-amber-300 hover:bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
];

function About() {
  return (
    <>
      <div className="flex min-h-[calc(100svh-64px)] flex-col md:min-h-[calc(100svh-76px)]">
        <PageHero
          eyebrow="About TuitionSphere"
          title="Learning Built Around Every Student"
          description="TuitionSphere supports students from Grades 1 to 12 through structured teaching, experienced mentorship and consistent academic guidance."
          image={aboutHeroImage}
          imageAlt="A TuitionSphere mentor supporting a confident student"
          imagePosition="object-[70%_top]"
          overlayClassName="from-[#14223d] via-brand-navy/90 to-brand-navy/10"
          className="flex min-h-[385px] flex-none items-center py-8 md:h-[410px] md:min-h-0 md:py-9"
        >
          <Link
            to="/book-demo"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy no-underline shadow-lg transition hover:-translate-y-1 hover:bg-brand-gold-dark hover:shadow-xl"
          >
            Book Free Demo
          </Link>

          <Link
            to="/courses"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:border-white hover:bg-white hover:text-brand-navy"
          >
            Explore Courses
          </Link>
        </PageHero>

        <section className="shrink-0 border-b border-brand-navy/10 bg-white py-4 md:py-4">
          <div className="mx-auto w-[min(calc(100%-40px),1200px)] md:w-[min(calc(100%-96px),1200px)]">
            <div className="mb-4 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold-dark">
                  What Drives Us
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold text-brand-navy md:text-2xl">
                  Four Pillars of Student Success
                </h2>
              </div>
              <p className="mx-auto mt-2 max-w-xl text-[11px] leading-4 text-brand-muted">
                Clear teaching, personal attention and transparent progress
                shape every TuitionSphere program.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {purposePillars.map((pillar) => (
                <article
                  key={pillar.number}
                  className={`group relative overflow-hidden rounded-2xl border bg-slate-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover md:p-6 ${pillar.style}`}
                >
                  <div className="grid grid-cols-[76px_1fr] items-center gap-4 text-center md:grid-cols-[88px_1fr] md:gap-5">
                    <div
                      className={`h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-[3px] border-white shadow-md ring-4 transition duration-300 group-hover:scale-105 md:h-[88px] md:w-[88px] ${pillar.ring}`}
                    >
                      <img
                        src={pillar.image}
                        alt={pillar.imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 w-full">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${pillar.badge}`}
                        >
                          {pillar.number}
                        </span>
                        <span className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
                          {pillar.label}
                        </span>
                      </div>
                      <h3 className="mx-auto mt-2 max-w-md font-heading text-lg font-semibold italic text-brand-navy md:text-xl">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mx-auto mt-4 max-w-xl text-center text-[13px] leading-[1.4rem] text-brand-muted">
                    {pillar.description}
                  </p>
                  <ul className="mt-4 space-y-2.5 border-t border-brand-navy/10 pt-4">
                    {pillar.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-xs leading-5 text-brand-text"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${pillar.badge}`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand-gold transition duration-300 group-hover:scale-x-100" />
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="pb-8 pt-3 md:pb-12 md:pt-5">
        <div className="mx-auto grid w-[min(calc(100%-40px),1200px)] grid-cols-1 items-center gap-8 md:w-[min(calc(100%-96px),1200px)] lg:grid-cols-[1fr_0.95fr] lg:gap-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
              Our Approach
            </p>
            <h2 className="mb-5 font-heading text-[28px] font-bold leading-tight text-brand-navy md:text-4xl">
              Strong foundations create lasting confidence
            </h2>

            <p className="mb-4 text-brand-muted">
              We believe academic improvement begins when students understand
              concepts clearly and feel comfortable asking questions. Our
              programs combine classroom explanation, guided practice, homework
              support and regular assessment.
            </p>

            <p className="text-brand-muted">
              From primary-level fundamentals to board preparation and senior
              secondary streams, every course follows a structured learning path
              appropriate for the student’s grade and subject needs.
            </p>
          </div>

          <div className="group relative min-h-[290px] overflow-hidden rounded-2xl shadow-brand-hover md:min-h-[360px]">
            <img
              src={teachingApproachImage}
              alt="A TuitionSphere mentor helping students understand a lesson"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <div className="max-w-sm rounded-xl border border-white/15 bg-brand-navy/85 p-4 shadow-xl backdrop-blur-sm transition duration-300 group-hover:-translate-y-1 md:p-5">
                <span className="mb-2 block font-heading text-4xl font-bold text-brand-gold">
                  1–12
                </span>
                <h3 className="mb-2 font-heading text-xl font-semibold text-white">
                  Complete academic support
                </h3>
                <p className="text-sm leading-6 text-slate-200">
                  From primary foundations to board and senior-secondary
                  preparation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-navy/10 bg-brand-cream py-4 md:py-5">
        <div className="mx-auto grid w-[min(calc(100%-40px),1200px)] grid-cols-2 gap-x-5 gap-y-4 md:w-[min(calc(100%-96px),1200px)] md:grid-cols-4">
          {trustPoints.map(([value, label]) => (
            <div key={label} className="text-center">
              <strong className="block font-heading text-xl font-bold text-brand-gold-dark md:text-2xl">
                {value}
              </strong>
              <span className="mt-1 block text-xs text-brand-muted md:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="mx-auto grid w-[min(calc(100%-40px),1200px)] grid-cols-1 gap-5 md:w-[min(calc(100%-96px),1200px)] lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch lg:gap-6">
          <div className="interactive-glow rounded-2xl bg-brand-navy p-5 text-white shadow-brand-hover transition duration-300 hover:-translate-y-1 md:p-6">
            <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Why TuitionSphere Started
                </p>
                <h2 className="mt-2 max-w-2xl font-heading text-[26px] font-bold leading-tight text-white md:text-[32px]">
                  A clearer, more personal path to academic progress
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  TuitionSphere began with a simple belief: students progress
                  best when concepts are clear, questions are welcomed and
                  families understand the next step. Structured teaching and
                  transparent communication bring that belief into every
                  learning journey.
                </p>
                <div className="mt-4 flex items-center gap-3 border-l-2 border-brand-gold pl-3">
                  <div>
                    <p className="font-heading text-sm font-semibold text-white">
                      Neha Sharma
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Founder & Academic Director
                    </p>
                  </div>
                  <span className="hidden text-xs italic leading-5 text-slate-200 sm:block">
                    “Patient guidance. A clear plan. Lasting confidence.”
                  </span>
                </div>
              </div>
              <div className="group relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-full border-[6px] border-white/15 bg-white/5 shadow-2xl ring-2 ring-brand-gold/35">
                <img
                  src={founderImage}
                  alt="Neha Sharma, Founder and Academic Director of TuitionSphere"
                  className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-brand-navy/35 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          <aside className="interactive-glow flex h-full flex-col rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-brand-hover md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold-dark">
                  Institute Profile
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold text-brand-navy">
                  TuitionSphere at a Glance
                </h2>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                Our Journey
              </span>
            </div>
            <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5">
              {instituteProfile.map(
                ([label, value, cardStyle, numberStyle], index) => (
                  <div
                    key={label}
                    className={`group rounded-xl border p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${cardStyle}`}
                  >
                    <span className={`text-[10px] font-bold ${numberStyle}`}>
                      0{index + 1}
                    </span>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                      {label}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-brand-navy transition group-hover:text-brand-gold-dark">
                      {value}
                    </p>
                  </div>
                ),
              )}
            </div>
            <p className="mt-3 border-t border-brand-navy/10 pt-3 text-[11px] leading-5 text-brand-muted">
              Clear teaching, personal guidance and dependable academic support.
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-brand-navy py-8 md:py-12">
        <div className="mx-auto w-[min(calc(100%-40px),1200px)] md:w-[min(calc(100%-96px),1200px)]">
          <SectionHeading
            dark
            eyebrow="How We Teach"
            title="A learning journey with clear purpose"
            description="Our methodology keeps teaching personal while giving every student a repeatable path toward improvement."
          />
          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent lg:block"
            />
            {learningJourney.map((item) => (
              <article
                key={item.step}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl md:p-6 ${item.style}`}
              >
                <span
                  className={`relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-xl font-heading text-sm font-bold shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${item.badge}`}
                >
                  {item.step}
                </span>
                <h3 className="mb-3 font-heading text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-cream py-8 md:py-12">
        <div className="mx-auto w-[min(calc(100%-40px),1200px)] md:w-[min(calc(100%-96px),1200px)]">
          <SectionHeading
            eyebrow="What Guides Us"
            title="Our teaching principles"
            description="Every class is designed around clarity, consistency and measurable student progress."
          />
          <div className="multi-hover-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {teachingPrinciples.map((principle, index) => (
              <article
                className={`group rounded-xl border border-brand-navy/10 bg-gradient-to-br from-white to-white p-5 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:shadow-brand-hover md:p-6 ${principle.style}`}
                key={principle.title}
              >
                <span
                  className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg font-heading text-xs font-bold transition duration-300 group-hover:rotate-6 ${principle.badge}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mb-3 font-heading text-lg font-semibold text-brand-navy">
                  {principle.title}
                </h3>
                <p className="text-sm leading-6 text-brand-muted">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="mx-auto grid w-[min(calc(100%-40px),1200px)] grid-cols-1 gap-7 md:w-[min(calc(100%-96px),1200px)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
          <div className="group relative min-h-[280px] overflow-hidden rounded-2xl shadow-brand-hover md:min-h-[340px]">
            <img
              src={parentProgressImage}
              alt="A mentor discussing a student's academic progress with a parent"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-lg border border-white/20 bg-white/90 px-4 py-3 text-sm font-semibold text-brand-navy shadow-lg backdrop-blur-sm">
              Progress shared. Next steps clear.
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
              For Parents
            </p>
            <h2 className="font-heading text-[28px] font-bold leading-tight text-brand-navy md:text-4xl">
              Clear communication beyond the classroom
            </h2>
            <p className="mt-4 text-brand-muted">
              Parents should never have to guess how their child is progressing.
              TuitionSphere is designed around useful, timely academic
              visibility.
            </p>
            <div className="multi-hover-grid mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {parentTransparencyPoints.map((item, index) => (
                <div
                  key={item}
                  className={`group flex items-center gap-3 rounded-xl border border-brand-navy/10 bg-white p-3.5 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-hover ${index === 0 ? "hover:border-sky-300 hover:bg-sky-50" : index === 1 ? "hover:border-emerald-300 hover:bg-emerald-50" : index === 2 ? "hover:border-violet-300 hover:bg-violet-50" : "hover:border-amber-300 hover:bg-amber-50"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 font-bold text-brand-gold-dark">
                    ✓
                  </span>
                  <p className="text-sm font-semibold text-brand-navy">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-12">
        <div className="group mx-auto flex w-[min(calc(100%-40px),1200px)] flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-brand-navy/10 bg-gradient-to-br from-[#f0ece2] to-brand-cream p-6 transition duration-300 hover:border-brand-gold/40 hover:shadow-brand-hover md:w-[min(calc(100%-96px),1200px)] md:p-8 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
              Start Learning
            </p>
            <h2 className="mb-3 font-heading text-[28px] font-bold text-brand-navy md:text-4xl">
              Experience our teaching approach firsthand
            </h2>
            <p className="text-brand-muted">
              Book a free demo class and find the right academic program for
              your child.
            </p>
          </div>

          <Link
            to="/book-demo"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-brand-navy px-6 py-3 font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-brand-hover lg:w-auto"
          >
            Schedule Free Demo
          </Link>
        </div>
      </section>
    </>
  );
}

export default About;
