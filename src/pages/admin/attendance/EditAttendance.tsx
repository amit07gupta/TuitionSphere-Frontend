import AttendanceForm from './AttendanceForm';

export default function EditAttendance(props) {
  return <AttendanceForm {...props} title="Edit class attendance" submitLabel="Update Attendance" />;
}
