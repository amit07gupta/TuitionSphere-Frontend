export const scheduleStudent = {
  studentId: 'TS-2401',
  batchId: 'BAT-104',
  batchName: 'Grade 10 Evening A',
  grade: '10',
  board: 'CBSE',
  learningMode: 'Hybrid',
};

const dayDefinitions = [
  ['monday', 'Mon', 'Monday'], ['tuesday', 'Tue', 'Tuesday'],
  ['wednesday', 'Wed', 'Wednesday'], ['thursday', 'Thu', 'Thursday'],
  ['friday', 'Fri', 'Friday'], ['saturday', 'Sat', 'Saturday'],
];
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

export const scheduleDays = dayDefinitions.map(([key, shortLabel, label], index) => {
  const value = new Date(monday);
  value.setDate(monday.getDate() + index);
  return { key, shortLabel, label, date: value.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), isToday: value.toDateString() === today.toDateString() };
});

export const weeklyClasses = [
  { id: 'CLS-101', studentId: 'TS-2401', batchId: 'BAT-104', day: 'monday', subject: 'Mathematics', topic: 'Quadratic Equations', tutorId: 'TUT-001', mentor: 'Rajesh Tiwari', startTime: '5:00 PM', endTime: '6:00 PM', mode: 'Offline', location: 'Room A-2', status: 'Completed', tone: 'sky' },
  { id: 'CLS-102', studentId: 'TS-2401', batchId: 'BAT-104', day: 'tuesday', subject: 'Science', topic: 'Light and Reflection', tutorId: 'TUT-002', mentor: 'Anjali Mehta', startTime: '4:00 PM', endTime: '5:00 PM', mode: 'Offline', location: 'Lab 1', status: 'Upcoming', tone: 'emerald' },
  { id: 'CLS-103', studentId: 'TS-2401', batchId: 'BAT-104', day: 'tuesday', subject: 'Mathematics', topic: 'Practice Session', tutorId: 'TUT-001', mentor: 'Rajesh Tiwari', startTime: '5:15 PM', endTime: '6:15 PM', mode: 'Online', location: 'Live classroom', meetingUrl: '#', status: 'Upcoming', tone: 'violet' },
  { id: 'CLS-104', studentId: 'TS-2401', batchId: 'BAT-104', day: 'wednesday', subject: 'English', topic: 'Writing Skills', tutorId: 'TUT-005', mentor: 'Kavita Sharma', startTime: '6:00 PM', endTime: '7:00 PM', mode: 'Online', location: 'Live classroom', meetingUrl: '#', status: 'Scheduled', tone: 'amber' },
  { id: 'CLS-105', studentId: 'TS-2401', batchId: 'BAT-104', day: 'thursday', subject: 'Science', topic: 'Numerical Practice', tutorId: 'TUT-002', mentor: 'Anjali Mehta', startTime: '4:00 PM', endTime: '5:00 PM', mode: 'Offline', location: 'Lab 1', status: 'Scheduled', tone: 'emerald' },
  { id: 'CLS-106', studentId: 'TS-2401', batchId: 'BAT-104', day: 'friday', subject: 'Mathematics', topic: 'Weekly Revision', tutorId: 'TUT-001', mentor: 'Rajesh Tiwari', startTime: '5:00 PM', endTime: '6:00 PM', mode: 'Offline', location: 'Room A-2', status: 'Scheduled', tone: 'sky' },
  { id: 'CLS-107', studentId: 'TS-2401', batchId: 'BAT-104', day: 'saturday', subject: 'Board Test', topic: 'Mathematics & Science', tutorId: 'TUT-001', mentor: 'Academic Team', startTime: '11:00 AM', endTime: '12:30 PM', mode: 'Offline', location: 'Test Hall', status: 'Scheduled', tone: 'rose' },
];

export const scheduleAlerts = [
  { id: 'ALT-01', title: 'Science room updated', detail: 'Today’s Science class will take place in Lab 1.', time: '2 hours ago', tone: 'bg-emerald-100 text-emerald-700' },
  { id: 'ALT-02', title: 'Weekly board test', detail: 'Report 10 minutes early on Saturday and carry your stationery.', time: 'Yesterday', tone: 'bg-amber-100 text-amber-700' },
];
