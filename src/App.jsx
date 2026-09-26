import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/common/WhatsAppButton";
import ScrollReveal from "./components/common/ScrollReveal";
import ScrollToTop from "./components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

function PageLoader() {
  return (
    <div
      className="flex min-h-[55vh] items-center justify-center bg-slate-50"
      role="status"
      aria-live="polite"
    >
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-navy/15 border-t-brand-gold" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = location.pathname.startsWith("/portal");
  const isTutorRoute = location.pathname.startsWith("/tutor");
  const isPrivateRoute = isAdminRoute || isPortalRoute || isTutorRoute;
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {!isPrivateRoute && <Header />}

      <main>
        <ScrollReveal />
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </main>
      {!isPrivateRoute && <WhatsAppButton />}
      {!isPrivateRoute && <Footer />}
    </div>
  );
}

export default App;
