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

import StudentDashboard from "./auth/StudentDashboard";
import EmployerPersonDashboard from "./auth/EmployerPersonDashboard";
import EmployerCompanyDashboard from "./auth/EmployerCompanyDashboard";

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

      {/* Registro empleador (persona / empresa) */}
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

      {/* Dashboards protegidos */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employer/person"
        element=
          {<ProtectedRoute allowedRoles={["employer"]}>
            <EmployerPersonDashboard />
          </ProtectedRoute>}
      />
      <Route
        path="/dashboard/employer/company"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerCompanyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Link del mail: /verify?token=... */}
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Login común para estudiantes y empleadores */}
      <Route path="/login" element={<Login />} />

      {/* Páginas globales */}
      <Route path="/terms-and-privacy" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default App;
