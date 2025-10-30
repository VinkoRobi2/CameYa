import { Routes, Route } from "react-router-dom";
import EmailCheck from "./pages/auth/EmailCheck";
import VerifyEmail from "./pages/auth/VerifyEmail";
import WorkerRegister from "./Register&Login/register/WorkerRegister";
import Login from "./Register&Login/login/Login";
import Protected from "./routes/Protected";
import OnboardingGate from "./routes/OnboardingGate";

// ⬇️ IMPORTA WorkerPost como default (ajusta la ruta si lo tienes en otra carpeta)
import { WorkerPost } from "./Register&Login/register/WorkerPost"; 


import LandingPage from "./landingPage/LandingPage";


export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/register" element={<WorkerRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/check-email" element={<EmailCheck />} />
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Onboarding protegido */}
      <Route
        path="/onboarding"
        element={
          <Protected>
            <OnboardingGate>
              <WorkerPost />
            </OnboardingGate>
          </Protected>
        }
      />

      {/* Dashboard */}
      <Route path="/dashboard" element={<div className="p-6">Dashboard</div>} />

      {/* 404 */}
      <Route path="*" element={<div className="p-6">Página no encontrada</div>} />
    </Routes>
  );
}
