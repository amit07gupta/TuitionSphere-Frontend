import { lazy } from "react";
import { Route } from "react-router-dom";

const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Courses = lazy(() => import("../pages/public/Courses"));
const Fees = lazy(() => import("../pages/public/Fees"));
const BookDemo = lazy(() => import("../pages/public/BookDemo"));
const ThankYou = lazy(() => import("../pages/public/ThankYou"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Login = lazy(() => import("../pages/public/Login"));
const PrivacyPolicy = lazy(() => import("../pages/public/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../pages/public/TermsConditions"));

function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/fees" element={<Fees />} />
      <Route path="/book-demo" element={<BookDemo />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsConditions />} />
    </>
  );
}

export default PublicRoutes;
