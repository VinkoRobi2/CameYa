// src/App.tsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import TermsAndPriv from "./global/pages/Terms&Priv";
import Contact from "./global/pages/Contact";
import LandingPage from "./landingPage/LandingPage";
import About from "./global/pages/About";

import RegisterChoice from "./auth/RegisterChoice";
import StudentRegister from "./auth/StudentRegister";
import StudentCheckEmail from "./auth/StudentCheckEmail";
import EmployerRegister from "./auth/EmployerRegister";
import VerifyEmail from "./auth/VerifyEmail";
import StudentCompleteRegister from "./auth/StudentCompleteRegister";
import Login from "./auth/Login";
import EmployerCompleteRegister from "./auth/EmployerCompleteRegister";

import StudentDashboardHome from "./auth/studentDashboard/StudentDashboardHome";
import StudentProfile from "./auth/studentDashboard/StudentProfile";
import StudentMatches from "./auth/studentDashboard/StudentMatches";
import StudentsBrowseEmployers from "./auth/studentDashboard/StudentsBrowseEmployers";

import EmployerStudentsHome from "./auth/employerDashboard/EmployerStudentsHome";
import EmployerCreateJob from "./auth/employerDashboard/EmployerCreateJob";
import EmployerMatches from "./auth/employerDashboard/EmployerMatches";
import EmployerHistory from "./auth/employerDashboard/EmployerHistory";
import EmployerProfile from "./auth/employerDashboard/EmployerProfile";

// NUEVO: pantallas de chat
import EmployerChat from "./auth/chat/EmployerChat";
import StudentChat from "./auth/chat/StudentChat";

import ProtectedRoute from "./auth/ProtectedRoute";

import PageTransition from "./ui/PageTransition";
import ScrollToTop from "./ui/ScrollToTop";

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />

        {/* Acerca */}
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />

        {/* Elección de tipo de registro */}
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterChoice />
            </PageTransition>
          }
        />

        {/* Registro estudiante */}
        <Route
          path="/register/student"
          element={
            <PageTransition>
              <StudentRegister />
            </PageTransition>
          }
        />
        <Route
          path="/register/student/check-email"
          element={
            <PageTransition>
              <StudentCheckEmail />
            </PageTransition>
          }
        />

        {/* Registro empleador */}
        <Route
          path="/register/employer"
          element={
            <PageTransition>
              <EmployerRegister />
            </PageTransition>
          }
        />
        <Route
          path="/register/employer/check-email"
          element={
            <PageTransition>
              <StudentCheckEmail />
            </PageTransition>
          }
        />

        {/* Completar perfil estudiante */}
        <Route
          path="/register/student/complete"
          element={
            <PageTransition>
              <StudentCompleteRegister />
            </PageTransition>
          }
        />

        {/* Completar perfil empleador */}
        <Route
          path="/register/employer/complete"
          element={
            <PageTransition>
              <EmployerCompleteRegister />
            </PageTransition>
          }
        />

        {/* Dashboards protegidos (estudiante) */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PageTransition>
                <StudentDashboardHome />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PageTransition>
                <StudentProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/matches"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PageTransition>
                <StudentMatches />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/browse-employers"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PageTransition>
                <StudentsBrowseEmployers />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Chat estudiante (protegidísimo) */}
        <Route
          path="/dashboard/student/chat/:receiverId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PageTransition>
                <StudentChat />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Dashboards protegidos (empleador) - HOME: swipeo de estudiantes */}
        <Route
          path="/dashboard/employer/person"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerStudentsHome />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employer/company"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerStudentsHome />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Perfil empleador (persona / empresa) */}
        <Route
          path="/dashboard/employer/person/profile"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employer/company/profile"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Mis matches (empleadores) */}
        <Route
          path="/dashboard/employer/person/matches"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerMatches />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employer/company/matches"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerMatches />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Crear trabajo (empleadores) */}
        <Route
          path="/dashboard/employer/jobs/new"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerCreateJob />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Historial de CameYos (empleadores) */}
        <Route
          path="/dashboard/employer/person/history"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerHistory />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employer/company/history"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerHistory />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Chat empleador (vale para persona / empresa) */}
        <Route
          path="/dashboard/employer/chat/:receiverId"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PageTransition>
                <EmployerChat />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Link del mail: /verify?token=... */}
        <Route
          path="/verify"
          element={
            <PageTransition>
              <VerifyEmail />
            </PageTransition>
          }
        />

        {/* Login común */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        {/* Páginas globales */}
        <Route
          path="/TermsAndPriv"
          element={
            <PageTransition>
              <TermsAndPriv />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <AnimatedRoutes />
    </>
  );
};

export default App;
