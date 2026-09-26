import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useDemoSetup from '../../hooks/useDemoSetup';

const streams = [
  ['science', 'Science'],
  ['commerce', 'Commerce'],
  ['economics', 'Economics Only'],
];

const batches = [
  { id: 'weekday-evening', title: 'Weekday Evening', timing: 'Mon-Fri · 5:00 PM', seats: '6 seats available' },
  { id: 'weekend-morning', title: 'Weekend Morning', timing: 'Sat-Sun · 10:00 AM', seats: '4 seats available' },
  { id: 'online-flex', title: 'Online Flexible', timing: '3 live classes / week', seats: '8 seats available' },
];

function getRecommendation(selectedGrade, stream) {
  const gradeNumber = Number(selectedGrade);
  if (!gradeNumber) return null;
  if (gradeNumber <= 5) return { title: 'Primary Foundation', detail: 'English, Mathematics, EVS and General Knowledge' };
  if (gradeNumber <= 8) return { title: 'Middle School Foundation', detail: 'Mathematics, Science, Social Studies and English' };
  if (gradeNumber <= 10) return { title: 'Board Preparation', detail: 'Complete board-focused preparation with tests and doubt sessions' };
  if (!stream) return null;
  const map = {
    science: { title: 'Science Stream', detail: 'Physics, Chemistry, Mathematics/Biology with test series' },
    commerce: { title: 'Commerce Stream', detail: 'Accountancy, Business Studies and Economics' },
    economics: { title: 'Economics Specialized Track', detail: 'Microeconomics, Macroeconomics and Indian Economic Development' },
  };
  return map[stream];
}

function CourseFinder() {
  const demoSetups = useDemoSetup(true);
  const gradeOptions = useMemo(() => Array.from(new Map(demoSetups.filter((setup) => setup.grade).map((setup) => [setup.grade.id, setup.grade])).values()).sort((a, b) => Number(a.value) - Number(b.value)), [demoSetups]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [stream, setStream] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('weekday-evening');
  const showStream = Number(selectedGrade) >= 11;
  const recommendation = useMemo(() => getRecommendation(selectedGrade, stream), [selectedGrade, stream]);

  return (
    <section className="px-5 py-10 md:px-12 md:py-14">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl bg-brand-navy shadow-brand-hover lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative overflow-hidden p-7 text-white md:p-10">
          <div aria-hidden="true" className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full border-[35px] border-brand-gold/10" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Find Your Program</p>
          <h2 className="relative font-heading text-3xl font-bold leading-tight text-white">The right learning path in a few clicks</h2>
          <p className="relative mt-4 max-w-md text-sm leading-7 text-slate-300">Select the student’s grade and stream to see the most relevant TuitionSphere program.</p>
        </div>

        <div className="bg-white p-7 md:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              Select Grade
              <select value={selectedGrade} onChange={(event) => { setSelectedGrade(event.target.value); setStream(''); setSelectedBatch('weekday-evening'); }} className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-brand-text outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15">
                <option value="">Choose a grade</option>
                {gradeOptions.map((grade) => <option key={grade.id} value={String(grade.value)}>{grade.name}</option>)}
              </select>
            </label>

            <label className={`flex flex-col gap-2 text-sm font-semibold text-brand-navy transition ${showStream ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
              Select Stream
              <select value={stream} onChange={(event) => setStream(event.target.value)} disabled={!showStream} className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-brand-text outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15">
                <option value="">Choose a stream</option>
                {streams.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-6 min-h-32 rounded-2xl border border-dashed border-brand-navy/20 bg-brand-cream p-5">
            {recommendation ? (
              <div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">Recommended program</p><h3 className="mt-1 font-heading text-xl font-semibold text-brand-navy">{recommendation.title}</h3><p className="mt-2 text-sm text-brand-muted">{recommendation.detail}</p></div>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-navy">Available demo batches</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {batches.map((batch) => <button key={batch.id} type="button" onClick={() => setSelectedBatch(batch.id)} className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${selectedBatch === batch.id ? 'border-brand-gold bg-white shadow-md ring-2 ring-brand-gold/15' : 'border-brand-navy/10 bg-white/70 hover:border-brand-gold/40'}`}><strong className="block text-sm text-brand-navy">{batch.title}</strong><span className="mt-1 block text-xs text-brand-muted">{batch.timing}</span><span className="mt-2 block text-[11px] font-semibold text-emerald-700">{batch.seats}</span></button>)}
                </div>
                <div className="mt-5 flex justify-end"><Link to={`/book-demo?program=${encodeURIComponent(recommendation.title)}&grade=${selectedGrade}&stream=${stream}`} className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-brand-navy px-5 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-brand-navy-light sm:w-auto">Book Selected Demo</Link></div>
              </div>
            ) : (
              <div className="flex min-h-20 items-center justify-center text-center text-sm text-brand-muted">{showStream ? 'Select a stream to view your recommended program.' : 'Select a grade to view your recommended program.'}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CourseFinder;
