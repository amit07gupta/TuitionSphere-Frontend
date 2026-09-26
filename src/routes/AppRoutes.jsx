import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import PortalRoutes from "./PortalRoutes";
import PublicRoutes from "./PublicRoutes";
import TutorRoutes from "./TutorRoutes";

const NotFound = lazy(() => import("../pages/public/NotFound"));

function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}
      {AdminRoutes()}
      {PortalRoutes()}
      {TutorRoutes()}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
