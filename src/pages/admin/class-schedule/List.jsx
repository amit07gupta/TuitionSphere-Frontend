import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AdminMetricIcon from '../../../components/admin/AdminMetricIcon';
import AdminPagination from '../../../components/admin/AdminPagination';
import useAccessibleModal from '../../../hooks/useAccessibleModal';
import useTablePagination from '../../../hooks/useTablePagination';
import { fetchBatches } from '../../../services/batchApi';
import { fetchTutors } from '../../../services/tutorApi';
import { cancelClassSchedule, createClassSchedule, fetchClassSchedules, updateClassSchedule } from '../../../services/classScheduleApi';
import { scheduleDays } from '../../../data/portal/schedule';
import { scheduleOccursOn } from '../../../utils/scheduleOccursOn';
import ClassScheduleFilters from './ClassScheduleFilters';
import '../board/board.css';
import '../tutor/tutor.css';
import '../batch/batch.css';
import './class-schedule.css';

const getTodayISO = (source = new Date()) => {
  const date = new Date(source);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const dayFromDate = (dateValue) => {
  if (!dateValue) return 'monday';
  const date = new Date(`${dateValue}T00:00:00`);
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Date not set';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const toMinutes = (timeValue) => {
  if (!timeValue) return null;

  const value = String(timeValue).trim().toUpperCase();
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (minutes > 59 || hours > 23) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
  }

  return hours * 60 + minutes;
};

