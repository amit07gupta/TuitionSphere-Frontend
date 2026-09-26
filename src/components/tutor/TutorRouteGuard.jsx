import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthenticatedUser } from '../../services/authApi';

const clearTutorSession = () => {
  ['tuitionsphere_tutor_token', 'tuitionsphere_tutor_session', 'tuitionsphere_tutor_id', 'tuitionsphere_tutor_user_id', 'tuitionsphere_tutor_name', 'tuitionsphere_tutor_email', 'tuitionsphere_auth_role'].forEach((key) => sessionStorage.removeItem(key));
};

function TutorRouteGuard() {
  const location = useLocation();
  const token = sessionStorage.getItem('tuitionsphere_tutor_token');
  const [authState, setAuthState] = useState({ checking: Boolean(token), authorized: false });

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    getAuthenticatedUser(token).then((user) => {
      if (!active) return;
      const authorized = user.role === 'TUTOR' && Boolean(user.tutorId);
      if (authorized) {
        sessionStorage.setItem('tuitionsphere_tutor_session', 'active');
        sessionStorage.setItem('tuitionsphere_tutor_id', user.tutorId);
        sessionStorage.setItem('tuitionsphere_tutor_user_id', user.id);
        sessionStorage.setItem('tuitionsphere_tutor_name', user.name);
        sessionStorage.setItem('tuitionsphere_tutor_email', user.email);
        sessionStorage.setItem('tuitionsphere_auth_role', 'tutor');
      } else clearTutorSession();
      setAuthState({ checking: false, authorized });
    }).catch(() => {
      if (!active) return;
      clearTutorSession();
      setAuthState({ checking: false, authorized: false });
    });
    return () => { active = false; };
  }, [token]);

  if (authState.checking) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-brand-navy">Verifying secure tutor session…</div>;
  }
  if (!authState.authorized) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default TutorRouteGuard;
