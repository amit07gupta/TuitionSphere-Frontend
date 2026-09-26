export const portalSummary = [
  { label: 'Upcoming Classes', value: '04', detail: 'Next 7 days', icon: 'schedule', style: 'border-sky-200 bg-sky-50 text-sky-900' },
  { label: 'Pending Assignments', value: '03', detail: '1 due tomorrow', icon: 'assignments', style: 'border-amber-200 bg-amber-50 text-amber-900' },
  { label: 'Attendance', value: '92%', detail: 'This academic month', icon: 'attendance', style: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  { label: 'Latest Test Score', value: '86%', detail: 'Mathematics weekly test', icon: 'performance', style: 'border-violet-200 bg-violet-50 text-violet-900' },
  { label: 'Fee Status', value: 'Paid', detail: 'Next due 05 Sep', icon: 'fees', style: 'border-rose-200 bg-rose-50 text-rose-900' },
];

export const upcomingClasses = [
  { subject: 'Mathematics', topic: 'Quadratic Equations', mentor: 'Rajesh Tiwari', date: 'Today', time: '5:00 PM–6:00 PM', mode: 'Offline', room: 'Room A-2' },
  { subject: 'Science', topic: 'Light and Reflection', mentor: 'Anjali Mehta', date: 'Tomorrow', time: '4:00 PM–5:00 PM', mode: 'Offline', room: 'Lab 1' },
  { subject: 'English', topic: 'Writing Skills', mentor: 'Kavita Sharma', date: '13 Aug', time: '6:00 PM–7:00 PM', mode: 'Online', room: 'Live classroom' },
];

export const pendingAssignments = [
  { subject: 'Mathematics', title: 'Quadratic Equations Worksheet', due: '12 Aug', progress: 70 },
  { subject: 'Science', title: 'Reflection Activity', due: '14 Aug', progress: 35 },
  { subject: 'English', title: 'Formal Letter Practice', due: '16 Aug', progress: 0 },
];

export const recentPerformance = [
  { subject: 'Mathematics', score: 86, change: '+6%' },
  { subject: 'Science', score: 81, change: '+3%' },
  { subject: 'English', score: 78, change: '+4%' },
];

export const portalResources = [
  { title: 'Grade 10 Sample Syllabus', type: 'PDF Syllabus', path: '/resources/sample-syllabus.pdf' },
  { title: 'Weekly Test Practice Paper', type: 'Test Paper', path: '/resources/sample-test-paper.pdf' },
  { title: 'Current Batch Timetable', type: 'Timetable', path: '/resources/sample-timetable.pdf' },
];

export const portalNotices = [
  { title: 'Science revision class', detail: 'Additional revision class on Saturday at 11:00 AM.', date: '11 Aug' },
  { title: 'Mathematics weekly test', detail: 'Test syllabus and instructions are available in Study Materials.', date: '10 Aug' },
];
