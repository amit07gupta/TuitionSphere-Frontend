import { useState } from 'react';
import { Link } from 'react-router-dom';
import CourseFinder from '../../components/common/CourseFinder';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import coursesHeroImage from '../../assets/courses/courses-hero.webp';
import examPreparationImage from '../../assets/courses/exam-preparation.webp';
import { boardPreparationSubjects, foundationSubjectsByBoard } from '../../data/shared/academicOptions';

const programs = [
  {
    id: 'foundation',
    tab: 'Grades 1–8',
    eyebrow: 'Foundation Years',
    title: 'Build curiosity, confidence and strong academic basics',
    description: 'Age-appropriate teaching, guided practice and homework support help students develop dependable learning habits from the beginning.',
    groups: [
      {
        classes: 'Grades 1–5',
        title: 'Primary Foundation',
        subjectsByBoard: foundationSubjectsByBoard.primary,
        focus: 'Strong fundamentals, interactive learning, conceptual clarity and daily homework assistance.',
        accent: 'from-amber-400 to-orange-500',
      },
      {
        classes: 'Grades 6–8',
        title: 'Middle School Foundation',
        subjectsByBoard: foundationSubjectsByBoard.middle,
        focus: 'Analytical thinking, problem-solving habits, weekly revision and preparation for higher classes.',
        accent: 'from-sky-500 to-indigo-600',
      },
    ],
    outcomes: ['Clear subject fundamentals', 'Better homework discipline', 'Regular revision tests', 'Confident classroom participation'],
  },
  {
    id: 'boards',
    tab: 'Grades 9–10',
    eyebrow: 'Board Preparation',
    title: 'Turn concepts into confident CBSE and ICSE performance',
    description: 'A structured program combining concept mastery, chapter-wise practice, sample papers and targeted doubt-clearing sessions.',
    groups: [
      {
        classes: 'Grades 9–10',
        title: 'Complete Board Preparation',
        subjectsByBoard: boardPreparationSubjects,
        focus: 'Rigorous CBSE and ICSE preparation with topic tests, sample-paper solving, answer-writing practice and revision planning.',
        accent: 'from-emerald-500 to-teal-600',
      },
    ],
    outcomes: ['Chapter-wise mastery', 'Board-pattern test practice', 'Answer-writing improvement', 'Dedicated doubt resolution'],
  },
  {
    id: 'senior',
    tab: 'Grades 11–12',
    eyebrow: 'Stream Selection',
    title: 'Specialized guidance for every senior-secondary stream',
    description: 'Deep subject learning, numerical and case-study practice, and exam-focused mentoring designed around the student’s chosen stream.',
    groups: [
      {
        classes: 'Science Stream',
        title: 'Science',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
        focus: 'Conceptual depth, numerical practice, regular test series and JEE/NEET foundational alignment.',
        accent: 'from-blue-500 to-violet-600',
      },
      {
        classes: 'Commerce Stream',
        title: 'Commerce',
        subjects: ['Accountancy', 'Business Studies', 'Economics'],
        focus: 'Financial literacy, ledger practice, case-study analysis and practical business understanding.',
        accent: 'from-rose-500 to-orange-500',
      },
      {
        classes: 'Specialized Track',
        title: 'Economics',
        subjects: ['Microeconomics', 'Macroeconomics', 'Indian Economic Development'],
        focus: 'Diagrammatic models, numerical problem-solving, data interpretation and economic policy insights.',
        accent: 'from-amber-400 to-yellow-600',
      },
    ],
    outcomes: ['Stream-focused mentoring', 'Numerical and case-study practice', 'Exam-aligned test series', 'Progress feedback for parents'],
  },
];

const learningSteps = [
  ['01', 'Diagnostic check', 'We identify current understanding, learning gaps and the right starting level.'],
  ['02', 'Concept-led classes', 'Mentors explain each topic clearly before moving into guided practice.'],
  ['03', 'Practice and feedback', 'Assignments, topic tests and doubt sessions make improvement measurable.'],
  ['04', 'Exam readiness', 'Revision plans, timed papers and focused feedback build examination confidence.'],
];

const resources = [
  ['Course Syllabus', 'View a class-wise sample learning roadmap and assessment plan.', '/resources/sample-syllabus.pdf', 'View Syllabus'],
  ['Sample Test Paper', 'Explore the structure used for concept, application and reflection questions.', '/resources/sample-test-paper.pdf', 'Open Test Paper'],
  ['Batch Timetable', 'See a sample weekly plan for classes, revision, tests and mentor feedback.', '/resources/sample-timetable.pdf', 'View Timetable'],
];

