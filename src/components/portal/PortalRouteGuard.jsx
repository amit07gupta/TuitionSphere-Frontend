import { Navigate, Outlet, useLocation } from 'react-router-dom';

function PortalRouteGuard() {
  const location = useLocation();
  const studentId = sessionStorage.getItem('tuitionsphere_portal_student_id');
  const hasPortalSession = sessionStorage.getItem('tuitionsphere_portal_session') === 'active'
    && sessionStorage.getItem('tuitionsphere_auth_role') === 'student'
    && Boolean(sessionStorage.getItem('tuitionsphere_portal_token'))
    && Boolean(studentId);

  if (!hasPortalSession) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default PortalRouteGuard;
