// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import TermsAndPriv from "./global/pages/Terms&Priv";
import Contact from "./global/pages/Contact";
import LandingPage from "./landingPage/LandingPage";

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

import EmployerPersonHome from "./auth/employerDashboard/EmployerPersonHome";
import EmployerCompanyHome from "./auth/employerDashboard/EmployerCompanyHome";
import EmployerCreateJob from "./auth/employerDashboard/EmployerCreateJob";
import EmployerPosts from "./auth/employerDashboard/EmployerPosts";

import ProtectedRoute from "./auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Elección de tipo de registro */}
      <Route path="/register" element={<RegisterChoice />} />

      {/* Registro estudiante */}
      <Route path="/register/student" element={<StudentRegister />} />
      <Route
        path="/register/student/check-email"
        element={<StudentCheckEmail />}
      />

      {/* Registro empleador */}
      <Route path="/register/employer" element={<EmployerRegister />} />
      <Route
        path="/register/employer/check-email"
        element={<StudentCheckEmail />}
      />

      {/* Completar perfil estudiante */}
      <Route
        path="/register/student/complete"
        element={<StudentCompleteRegister />}
      />

      {/* Completar perfil empleador */}
      <Route
        path="/register/employer/complete"
        element={<EmployerCompleteRegister />}
      />

      {/* Dashboards protegidos (estudiante) */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/student/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Dashboards protegidos (empleador) */}
      <Route
        path="/dashboard/employer/person"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerPersonHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employer/company"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerCompanyHome />
          </ProtectedRoute>
        }
      />

      {/* Mis publicaciones (empleadores) */}
      <Route
        path="/dashboard/employer/person/posts"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerPosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employer/company/posts"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerPosts />
          </ProtectedRoute>
        }
      />

      {/* Crear trabajo (empleadores) */}
      <Route
        path="/dashboard/employer/jobs/new"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerCreateJob />
          </ProtectedRoute>
        }
      />

      {/* Link del mail: /verify?token=... */}
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Login común */}
      <Route path="/login" element={<Login />} />

      {/* Páginas globales */}
      <Route path="/terms-and-privacy" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default App;
