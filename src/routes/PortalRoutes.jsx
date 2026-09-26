import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import PortalRouteGuard from "../components/portal/PortalRouteGuard";

const PortalLayout = lazy(() => import("../components/portal/PortalLayout"));
const PortalDashboard = lazy(() => import("../pages/portal/PortalDashboard"));
const ClassSchedule = lazy(() => import("../pages/portal/ClassSchedule"));
const Attendance = lazy(() => import("../pages/portal/Attendance"));
const DoubtsNotices = lazy(() => import("../pages/portal/DoubtsNotices"));
const FeeRecords = lazy(() => import("../pages/portal/FeeRecords"));
const Profile = lazy(() => import("../pages/portal/Profile"));
const Assignments = lazy(() => import("../pages/portal/Assignments"));

function PortalRoutes() {
  return (
    <Route element={<PortalRouteGuard />}>
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<PortalDashboard />} />
        <Route path="schedule" element={<ClassSchedule />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="notices" element={<DoubtsNotices />} />
        <Route path="fees" element={<FeeRecords />} />
        <Route path="profile" element={<Profile />} />

        <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
      </Route>
    </Route>
  );
}

export default PortalRoutes;
