import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { fetchStudent, updateStudent } from '../../../services/studentApi';
import StudentForm from './StudentForm';

function toForm(student) {
  return { name: student.name || '', parentName: student.parentName || '', parentPhone: student.phone || '', dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : '', gender: student.gender || '', address: student.address || '', profileStatus: String(student.profileStatus || 'Incomplete').toUpperCase(), status: String(student.status || 'Active').toUpperCase() };
}

function EditStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { let active = true; fetchStudent(studentId).then((student) => { if (active) setForm(toForm(student)); }).catch((requestError) => { if (active) setError(requestError.message); }); return () => { active = false; }; }, [studentId]);
  const change = (name, value) => { setForm((current) => ({ ...current, [name]: value })); setError(''); };
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try { await updateStudent(studentId, form); navigate(`/admin/students/${studentId}`); }
    catch (requestError) { setError(requestError.message); setSubmitting(false); }
  };

  return <div className="admin-page"><AdminPageHeader eyebrow="Student Management" title="Edit Student" description="Update personal, guardian, profile and account information." icon="students" />{form ? <StudentForm form={form} onChange={change} onSubmit={submit} onCancel={() => navigate(`/admin/students/${studentId}`)} submitting={submitting} error={error} /> : <p className={`mt-5 rounded-xl p-4 text-sm ${error ? 'bg-rose-50 text-rose-700' : 'bg-white text-slate-500'}`}>{error || 'Loading student…'}</p>}</div>;
}

export default EditStudent;