const formatTimeSlot = (minutes) => {
  const hours24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minute).padStart(2, '0')} ${meridiem}`;
};

const TIME_OPTIONS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  return { value: formatTimeSlot(minutes), minutes };
});

const getBatchSubjects = (batch, programs) => {
  if (!batch) return [];

  const directSubjects = Array.isArray(batch.subjects) ? batch.subjects : [];
  if (directSubjects.length) return [...new Set(directSubjects)];

  const legacyCoverage = String(batch.subject || '').trim();
  if (legacyCoverage && legacyCoverage !== 'All Subjects') {
    const aliases = {
      PCM: ['Physics', 'Chemistry', 'Mathematics'],
      PCB: ['Physics', 'Chemistry', 'Biology'],
      'Accounts & Economics': ['Accountancy', 'Economics'],
    };
    return aliases[legacyCoverage]
      ?? [...new Set(legacyCoverage.split(/\s*&\s*|\s*,\s*/).filter(Boolean))];
  }

  const programId = batch.programId ?? batch.courseId ?? batch.program;
  const program = programs.find(
    (item) =>
      item.id === programId ||
      item.programId === programId ||
      item.name === programId ||
      item.title === programId
  );

  return [...new Set(Array.isArray(program?.subjects) ? program.subjects : [])];
};

const getActiveTutorForSubject = (tutor, subject, batch, mode = '') => {
  const activeTutor = tutor.filter((member) => member.status === 'Active');
  if (!subject || !batch) return [];
  const subjectIndex = (batch.subjects || []).findIndex((item) => String(item).toLowerCase() === String(subject).toLowerCase());
  const subjectId = subjectIndex >= 0 ? batch.subjectIds?.[subjectIndex] : '';

  return activeTutor.filter((member) => {
    const subjectMatches = subjectId && member.subjectIds?.length
      ? member.subjectIds.includes(subjectId)
      : member.subjects?.some((item) => String(item).toLowerCase() === String(subject).toLowerCase());
    const gradeMatches = batch.gradeId && member.gradeIds?.length
      ? member.gradeIds.includes(batch.gradeId)
      : member.grades?.some((grade) => String(grade) === String(batch.grade));
    const boardMatches = batch.boardId && member.boardIds?.length
      ? member.boardIds.includes(batch.boardId)
      : member.boards?.some((board) => String(board).toUpperCase() === String(batch.board).toUpperCase());
    const streamMatches = !batch.stream || !member.streams?.length || member.streams.includes(batch.stream);
    const modeMatches = !mode || !member.mode?.length || member.mode.includes(mode);
    return subjectMatches && gradeMatches && boardMatches && streamMatches && modeMatches;
  });
};

const getBatchTutorForSubject = (batch, tutor, subject, mode = '') => {
  const subjectIndex = (batch?.subjects || []).findIndex((item) => String(item).toLowerCase() === String(subject).toLowerCase());
  const subjectId = subjectIndex >= 0 ? batch?.subjectIds?.[subjectIndex] : '';
  const assignedTutorId = batch?.tutorAssignments?.find((item) => item.subjectId === subjectId)?.tutorId;
  if (!assignedTutorId) return [];
  return getActiveTutorForSubject(tutor, subject, batch, mode).filter((member) => member.id === assignedTutorId);
};

const blankClass = {
  gradeId: '',
  batchId: '',
  date: getTodayISO(),
  day: dayFromDate(getTodayISO()),
  scheduleType: 'Single',
  repeatUntil: getTodayISO(),
  repeatDays: [],
  subject: '',
  topic: '',
  tutorId: '',
  startTime: '5:00 PM',
  endTime: '6:00 PM',
  mode: 'Offline',
  location: 'Room A-2',
  meetingUrl: '',
  status: 'Scheduled',
  tone: 'sky',
};

const inputClass =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const labelClass = 'flex flex-col gap-1.5 text-xs font-semibold text-slate-600';

const statusStyles = {
  Completed: 'bg-slate-100 text-slate-600',
  Upcoming: 'bg-emerald-100 text-emerald-700',
  Scheduled: 'bg-sky-100 text-sky-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const getScheduleStatus = (item) => {
  if (item.status === 'Cancelled') return 'Cancelled';
  const date = item.endDate || item.date;
  const minutes = toMinutes(item.endTime);
  if (!date || minutes === null) return 'Scheduled';
  const end = new Date(`${date}T00:00:00`);
  end.setMinutes(minutes);
  return Date.now() >= end.getTime() ? 'Completed' : 'Scheduled';
};

function ActionIcon({ name }) {
  const paths = {
    edit: (
      <>
        <path d="M4 20h4l11-11-4-4L4 16v4Z" />
        <path d="m13.5 6.5 4 4M12 20h8" />
      </>
    ),
    cancel: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function ClassScheduleManagement() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [programs] = useState([]);
  const [tutor, setTutor] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ grade: 'all', board: 'all', batch: 'all', mode: 'all', status: 'all' });
  const [editingClass, setEditingClass] = useState(null);
  const [formValues, setFormValues] = useState(blankClass);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [publishedMessage, setPublishedMessage] = useState(
    'Schedule is loaded from the database.'
  );

  const dialogRef = useAccessibleModal(Boolean(editingClass), () => {
    setEditingClass(null);
    setFormError('');
  });

  useEffect(() => {
    let active = true;
    Promise.all([fetchClassSchedules(), fetchBatches(), fetchTutors()])
      .then(([nextClasses, nextBatches, nextTutors]) => {
        if (!active) return;
        setClasses(nextClasses); setBatches(nextBatches); setTutor(nextTutors);
      })
      .catch((error) => { if (active) setPublishedMessage(error.message); });
    return () => { active = false; };
  }, []);

  const filteredClasses = useMemo(
    () => {
      const term = search.trim().toLowerCase();
      return classes
        .filter((item) => {
          const batch = batches.find((record) => record.id === item.batchId);
          return (!term || [item.batchName, item.subject, item.mentor, item.topic, item.location, item.board, item.grade].some((value) => String(value || '').toLowerCase().includes(term)))
            && (filters.grade === 'all' || batch?.gradeId === filters.grade)
            && (filters.board === 'all' || batch?.boardId === filters.board)
            && (filters.batch === 'all' || item.batchId === filters.batch)
            && (filters.mode === 'all' || item.mode === filters.mode)
            && (filters.status === 'all' || getScheduleStatus(item) === filters.status);
        })
        .sort((a, b) => {
          const dateA = a.startDate || a.date || '9999-12-31';
          const dateB = b.startDate || b.date || '9999-12-31';
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0);
        });
    },
    [batches, classes, filters, search]
  );

  const gradeOptions = useMemo(() => [...new Map(batches.map((item) => [item.gradeId, { value: item.gradeId, label: `Grade ${item.grade}` }])).values()].filter((item) => item.value), [batches]);
  const boardOptions = useMemo(() => [...new Map(batches.map((item) => [item.boardId, { value: item.boardId, label: item.board }])).values()].filter((item) => item.value), [batches]);

  const activeClasses = classes.filter((item) => item.status !== 'Cancelled');
  const { page: classPage, pageSize: classPageSize, pageItems: classPageItems, setPage: setClassPage, serialNumber: classSerial } = useTablePagination(filteredClasses);
  const onlineCount = activeClasses.filter((item) => item.mode === 'Online').length;
  const assignedTutor = new Set(activeClasses.map((item) => item.tutorId).filter(Boolean)).size;

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === formValues.batchId),
    [batches, formValues.batchId]
  );

  const schedulableBatches = useMemo(
    () => batches.filter((batch) => {
      return batch.status === 'Active' && batch.academicSession?.status === 'ACTIVE';
    }),
    [batches]
  );

  const formGradeOptions = useMemo(() => {
    const selectableBatches = selectedBatch && !schedulableBatches.some((batch) => batch.id === selectedBatch.id)
      ? [...schedulableBatches, selectedBatch]
      : schedulableBatches;

    return [...new Map(
      selectableBatches.map((batch) => [
        batch.gradeId,
        { value: batch.gradeId, label: `Grade ${batch.grade}`, numericValue: Number(batch.grade) },
      ])
    ).values()]
      .filter((option) => option.value)
      .sort((a, b) => a.numericValue - b.numericValue || a.label.localeCompare(b.label));
  }, [schedulableBatches, selectedBatch]);

  const availableBatchesForGrade = useMemo(() => {
    if (!formValues.gradeId) return [];
    return batches.filter((batch) => {
      const isAvailable = schedulableBatches.some((item) => item.id === batch.id)
        || batch.id === formValues.batchId;
      return isAvailable && batch.gradeId === formValues.gradeId;
    });
  }, [batches, formValues.batchId, formValues.gradeId, schedulableBatches]);

  const availableSubjects = useMemo(() => {
    return getBatchSubjects(selectedBatch, programs);
  }, [programs, selectedBatch]);

  const availableTutor = useMemo(() => {
    return getBatchTutorForSubject(selectedBatch, tutor, formValues.subject, formValues.mode);
  }, [tutor, formValues.subject, formValues.mode, selectedBatch]);

  const openAddModal = () => {
    setFormValues({
      ...blankClass,
      gradeId: '',
      batchId: '',
      date: getTodayISO(),
      day: dayFromDate(getTodayISO()),
      subject: '',
      tutorId: '',
    });
    setFormError('');
    setEditingClass({ id: null });
  };

  const openEditModal = (item) => {
    const date = item.startDate || item.date || getTodayISO();
    const batch = batches.find((record) => record.id === item.batchId);
    const mode = batch?.mode || item.mode || 'Offline';

    setFormValues({
      ...blankClass,
      ...item,
      gradeId: batch?.gradeId || '',
      scheduleType: item.scheduleType === 'Recurring' ? 'Weekly' : (item.scheduleType || 'Single'),
      date,
      day: item.day || dayFromDate(date),
      repeatUntil: item.endDate || item.repeatUntil || item.date || date,
      repeatDays: item.repeatDays?.length ? item.repeatDays : [item.day || dayFromDate(date)],
      startTime: toMinutes(item.startTime) === null ? blankClass.startTime : formatTimeSlot(toMinutes(item.startTime)),
      endTime: toMinutes(item.endTime) === null ? blankClass.endTime : formatTimeSlot(toMinutes(item.endTime)),
      mode,
      location: mode === 'Online' ? item.location || 'Live classroom' : item.location || 'Room A-2',
    });
    setFormError('');
    setEditingClass(item);
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => {
      if (name === 'date') {
        return {
          ...current,
          date: value,
          day: dayFromDate(value),
          repeatUntil: current.repeatUntil < value ? value : current.repeatUntil,
          repeatDays: current.repeatDays.length ? current.repeatDays : [dayFromDate(value)],
        };
      }

      if (name === 'gradeId') {
        const gradeBatches = schedulableBatches.filter((batch) => batch.gradeId === value);
        const currentBatchBelongsToGrade = batches.some(
          (batch) => batch.id === current.batchId && batch.gradeId === value
        );

        if (currentBatchBelongsToGrade) {
          return { ...current, gradeId: value };
        }

        if (gradeBatches.length === 1) {
          const batch = gradeBatches[0];
          const subjects = getBatchSubjects(batch, programs);
          const subject = subjects[0] ?? '';
          const mode = batch.mode || 'Offline';
          const matchingTutor = getBatchTutorForSubject(batch, tutor, subject, mode);
          const sessionStart = String(batch.academicSession?.startDate || '').slice(0, 10);
          const sessionEnd = String(batch.academicSession?.endDate || '').slice(0, 10);
          const earliestDate = sessionStart > getTodayISO() ? sessionStart : getTodayISO();
          const date = !current.date || current.date < earliestDate || (sessionEnd && current.date > sessionEnd)
            ? earliestDate
            : current.date;

          return {
            ...current,
            gradeId: value,
            batchId: batch.id,
            subject,
            tutorId: matchingTutor[0]?.id ?? '',
            date,
            day: dayFromDate(date),
            repeatUntil: date,
            mode,
            location: mode === 'Online' ? 'Live classroom' : 'Room A-2',
            meetingUrl: mode === 'Online' ? current.meetingUrl : '',
          };
        }

        return {
          ...current,
          gradeId: value,
          batchId: '',
          subject: '',
          tutorId: '',
          mode: 'Offline',
          location: 'Room A-2',
          meetingUrl: '',
        };
      }

      if (name === 'batchId') {
        const batch = batches.find((item) => item.id === value);
        const subjects = getBatchSubjects(batch, programs);
        const subject = subjects.includes(current.subject) ? current.subject : subjects[0] ?? '';
        const mode = batch?.mode || 'Offline';
        const matchingTutor = getBatchTutorForSubject(batch, tutor, subject, mode);
        const tutorId = matchingTutor.some((member) => member.id === current.tutorId)
          ? current.tutorId
          : matchingTutor[0]?.id ?? '';
        const sessionStart = String(batch?.academicSession?.startDate || '').slice(0, 10);
        const sessionEnd = String(batch?.academicSession?.endDate || '').slice(0, 10);
        const earliestDate = sessionStart > getTodayISO() ? sessionStart : getTodayISO();
        const date = !current.date || current.date < earliestDate || (sessionEnd && current.date > sessionEnd)
          ? earliestDate
          : current.date;
        const repeatUntil = !current.repeatUntil || current.repeatUntil < date || (sessionEnd && current.repeatUntil > sessionEnd)
          ? date
          : current.repeatUntil;

        return {
          ...current,
          gradeId: batch?.gradeId || current.gradeId,
          batchId: value,
          subject,
          tutorId,
          date,
          day: dayFromDate(date),
          repeatUntil,
          mode,
          location: mode === 'Online' ? 'Live classroom' : 'Room A-2',
          meetingUrl: mode === 'Online' ? current.meetingUrl : '',
        };
      }

      if (name === 'subject') {
        const batch = batches.find((item) => item.id === current.batchId);
        const matchingTutor = getBatchTutorForSubject(batch, tutor, value, current.mode);
        const tutorId = matchingTutor.some((member) => member.id === current.tutorId)
          ? current.tutorId
          : matchingTutor[0]?.id ?? '';

        return { ...current, subject: value, tutorId };
      }

      if (name === 'startTime') {
        const startMinutes = toMinutes(value);
        const currentEnd = toMinutes(current.endTime);
        const nextEnd = TIME_OPTIONS.find((option) => option.minutes >= startMinutes + 60)
          || TIME_OPTIONS[TIME_OPTIONS.length - 1];
        return {
          ...current,
          startTime: value,
          endTime: currentEnd > startMinutes ? current.endTime : nextEnd.value,
        };
      }

      return { ...current, [name]: value };
    });

    setFormError('');
  };

  const toggleRepeatDay = (day) => {
    setFormValues((current) => ({
      ...current,
      repeatDays: current.repeatDays.includes(day)
        ? current.repeatDays.filter((item) => item !== day)
        : [...current.repeatDays, day],
    }));
    setFormError('');
  };

  const getScheduleDates = () => {
    if (formValues.scheduleType !== 'Weekly') return [formValues.date];
    if (!formValues.repeatUntil || formValues.repeatUntil < formValues.date || !formValues.repeatDays.length) return [];
    const dates = [];
    const cursor = new Date(`${formValues.date}T00:00:00`);
    const end = new Date(`${formValues.repeatUntil}T00:00:00`);
    while (cursor <= end) {
      const value = getTodayISO(cursor);
      if (formValues.repeatDays.includes(dayFromDate(value))) dates.push(value);
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const hasTimeConflict = (record) => {
    const start = toMinutes(record.startTime);
    const end = toMinutes(record.endTime);

    if (start === null || end === null || end <= start) {
      return true;
    }

    return classes.some((item) => {
      // Editing the same class is not a conflict.
      if (item.id === record.id) {
        return false;
      }

      // Cancelled classes do not occupy the time slot.
      if (item.status === 'Cancelled') {
        return false;
      }

      // Different batch = allowed.
      if (item.batchId !== record.batchId) {
        return false;
      }

      // The existing single or recurring schedule must occur on this date.
      if (!record.date || !scheduleOccursOn(item, record.date)) {
        return false;
      }

      const existingStart = toMinutes(item.startTime);
      const existingEnd = toMinutes(item.endTime);

      if (
        existingStart === null ||
        existingEnd === null ||
        existingEnd <= existingStart
      ) {
        return false;
      }

      // Any overlapping time is a conflict,
      // regardless of subject.
      return start < existingEnd && end > existingStart;
    });
  };

  const findResourceConflict = (record) => {
    const start = toMinutes(record.startTime);
    const end = toMinutes(record.endTime);
    if (start === null || end === null) return null;

    return classes.find((item) => {
      if (item.id === record.id || item.status === 'Cancelled' || !scheduleOccursOn(item, record.date)) return false;
      const existingStart = toMinutes(item.startTime);
      const existingEnd = toMinutes(item.endTime);
      if (existingStart === null || existingEnd === null) return false;
      const overlaps = start < existingEnd && end > existingStart;
      if (!overlaps) return false;

      const sameTutor = record.tutorId && item.tutorId === record.tutorId;
      const sameOfflineRoom = record.mode === 'Offline' && item.mode === 'Offline'
        && String(record.location || '').trim().toLowerCase() === String(item.location || '').trim().toLowerCase();
      return sameTutor || sameOfflineRoom;
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const start = toMinutes(formValues.startTime);
    const end = toMinutes(formValues.endTime);

    if (!formValues.date) {
      setFormError('Please select a class date.');
      return;
    }

    if (start === null || end === null || end <= start) {
      setFormError('Please enter a valid time range. End time must be after start time.');
      return;
    }

    const batch = batches.find((item) => item.id === formValues.batchId);
    if (!batch) {
      setFormError('Please select an active batch.');
      return;
    }
    const batchSubjects = getBatchSubjects(batch, programs);

    if (!batchSubjects.length) {
      setFormError('Configure subjects in the selected batch before scheduling a class.');
      return;
    }

    if (batchSubjects.length && !batchSubjects.includes(formValues.subject)) {
      setFormError('Selected subject is not available for this batch.');
      return;
    }

    const assignedTutor = tutor.find((item) => item.id === formValues.tutorId);
    if (!assignedTutor || !availableTutor.some((item) => item.id === assignedTutor.id)) {
      setFormError('No compatible active tutor is selected for this batch, subject and teaching mode.');
      return;
    }

    const scheduleDates = getScheduleDates();
    if (!scheduleDates.length) {
      setFormError('Select at least one repeat day and a valid repeat-until date.');
      return;
    }

    for (const date of scheduleDates) {
      const candidate = { ...formValues, date, day: dayFromDate(date), mode: batch.mode || 'Offline' };
      if (hasTimeConflict(candidate)) {
        setFormError(`This batch already has an overlapping class on ${formatDate(date)}.`);
        return;
      }
      const resourceConflict = findResourceConflict(candidate);
      if (resourceConflict) {
        const sameTutor = resourceConflict.tutorId === formValues.tutorId;
        setFormError(sameTutor
          ? `This tutor is already assigned to another class on ${formatDate(date)} during this time.`
          : `This room is already occupied on ${formatDate(date)} during this time.`);
        return;
      }
    }


    if (formValues.mode === 'Online' && !formValues.meetingUrl.trim()) {
      setFormError('Please enter the meeting link for this online class.');
      return;
    }

    const baseRecord = {
      ...formValues,
      subjectId: batch.subjectIds?.[(batch.subjects || []).findIndex((name) => name === formValues.subject)] || '',
      batchName: batch?.name || '',
      grade: batch?.grade || '',
      board: batch?.board || batch?.boards?.[0] || '',
      academicSessionId: batch?.academicSessionId || '',
      mode: batch.mode || 'Offline',
      status: 'Scheduled',
      mentor: assignedTutor?.name ?? 'Academic Team',
      location:
        formValues.mode === 'Online'
          ? formValues.location || 'Live classroom'
          : formValues.location || 'Room A-2',
    };

    const isRecurring = formValues.scheduleType === 'Weekly';
    const scheduleRecord = {
      ...baseRecord,
      id: editingClass.id ?? `SCH-${Date.now()}`,
      scheduleType: isRecurring ? 'Recurring' : 'Single',
      date: isRecurring ? undefined : formValues.date,
      day: isRecurring ? undefined : dayFromDate(formValues.date),
      startDate: formValues.date,
      endDate: isRecurring ? formValues.repeatUntil : formValues.date,
      repeatUntil: undefined,
      repeatDays: isRecurring ? formValues.repeatDays : [dayFromDate(formValues.date)],
      cancelledDates: editingClass.cancelledDates || [],
    };
    try {
      setIsSaving(true);
      const saved = editingClass.id
        ? await updateClassSchedule(editingClass.id, scheduleRecord)
        : await createClassSchedule(scheduleRecord);
      setClasses((current) => editingClass.id
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved]);
      setPublishedMessage(editingClass.id
        ? 'Class updated and published successfully.'
        : isRecurring ? 'Recurring schedule created as one record.' : 'One-time class created successfully.');
      setEditingClass(null);
      setFormError('');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelClass = async (classId) => {
    const item = classes.find((entry) => entry.id === classId);
    if (!item || item.status === 'Cancelled') return;

    const confirmed = window.confirm(
      item.scheduleType === 'Recurring'
        ? `Cancel the complete ${item.subject} schedule from ${formatDate(item.startDate)} to ${formatDate(item.endDate)}?`
        : `Cancel ${item.subject} on ${formatDate(item.date || item.startDate)} from ${item.startTime} to ${item.endTime}?`
    );

    if (!confirmed) return;

    try {
      const cancelled = await cancelClassSchedule(classId);
      setClasses((current) => current.map((entry) => entry.id === classId ? cancelled : entry));
      setPublishedMessage('Class schedule cancelled successfully.');
    } catch (error) {
      setPublishedMessage(error.message);
    }
  };

  return (
    <div className="admin-page board-page batch-page schedule-page">
      <header className="tutor-page-heading"><span className="tutor-heading-icon"><AdminMetricIcon name="scheduled" /></span><div><h1>Class Schedule</h1><p>Create and manage one-time or recurring batch timetables.</p></div></header>

      <section
        aria-label="Schedule summary"
        className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          [
            'Published Classes',
            activeClasses.length,
            'border-sky-200 bg-sky-50 text-sky-900',
            'scheduled',
          ],
          [
            'Online Classes',
            onlineCount,
            'border-violet-200 bg-violet-50 text-violet-900',
            'schedule',
          ],
          [
            'Tutor Assigned',
            assignedTutor,
            'border-emerald-200 bg-emerald-50 text-emerald-900',
            'tutor',
          ],
          [
            'Active Batches',
            new Set(activeClasses.map((item) => item.batchId)).size,
            'border-amber-200 bg-amber-50 text-amber-900',
            'batches',
          ],
        ].map(([label, value, style, icon]) => (
          <article
            key={label}
            className={`flex items-center justify-between rounded-xl border border-l-4 px-4 py-3 shadow-sm ${style}`}
          >
            <span><span className="block text-[10px] font-semibold opacity-75">{label}</span><strong className="mt-0.5 block font-heading text-xl">{value}</strong></span>
            <span className="tutor-heading-icon"><AdminMetricIcon name={icon} className="h-[18px] w-[18px]" /></span>
          </article>
        ))}
      </section>

      <section className="board-directory mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Published timetable
            </h2>
            <p className="mt-1 text-xs text-emerald-700">✓ {publishedMessage}</p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-gold px-5 text-xs font-bold text-brand-navy shadow-sm transition hover:brightness-95"
          >
            + Add Class
          </button>
        </div>

        <ClassScheduleFilters
          search={search}
          onSearchChange={setSearch}
          batches={batches}
          grades={gradeOptions}
          boards={boardOptions}
          filters={filters}
          onFilterChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
          onClear={() => { setSearch(''); setFilters({ grade: 'all', board: 'all', batch: 'all', mode: 'all', status: 'all' }); }}
        />

        <div className="overflow-x-auto">
          <table className="academic-operations-table academic-actions-table w-full min-w-[980px] text-left text-xs">
            <thead>
              <tr>
                {[
                  'S.N.',
                  'Batch',
                  'Grade & Board',
                  'Subject',
                  'Tutor',
                  'Mode / Location',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`border border-blue-300/20 px-4 py-3 font-semibold ${
                      heading === 'Actions'
                        ? 'sticky right-0 z-10 min-w-[108px]'
                        : ''
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {classPageItems.map((item, index) => {
                const batch = batches.find((entry) => entry.id === item.batchId);
                return (
                  <tr
                    key={item.id}
                    className="group transition hover:bg-blue-50/50"
                  >
                    <td className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-500">
                      {classSerial(index)}
                    </td>
                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">
                        {batch?.name ?? item.batchId}
                      </strong>
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">Grade {item.grade || batch?.grade || '—'}</strong>
                      <span className="mt-1 block text-[10px] text-slate-400">{item.board || batch?.board || '—'}</span>
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      <strong className="text-brand-navy">{item.subject}</strong>
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      {item.mentor || 'Academic Team'}
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>{item.mode}</strong>
                        {item.mode === 'Online' && item.meetingUrl && (
                          <a
                            href={item.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            Join link ↗
                          </a>
                        )}
                      </div>
                      {item.mode !== 'Online' && (
                        <span className="mt-1 block text-slate-400">
                          {item.location || '—'}
                        </span>
                      )}
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          statusStyles[getScheduleStatus(item)] ?? statusStyles.Scheduled
                        }`}
                      >
                        {getScheduleStatus(item)}
                      </span>
                    </td>

                    <td className="sticky right-0 z-[2] min-w-[108px] border border-slate-200 bg-white px-3 py-3 shadow-[-7px_0_14px_rgba(15,23,42,0.05)] transition group-hover:bg-blue-50">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          aria-label={`Edit ${item.subject} class`}
                          title="Edit class"
                          className="admin-action-native flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-100 !text-indigo-700 transition hover:border-indigo-600 hover:bg-indigo-600 hover:!text-white"
                        >
                          <ActionIcon name="edit" />
                        </button>

                        <button
                          type="button"
                          onClick={() => cancelClass(item.id)}
                          disabled={item.status === 'Cancelled'}
                          aria-label={`Cancel ${item.subject} class`}
                          title="Cancel class"
                          className="admin-action-native flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-100 !text-rose-700 transition hover:border-rose-600 hover:bg-rose-600 hover:!text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ActionIcon name="cancel" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <AdminPagination page={classPage} pageSize={classPageSize} totalItems={filteredClasses.length} onPageChange={setClassPage} />

        {!filteredClasses.length && (
          <div className="p-12 text-center text-sm text-slate-500">
            No classes match the selected filters.
          </div>
        )}
      </section>

      {editingClass && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditingClass(null)
          }
        >
          <form
            ref={dialogRef}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            onSubmit={handleSave}
            className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl"
          >
            <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  Timetable Editor
                </p>
                <h2
                  id="schedule-modal-title"
                  className="mt-1 font-heading text-xl font-bold text-brand-navy"
                >
                  {editingClass.id ? 'Edit class' : 'Add a new class'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingClass(null)}
                aria-label="Close timetable editor"
                className="h-9 w-9 rounded-lg bg-slate-100 text-lg text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {formError && (
                <div
                  role="alert"
                  className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 sm:mx-5 sm:mt-5"
                >
                  {formError}
                </div>
              )}

              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <label className={labelClass}>
                <span className="flex items-center justify-between gap-3">
                  <span>Grade</span>
                  {formValues.gradeId && (
                    <span className="font-normal text-blue-600">
                      {availableBatchesForGrade.length} {availableBatchesForGrade.length === 1 ? 'batch' : 'batches'} available
                    </span>
                  )}
                </span>
                <select
                  required
                  name="gradeId"
                  value={formValues.gradeId}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="">Select grade</option>
                  {formGradeOptions.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Batch
                <select
                  required
                  name="batchId"
                  value={formValues.batchId}
                  onChange={updateField}
                  disabled={!formValues.gradeId || !availableBatchesForGrade.length}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                >
                  <option value="">
                    {!formValues.gradeId
                      ? 'Select grade first'
                      : availableBatchesForGrade.length
                        ? 'Select batch'
                        : 'No active batches available'}
                  </option>
                  {availableBatchesForGrade.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} · {batch.board}{batch.stream ? ` · ${batch.stream}` : ''} · {batch.mode}
                      </option>
                    ))}
                </select>
              </label>

              {selectedBatch && <div className={`grid grid-cols-2 gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 sm:col-span-2 ${selectedBatch.stream ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
                {[
                  ['Session', selectedBatch.academicSession?.name],
                  ['Grade', `Grade ${selectedBatch.grade}`],
                  ['Board', selectedBatch.board],
                  ...(selectedBatch.stream ? [['Stream', selectedBatch.stream]] : []),
                  ['Mode', selectedBatch.mode],
                ].map(([label, value]) => <div key={label}><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span><strong className="mt-1 block text-xs text-brand-navy">{value || '—'}</strong></div>)}
              </div>}

              <label className={labelClass}>
                Start Date
                <DatePicker
                  selected={formValues.date ? new Date(`${formValues.date}T00:00:00`) : null}
                  onChange={(date) => {
                    const value = date ? getTodayISO(date) : '';
                    setFormValues((current) => ({
                      ...current,
                      date: value,
                      day: dayFromDate(value),
                      repeatUntil: current.repeatUntil < value ? value : current.repeatUntil,
                      repeatDays: current.repeatDays.length ? current.repeatDays : [dayFromDate(value)],
                    }));
                    setFormError('');
                  }}
                  minDate={editingClass.id && formValues.date ? new Date(`${formValues.date}T00:00:00`) : new Date()}
                  maxDate={selectedBatch?.academicSession?.endDate ? new Date(selectedBatch.academicSession.endDate) : undefined}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select start date"
                  wrapperClassName="w-full"
                  className={inputClass}
                  required
                />
              </label>

              <label className={labelClass}>
                Schedule Type
                <select name="scheduleType" value={formValues.scheduleType} onChange={updateField} className={inputClass}>
                  <option>Single</option>
                  <option value="Weekly">Recurring</option>
                </select>
              </label>

              {formValues.scheduleType === 'Weekly' && <>
                <label className={labelClass}>
                  End Date
                  <DatePicker
                    selected={formValues.repeatUntil ? new Date(`${formValues.repeatUntil}T00:00:00`) : null}
                    onChange={(date) => {
                      setFormValues((current) => ({ ...current, repeatUntil: date ? getTodayISO(date) : '' }));
                      setFormError('');
                    }}
                    minDate={formValues.date ? new Date(`${formValues.date}T00:00:00`) : new Date()}
                    maxDate={selectedBatch?.academicSession?.endDate ? new Date(selectedBatch.academicSession.endDate) : undefined}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select end date"
                    wrapperClassName="w-full"
                    className={inputClass}
                    required
                  />
                </label>
                <fieldset className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                  <legend className="px-1 text-xs font-semibold text-slate-600">Repeat On</legend>
                  <div className="flex flex-wrap gap-2">{scheduleDays.map((day) => <label key={day.key} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${formValues.repeatDays.includes(day.key) ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}><input type="checkbox" className="sr-only" checked={formValues.repeatDays.includes(day.key)} onChange={() => toggleRepeatDay(day.key)} />{day.label.slice(0, 3)}</label>)}</div>
                </fieldset>
              </>}

              <label className={labelClass}>
                Subject
                <select
                  required
                  name="subject"
                  value={formValues.subject}
                  onChange={updateField}
                  className={inputClass}
                >
                  {availableSubjects.length ? (
                    availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))
                  ) : (
                    <option value="">No subjects configured</option>
                  )}
                </select>
              </label>

              <label className={labelClass}>
                <span>Topic <span className="font-normal text-slate-400">(Optional)</span></span>
                <input
                  name="topic"
                  value={formValues.topic}
                  onChange={updateField}
                  placeholder="Enter class topic"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Tutor
                <select
                  required
                  name="tutorId"
                  value={formValues.tutorId}
                  onChange={updateField}
                  disabled={availableTutor.length === 1}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                >
                  <option value="">{availableTutor.length ? 'Assigned tutor' : 'No tutor assigned in batch setup'}</option>
                  {availableTutor.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Teaching Mode
                <input value={formValues.mode} readOnly className={`${inputClass} cursor-not-allowed bg-slate-100`} />
              </label>

              <label className={labelClass}>
                Start Time
                <select
                  required
                  name="startTime"
                  value={formValues.startTime}
                  onChange={updateField}
                  className={inputClass}
                >
                  {TIME_OPTIONS.slice(0, -1).map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                End Time
                <select
                  required
                  name="endTime"
                  value={formValues.endTime}
                  onChange={updateField}
                  className={inputClass}
                >
                  {TIME_OPTIONS
                    .filter((option) => option.minutes > (toMinutes(formValues.startTime) ?? -1))
                    .map((option) => (
                      <option key={option.value} value={option.value}>{option.value}</option>
                    ))}
                </select>
              </label>

              {formValues.mode !== 'Online' && (
                <label className={labelClass}>
                  Room / Location
                  <input
                    required
                    name="location"
                    value={formValues.location}
                    onChange={updateField}
                    placeholder="Room A-2"
                    className={inputClass}
                  />
                </label>
              )}

              {formValues.mode === 'Online' && (
                <label className={`${labelClass} sm:col-span-2`}>
                  Meeting Link
                  <input
                    required
                    name="meetingUrl"
                    type="url"
                    value={formValues.meetingUrl}
                    onChange={updateField}
                    placeholder="https://meeting.example.com/class"
                    className={inputClass}
                  />
                </label>
              )}
              </div>
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="min-h-10 rounded-xl border border-slate-300 px-4 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="min-h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save & Publish'}
              </button>
            </footer>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ClassScheduleManagement;
