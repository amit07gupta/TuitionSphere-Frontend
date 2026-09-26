import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import StudentHistory from './StudentHistory';
import { fetchStudentOverview, fetchStudent, fetchStudentProfileRequests, transferStudent, updateStudent } from '../../../services/studentApi';
import { fetchBatches } from '../../../services/batchApi';

const statusOptions = ['Active', 'Inactive', 'Blocked'];

function StudentDetails() {
  const { studentId } = useParams();
  const [overview, setOverview] = useState(null);
  const [historyError, setHistoryError] = useState('');
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [allBatches, setAllBatches] = useState([]);
  const [profileRequests, setProfileRequests] = useState([]);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [managementMessage, setManagementMessage] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([fetchStudent(studentId), fetchBatches()]).then(([record, batches]) => { if (active) { setStudent(record); setAllBatches(batches); setPageError(''); } }).catch((error) => { if (active) setPageError(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [studentId]);

  useEffect(() => {
    let active = true;
    fetchStudentOverview(studentId).then((result) => { if (active) { setOverview(result); setHistoryError(''); } }).catch((error) => { if (active) setHistoryError(error.message); });
    return () => { active = false; };
  }, [studentId, historyAttempt]);

  useEffect(() => {
    let active = true;
    fetchStudentProfileRequests(studentId).then((records) => { if (active) setProfileRequests(records); }).catch(() => {});
    return () => { active = false; };
  }, [studentId]);

  if (loading) return <div className="admin-page"><AdminPageHeader eyebrow="Student Records" title="Loading student…" description="Fetching the latest record from the database." icon="students" /></div>;
  if (!student) return <div><AdminPageHeader eyebrow="Student Records" title="Student not found" description={pageError || 'This student record is unavailable.'} icon="students" /><Link to="/admin/students" className="mt-5 inline-flex rounded-xl bg-brand-navy px-4 py-3 text-xs font-bold text-white no-underline">Back to students</Link></div>;

  const cards = [['Student code', student.studentCode], ['Account status', student.status], ['Enrollment status', student.admissionStatus || 'Not enrolled'], ['Current batch', student.batch || 'Not assigned']];
  const availableBatches = allBatches.filter((batch) => batch.id !== student.batchId
    && batch.status === 'Active'
    && batch.enrolled < batch.capacity
    && (batch.gradeId && student.gradeId ? batch.gradeId === student.gradeId : String(batch.grade) === String(student.grade))
    && (batch.boardId && student.boardId ? batch.boardId === student.boardId : (batch.boards || [batch.board]).some((board) => String(board).toUpperCase() === String(student.board).toUpperCase()))
    && batch.academicSessionId === student.academicSessionId);

  const handleStatusChange = async (status) => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateStudent(student.id, { status: status.toUpperCase() });
      setStudent(updated);
      setPageError('');
      setManagementMessage(`Student account status updated to ${status}.`);
    } catch (error) { setPageError(error.message); } finally { setSaving(false); }
  };

  const handleBatchTransfer = async () => {
    const batch = availableBatches.find((item) => item.id === targetBatchId);
    if (!batch || saving) return;
    setSaving(true);
    try {
      const updated = await transferStudent(student.id, batch.id);
      setStudent(updated);
      setPageError('');
      setTargetBatchId('');
      setManagementMessage(`Batch changed to ${batch.name}; database enrollment is synced.`);
    } catch (error) { setPageError(error.message); } finally { setSaving(false); }
  };

  return <div className="admin-page">
    <AdminPageHeader eyebrow="Student 360°" title={student.name} description={`${student.id} · Grade ${student.grade} ${student.board} · ${student.batch}`} icon="students" meta={student.status} />
    {pageError && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{pageError}</p>}
    <Link to="/admin/students" className="mt-4 inline-flex text-xs font-bold text-brand-navy no-underline">← Back to students</Link>
    <Link to={`/admin/students/${student.id}/edit`} className="ml-3 mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-brand-navy no-underline hover:bg-white">Edit student</Link>
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="mt-2 block font-heading text-xl text-brand-navy">{value}</strong></article>)}</section>
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-heading text-lg font-semibold text-brand-navy">Student management</h2><p className="mt-1 text-xs text-slate-500">Update account access or move this student to a compatible active batch.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Current: {student.status}</span></div><div className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(260px,1fr)_auto]"><label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account status<select disabled={saving} value={student.status} onChange={(event) => handleStatusChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-brand-gold">{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transfer batch<select disabled={saving} value={targetBatchId} onChange={(event) => setTargetBatchId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-brand-gold"><option value="">{availableBatches.length ? 'Choose compatible batch' : 'No compatible batch available'}</option>{availableBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name} · {batch.enrolled}/{batch.capacity}</option>)}</select></label><button type="button" disabled={saving || !targetBatchId} onClick={handleBatchTransfer} className="self-end rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Transfer student</button></div>{managementMessage && <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{managementMessage}</p>}</section>
    <section className="mt-4 grid gap-4 lg:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-heading text-lg font-semibold text-brand-navy">Academic profile</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2">{[['Academic session', student.academicSessionName], ['Grade', student.gradeName], ['Board', student.board], ['Batch', student.batch], ['Learning mode', student.learningMode], ['Subjects', student.subjects?.join(', ')], ['Joined on', student.joinedOn], ['Admission ID', student.admissionId]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{value || 'Not available'}</dd></div>)}</dl></article><article className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-heading text-lg font-semibold text-brand-navy">Parent contact</h2><p className="mt-4 text-sm font-bold text-slate-700">{student.parentName || 'Not provided'}</p><p className="mt-4 text-xs text-slate-600">{student.phone ? `+91 ${student.phone}` : 'Phone not provided'}</p><p className="mt-1 text-xs text-slate-600">Alternate Contact Number: {student.alternateContactNumber ? `+91 ${student.alternateContactNumber}` : 'Not provided'}</p><p className="mt-1 break-all text-xs text-slate-600">Student login: {student.email || 'Not provided'}</p></article></section>
    {profileRequests.length > 0 && <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-heading text-lg font-semibold text-brand-navy">Profile correction requests</h2><div className="mt-3 space-y-2">{profileRequests.map((request) => <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-brand-navy">{request.field}</strong><span className="text-[10px] font-semibold text-slate-500">{new Date(request.createdAt).toLocaleDateString('en-IN')} · {request.status}</span></div><p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{request.details}</p></article>)}</div></section>}
    <StudentHistory key={studentId} overview={overview} error={historyError} retry={() => { setHistoryError(''); setOverview(null); setHistoryAttempt((value) => value + 1); }} />
  </div>;
}

export default function StudentDetailsPage() {
  const { studentId } = useParams();
  return <StudentDetails key={studentId} />;
}