const subjectExplorer = [
  { id: 'mathematics', icon: '∑', title: 'Mathematics', grades: 'Grades 1–12', tone: 'border-sky-200 bg-sky-50 text-sky-700', detail: 'Build numerical confidence through concept explanation, guided problem-solving and exam-pattern practice.', highlights: ['Core concepts', 'Step-wise solutions', 'Regular practice'] },
  { id: 'science', icon: '⌬', title: 'Science', grades: 'Grades 6–10', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', detail: 'Connect scientific ideas with diagrams, applications and structured chapter-wise revision.', highlights: ['Concept clarity', 'Application questions', 'Revision tests'] },
  { id: 'physics', icon: 'Φ', title: 'Physics', grades: 'Grades 11–12', tone: 'border-indigo-200 bg-indigo-50 text-indigo-700', detail: 'Strengthen theory, derivations and numerical reasoning with focused senior-secondary mentoring.', highlights: ['Theory and derivations', 'Numerical practice', 'Exam readiness'] },
  { id: 'chemistry', icon: '⚗', title: 'Chemistry', grades: 'Grades 9–12', tone: 'border-rose-200 bg-rose-50 text-rose-700', detail: 'Learn reactions, mechanisms and calculations through visual explanation and consistent practice.', highlights: ['Reaction mapping', 'Numerical chemistry', 'Structured revision'] },
  { id: 'biology', icon: '✣', title: 'Biology', grades: 'Grades 9–12', tone: 'border-lime-200 bg-lime-50 text-lime-700', detail: 'Understand biological processes with labelled diagrams, terminology support and recall practice.', highlights: ['Diagram learning', 'Key terminology', 'Answer writing'] },
  { id: 'english', icon: 'Aa', title: 'English', grades: 'Grades 1–12', tone: 'border-violet-200 bg-violet-50 text-violet-700', detail: 'Improve comprehension, grammar and written expression through grade-appropriate guided practice.', highlights: ['Reading skills', 'Grammar clarity', 'Written expression'] },
  { id: 'accountancy', icon: '₹', title: 'Accountancy', grades: 'Grades 11–12', tone: 'border-amber-200 bg-amber-50 text-amber-700', detail: 'Master accounting principles with ledger practice, working notes and step-by-step problem solving.', highlights: ['Ledger accuracy', 'Working notes', 'Case practice'] },
  { id: 'economics', icon: '↗', title: 'Economics', grades: 'Grades 11–12', tone: 'border-orange-200 bg-orange-50 text-orange-700', detail: 'Connect economic theory, diagrams and data interpretation with clear real-world applications.', highlights: ['Economic models', 'Data interpretation', 'Case studies'] },
];

function ProgramCard({ program }) {
  return (
    <article className="interactive-glow group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:border-brand-gold/40 hover:shadow-brand-hover md:p-7">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${program.accent}`} />
      <p className="mb-3 mt-2 text-sm font-bold uppercase tracking-[0.13em] text-brand-gold-dark">{program.classes}</p>
      <h3 className="font-heading text-2xl font-bold text-brand-navy">{program.title}</h3>
      {program.subjectsByBoard ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Object.entries(program.subjectsByBoard).map(([board, subjects]) => (
            <div key={board} className="rounded-xl border border-brand-navy/10 bg-brand-cream/60 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-dark">{board} Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((subject) => <span key={subject} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-navy shadow-sm">{subject}</span>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {program.subjects.map((subject) => <span key={subject} className="rounded-full bg-brand-navy/[0.06] px-3 py-1.5 text-xs font-semibold text-brand-navy">{subject}</span>)}
        </div>
      )}
      <p className="mt-5 text-sm leading-7 text-brand-muted">{program.focus}</p>
      <Link to={`/book-demo?program=${encodeURIComponent(program.title)}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-brand-navy no-underline transition group-hover:text-brand-gold-dark">
        Book a demo for this program <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function Courses() {
  const [activeProgram, setActiveProgram] = useState('foundation');
  const [activeSubject, setActiveSubject] = useState('mathematics');
  const selectedProgram = programs.find((program) => program.id === activeProgram) ?? programs[0];
  const selectedSubject = subjectExplorer.find((subject) => subject.id === activeSubject) ?? subjectExplorer[0];

  return (
    <div>
      <PageHero
        eyebrow="Courses & Curriculum"
        title="The Right Program for Every Learning Stage"
        description="Explore structured academic support from Grades 1 to 12, including Foundation, Board Preparation, Science, Commerce and specialized Economics tracks."
        image={coursesHeroImage}
        imageAlt="A TuitionSphere mentor guiding students toward suitable academic programs"
        imagePosition="object-[52%_center]"
      >
        <a href="#programs" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy no-underline transition hover:-translate-y-0.5 hover:bg-brand-gold-dark hover:shadow-brand-hover">
          Explore Programs
        </a>
        <Link to="/book-demo" className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:border-white hover:bg-white hover:text-brand-navy">
          Book Free Demo
        </Link>
      </PageHero>

      <section id="programs" className="scroll-mt-24 px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeading compact eyebrow="Academic Programs" title="Choose the student’s learning stage" description="Switch between class groups to view subjects, academic focus and expected learning outcomes." />

          <div className="mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-2 rounded-2xl border border-brand-navy/10 bg-brand-cream p-2 sm:grid-cols-3" role="tablist" aria-label="Course class groups">
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                role="tab"
                aria-selected={activeProgram === program.id}
                aria-controls={`panel-${program.id}`}
                onClick={() => setActiveProgram(program.id)}
                className={`min-h-12 rounded-xl px-4 text-sm font-bold transition ${activeProgram === program.id ? 'bg-brand-navy text-white shadow-lg' : 'bg-transparent text-brand-navy hover:bg-white'}`}
              >
                {program.tab}
              </button>
            ))}
          </div>

          <div key={selectedProgram.id} id={`panel-${selectedProgram.id}`} role="tabpanel" className="animate-panel-in rounded-3xl bg-brand-cream p-5 md:p-8">
            <div className="mb-7 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-gold-dark">{selectedProgram.eyebrow}</p>
                <h2 className="max-w-3xl font-heading text-3xl font-bold leading-tight text-brand-navy md:text-4xl">{selectedProgram.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-muted md:text-base">{selectedProgram.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedProgram.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs font-semibold leading-5 text-brand-navy shadow-sm">
                    <span className="mt-0.5 text-brand-gold-dark">✓</span>{outcome}
                  </div>
                ))}
              </div>
            </div>

            <div className={`multi-hover-grid grid grid-cols-1 gap-5 ${selectedProgram.groups.length === 1 ? 'lg:grid-cols-1' : selectedProgram.groups.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
              {selectedProgram.groups.map((program) => <ProgramCard key={program.title} program={program} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-navy/10 bg-brand-navy px-5 py-10 text-white md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading compact dark eyebrow="Explore By Subject" title="Find focused support for key school subjects" description="Select a subject to preview the learning approach, suitable grades and core areas of support." />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="tablist" aria-label="Academic subjects">
              {subjectExplorer.map((subject) => (
                <button key={subject.id} type="button" role="tab" aria-selected={activeSubject === subject.id} onClick={() => setActiveSubject(subject.id)} className={`group rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${activeSubject === subject.id ? `${subject.tone} shadow-xl ring-2 ring-brand-gold/30` : 'border-white/10 bg-white/[0.055] text-white hover:border-brand-gold/40 hover:bg-white/[0.1]'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-heading text-lg font-bold transition duration-300 group-hover:rotate-6 ${activeSubject === subject.id ? 'bg-white/80' : 'bg-white/10 text-brand-gold'}`}>{subject.icon}</span>
                  <strong className="mt-3 block font-heading text-sm">{subject.title}</strong>
                  <span className={`mt-1 block text-[11px] ${activeSubject === subject.id ? 'opacity-75' : 'text-slate-400'}`}>{subject.grades}</span>
                </button>
              ))}
            </div>

            <article key={selectedSubject.id} className="animate-panel-in relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-white to-brand-cream p-6 text-brand-text shadow-2xl md:p-7">
              <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[25px] border-brand-gold/10" />
              <div className="relative flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-dark">{selectedSubject.grades}</p><h3 className="mt-2 font-heading text-2xl font-bold text-brand-navy">{selectedSubject.title} Support</h3></div><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-heading text-xl font-bold ${selectedSubject.tone}`}>{selectedSubject.icon}</span></div>
              <p className="relative mt-4 text-sm leading-7 text-brand-muted">{selectedSubject.detail}</p>
              <div className="relative mt-5 space-y-2">{selectedSubject.highlights.map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-brand-navy/[0.07] bg-white px-3 py-2.5 text-sm font-semibold text-brand-navy"><span className="text-brand-gold-dark">✓</span>{item}</div>)}</div>
              <Link to={`/book-demo?program=${encodeURIComponent(selectedSubject.title)}`} className="relative mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light">Book {selectedSubject.title} Demo</Link>
            </article>
          </div>
        </div>
      </section>

      <CourseFinder />

      <section className="bg-brand-navy px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeading compact dark eyebrow="How Students Improve" title="A repeatable path from learning to performance" description="Every program follows a clear teaching cycle so students know what to learn, practise and improve next." />
          <div className="relative grid gap-5 lg:grid-cols-[1fr_320px_1fr] lg:items-center lg:gap-8">
            <div className="order-2 space-y-4 border-l border-dashed border-brand-gold/30 pl-5 lg:order-1 lg:border-0 lg:pl-0">
              {learningSteps.slice(0, 2).map(([step, title, description], index) => (
                <article key={step} className={`group relative rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition duration-300 hover:-translate-y-1 lg:text-right ${index === 0 ? 'hover:border-sky-400/60 hover:bg-sky-400/10' : 'hover:border-emerald-400/60 hover:bg-emerald-400/10'}`}>
                  <span aria-hidden="true" className="absolute -right-8 top-1/2 hidden w-8 border-t border-dashed border-brand-gold/45 lg:block" />
                  <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full font-heading text-xs font-bold text-brand-navy shadow-lg transition duration-300 group-hover:scale-110 lg:ml-auto ${index === 0 ? 'bg-sky-300' : 'bg-emerald-300'}`}>{step}</span>
                  <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>

            <div className="order-1 mx-auto w-full max-w-[290px] lg:order-2 lg:max-w-[320px]">
              <div className="group relative aspect-square rounded-full border border-brand-gold/30 bg-white/[0.04] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.28)]">
                <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-dashed border-brand-gold/35 transition duration-700 group-hover:rotate-12" />
                <div aria-hidden="true" className="absolute -inset-7 rounded-full border border-white/[0.055]" />
                <div className="relative h-full overflow-hidden rounded-full border-[7px] border-white/10">
                  <img src={examPreparationImage} alt="A mentor giving students feedback during exam preparation" className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-brand-navy/10" />
                  <div className="absolute inset-x-5 bottom-6 rounded-full border border-white/15 bg-brand-navy/80 px-4 py-2.5 text-center backdrop-blur-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold">Learning Orbit</p><p className="mt-0.5 text-xs font-semibold text-white">Practice · Feedback · Progress</p></div>
                </div>
              </div>
            </div>

            <div className="order-3 space-y-4 border-l border-dashed border-brand-gold/30 pl-5 lg:border-0 lg:pl-0">
              {learningSteps.slice(2).map(([step, title, description], index) => (
                <article key={step} className={`group relative rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition duration-300 hover:-translate-y-1 ${index === 0 ? 'hover:border-violet-400/60 hover:bg-violet-400/10' : 'hover:border-amber-400/60 hover:bg-amber-400/10'}`}>
                  <span aria-hidden="true" className="absolute -left-8 top-1/2 hidden w-8 border-t border-dashed border-brand-gold/45 lg:block" />
                  <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full font-heading text-xs font-bold text-brand-navy shadow-lg transition duration-300 group-hover:scale-110 ${index === 0 ? 'bg-violet-300' : 'bg-amber-300'}`}>{step}</span>
                  <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-cream px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-gold-dark">Beyond The Classroom</p>
            <h2 className="font-heading text-3xl font-bold leading-tight text-brand-navy md:text-4xl">Learning support that stays organized</h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted md:text-base">After enrollment, students can access schedules, academic resources, assignments and performance information through the student portal.</p>
            <Link to="/book-demo" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light">
              Experience a Free Demo
            </Link>
          </div>
          <div className="multi-hover-grid grid grid-cols-1 gap-4 sm:grid-cols-3">
            {resources.map(([title, detail, href, action], index) => (
              <article key={title} className="interactive-glow group flex flex-col rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-brand-card transition duration-300 hover:-translate-y-1.5 hover:border-brand-gold/40 hover:shadow-brand-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 font-heading text-sm font-bold text-brand-gold-dark">0{index + 1}</div>
                <h3 className="font-heading font-semibold text-brand-navy">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{detail}</p>
                <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-navy no-underline transition group-hover:text-brand-gold-dark">{action} <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-brand-gold to-brand-gold-dark p-7 md:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-navy/70">Not sure which program fits?</p>
            <h2 className="font-heading text-3xl font-bold text-brand-navy">Let a mentor help you choose</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-navy/80">Tell us the student’s grade, subjects and learning goals. We’ll recommend a suitable program and demo batch.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/fees" className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-brand-navy px-6 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-navy hover:text-white">View Fees</Link>
            <Link to="/book-demo" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light hover:shadow-xl">Book Free Demo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Courses;
