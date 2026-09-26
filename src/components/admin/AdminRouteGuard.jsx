import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthenticatedUser } from '../../services/authApi';
import { fetchBoards } from '../../services/boardApi';
import { fetchGrades } from '../../services/gradeApi';
import { fetchSubjects } from '../../services/subjectApi';
import { fetchFeePlans } from '../../services/feePlanApi';
import { fetchDemoSetups } from '../../services/demoSetupApi';

function AdminRouteGuard() {
  const location = useLocation();
  const token = sessionStorage.getItem('tuitionsphere_admin_token');
  const [authState, setAuthState] = useState(() => ({
    checking: Boolean(token),
    authorized: false,
  }));

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    getAuthenticatedUser(token)
      .then(async (user) => {
        if (!active) return;
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        if (isAdmin) {
          sessionStorage.setItem('tuitionsphere_admin_id', user.id);
          sessionStorage.setItem('tuitionsphere_admin_name', user.name);
          sessionStorage.setItem(
            'tuitionsphere_admin_role',
            user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
          );
          await Promise.allSettled([
            fetchBoards(),
            fetchGrades(),
            fetchSubjects(),
            fetchFeePlans(),
            fetchDemoSetups(),
          ]);
        }
        if (!active) return;
        setAuthState({ checking: false, authorized: isAdmin });
      })
      .catch(() => {
        if (!active) return;
        sessionStorage.removeItem('tuitionsphere_admin_token');
        sessionStorage.removeItem('tuitionsphere_admin_session');
        setAuthState({ checking: false, authorized: false });
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (authState.checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-brand-navy">
        Verifying secure admin session…
      </div>
    );
  }

  if (!authState.authorized) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default AdminRouteGuard;
