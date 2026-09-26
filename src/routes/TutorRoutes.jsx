import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import MySchedule from "../pages/tutor/MySchedule";
import TutorAttendance from "../pages/tutor/Attendance";
import TutorRouteGuard from "../components/tutor/TutorRouteGuard";



const TutorLayout = lazy(() => import("../components/tutor/TutorLayout"));
const TutorDashboard = lazy(() => import("../pages/tutor/Dashboard"));
const TutorNotices = lazy(() => import("../pages/tutor/Notices"));
const TutorAssignments = lazy(() => import("../pages/tutor/Assignments"));
const TutorStudents = lazy(() => import("../pages/tutor/MyStudents"));
const TutorProfile = lazy(() => import("../pages/tutor/profile/Profile"));

function TutorRoutes() {
  return (
    <Route element={<TutorRouteGuard />}>
      <Route path="/tutor" element={<TutorLayout />}>
        <Route index element={<Navigate to="/tutor/dashboard" replace />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="my-schedule" element={<MySchedule />} />
        <Route path="students" element={<TutorStudents />} />
        <Route path="attendance" element={<TutorAttendance />} />
        <Route path="notices" element={<TutorNotices />} />
        <Route path="assignments" element={<TutorAssignments />} />
        <Route path="profile" element={<TutorProfile />} />
        <Route path="*" element={<Navigate to="/tutor/dashboard" replace />} />
      </Route>
    </Route>
  );
}

export default TutorRoutes;
