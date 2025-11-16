// src/App.tsx
import { Routes, Route } from "react-router-dom";
import EmailCheck from "./pages/auth/EmailCheck";
import VerifyEmail from "./pages/auth/VerifyEmail";
import WorkerRegister from "./Register&Login/register/WorkerRegister";
import Login from "./Register&Login/login/Login";
import Protected from "./routes/Protected";
import OnboardingGate from "./routes/OnboardingGate";
import TermsAndPriv from "./global/Terms&Priv";
import Contact from "./global/Contact";
import EmployerRegister from "./Register&Login/register/EmployerRegister";
import Confirmacion_Email from "./Register&Login/register/Confirmacion_Email";
import EmployerPost from "./Register&Login/register/EmployerPost/EmployerPost";

// Exportas WorkerPost como named export desde index.ts de su carpeta
import { WorkerPost } from "./Register&Login/register/WorkerPost";

// Dashboard de estudiantes
import StudentDashboard from "./dashboards/students";

// Tu landing real dentro de /landingPage
import LandingPage from "./landingPage/LandingPage";

// Selector para elegir tipo de registro
import ChooseRegister from "./Register&Login/register/ChooseRegister";

export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<LandingPage />} />

      {/* Registro */}
      <Route path="/register" element={<ChooseRegister />} />
      <Route path="/register/worker" element={<WorkerRegister />} />
      <Route path="/register/employer" element={<EmployerRegister />} />
      <Route
        path="/register/email-confirmation"
        element={<Confirmacion_Email />}
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/check-email" element={<EmailCheck />} />
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Onboarding estudiante (sin OnboardingGate, solo protegido por token) */}
      <Route
        path="/onboarding"
        element={
          <Protected>
            <WorkerPost />
          </Protected>
        }
      />

      {/* Alias usado tras el registro/login: /register/worker/post */}
      <Route
        path="/register/worker/post"
        element={
          <Protected>
            <WorkerPost />
          </Protected>
        }
      />

      {/* Alias usado tras el registro/login: /register/employer/post */}
      <Route
        path="/register/employer/post"
        element={
          <Protected>
            <EmployerPost />
          </Protected>
        }
      />

      {/* Dashboard estudiante (ruta principal) */}
      <Route
        path="/student/dashboard"
        element={
          <Protected>
            <OnboardingGate>
              <StudentDashboard />
            </OnboardingGate>
          </Protected>
        }
      />

      {/* Alias para no romper nada viejo */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <OnboardingGate>
              <StudentDashboard />
            </OnboardingGate>
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
}
