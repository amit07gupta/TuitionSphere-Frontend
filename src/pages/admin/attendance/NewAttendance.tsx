import AttendanceForm from './AttendanceForm';

export default function NewAttendance(props) {
  return <AttendanceForm {...props} title="Mark class attendance" submitLabel="Save Attendance" />;
}
