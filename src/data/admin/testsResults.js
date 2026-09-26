export const initialTests = [
  { id: 'TST-1001', title: 'Mathematics Chapter Test', batchId: 'BAT-104', subject: 'Mathematics', testDate: '2026-08-09', duration: 60, totalMarks: 50, passingMarks: 20, status: 'Published' },
  { id: 'TST-1002', title: 'Science Concept Assessment', batchId: 'BAT-104', subject: 'Science', testDate: '2026-08-15', duration: 75, totalMarks: 50, passingMarks: 20, status: 'Scheduled' },
  { id: 'TST-1003', title: 'English Writing Skills', batchId: 'BAT-103', subject: 'English', testDate: '2026-08-07', duration: 45, totalMarks: 30, passingMarks: 12, status: 'Draft' },
];

export const initialResults = [
  { id: 'RES-1001', testId: 'TST-1001', studentId: 'TS-2401', studentName: 'Aarav Sharma', obtainedMarks: 42, feedback: 'Strong concept application. Revise word-problem presentation.', status: 'Published' },
  { id: 'RES-1002', testId: 'TST-1003', studentId: 'TS-2402', studentName: 'Ananya Verma', obtainedMarks: 24, feedback: 'Good structure; continue grammar practice.', status: 'Draft' },
];
