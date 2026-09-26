import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import AdminRouteGuard from "../components/admin/AdminRouteGuard";

const AdminProfile = lazy(() => import("../pages/admin/profile/Profile"));
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("../components/admin/AdminLayout"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const DemoRequests = lazy(() => import("../pages/admin/demo-request/List"));
const DemoSetup = lazy(() => import("../pages/admin/demo-setup/List"));
const Inquiries = lazy(() => import("../pages/admin/inquiry/List"));
const Admissions = lazy(() => import("../pages/admin/admission/List"));
const Students = lazy(() => import("../pages/admin/student/List"));
const StudentDetails = lazy(() => import("../pages/admin/student/StudentDetails"));
const EditStudent = lazy(() => import("../pages/admin/student/EditStudent"));
const AcademicSessions = lazy(() => import("../pages/admin/academic-session/List"));
const BoardList = lazy(() => import("../pages/admin/board/List"));
const GradeList = lazy(() => import("../pages/admin/grade/List"));
const SubjectList = lazy(() => import("../pages/admin/subject/List"));
const CoursesBatches = lazy(() => import("../pages/admin/batch/List"));
const ClassScheduleManagement = lazy(() => import("../pages/admin/class-schedule/List"));
const TutorList = lazy(() => import("../pages/admin/tutor/List"));
const AttendanceManagement = lazy(() => import("../pages/admin/attendance/List"));
const FeeConfiguration = lazy(() => import("../pages/admin/fee-configuration/List"));
const FeesPayments = lazy(() => import("../pages/admin/FeesPayments"));
const NoticesManagement = lazy(() => import("../pages/admin/notice/List"));
const AdminUsers = lazy(() => import("../pages/admin/admin-user/List"));
const AssignmentsMonitor = lazy(() => import("../pages/admin/assignment/List"));

function AdminRoutes() {
  return (
    <>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRouteGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Navigate to="/admin/demo-requests" replace />} />
          <Route path="demo-requests" element={<DemoRequests />} />
          <Route path="demo-setup" element={<DemoSetup />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="students" element={<Students />} />
          <Route path="students/new" element={<Navigate to="/admin/admissions?manual=1" replace />} />
          <Route path="students/:studentId/edit" element={<EditStudent />} />
          <Route path="students/:studentId" element={<StudentDetails />} />
          <Route path="academic-sessions" element={<AcademicSessions />} />
          <Route path="boards" element={<BoardList />} />
          <Route path="grades" element={<GradeList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="courses" element={<CoursesBatches />} />
          <Route path="schedule" element={<ClassScheduleManagement />} />
          <Route path="tutors" element={<TutorList />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="assignments" element={<AssignmentsMonitor />} />
          <Route path="fee-configuration" element={<FeeConfiguration />} />
          <Route path="fees" element={<FeesPayments />} />
          <Route path="notices" element={<NoticesManagement />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>
    </>
  );
}

export default AdminRoutes;
