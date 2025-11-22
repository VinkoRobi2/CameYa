import React from "react";
import { Routes, Route } from "react-router-dom";
import ChooseRegister from "./Register&Login/register/ChooseRegister";
import EmailCheck from "./pages/auth/EmailCheck";
import VerifyEmail from "./pages/auth/VerifyEmail";

import WorkerRegister from "./Register&Login/register/WorkerRegister";
import EmployerRegister from "./Register&Login/register/EmployerRegister";
import Login from "./Register&Login/login/Login";
import Confirmacion_Email from "./Register&Login/register/Confirmacion_Email";

import EmployerPost from "./Register&Login/register/EmployerPost/EmployerPost";
// Exportas WorkerPost como named export desde index.ts de su carpeta
import { WorkerPost } from "./Register&Login/register/WorkerPost";

import Protected from "./routes/Protected";
import OnboardingGate from "./routes/OnboardingGate";

import TermsAndPriv from "./global/Terms&Priv";
import Contact from "./global/Contact";

// Ajusta esta ruta según dónde tengas tu landing original
import LandingPage from "./landingPage/LandingPage";

// Placeholders simples mientras no construyes dashboards reales
const StudentDashboard: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-sm text-gray-600">
      Dashboard de estudiante (pendiente de implementar).
    </p>
  </div>
);

const EmployerDashboard: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-sm text-gray-600">
      Dashboard de empleador (pendiente de implementar).
    </p>
  </div>
);

const App: React.FC = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ChooseRegister />} />
      <Route path="/register/worker" element={<WorkerRegister />} />
      <Route path="/register/employer" element={<EmployerRegister />} />
      <Route path="/email-check" element={<EmailCheck />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/confirm-email" element={<Confirmacion_Email />} />

      {/* Onboarding estudiante */}
      <Route
        path="/register/worker/onboarding"
        element={
          <Protected>
            <OnboardingGate>
              <WorkerPost />
            </OnboardingGate>
          </Protected>
        }
      />

      {/* Onboarding empleador */}
      <Route
        path="/register/employer/onboarding"
        element={
          <Protected>
            <OnboardingGate>
              <EmployerPost />
            </OnboardingGate>
          </Protected>
        }
      />

      {/* Dashboards */}
      <Route
        path="/student/dashboard/*"
        element={
          <Protected>
            <StudentDashboard />
          </Protected>
        }
      />

      <Route
        path="/employer/dashboard/*"
        element={
          <Protected>
            <EmployerDashboard />
          </Protected>
        }
      />

      {/* Legales / contacto */}
      <Route path="/terms" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />

      {/* 404 -> por ahora vuelve a la landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default App;
