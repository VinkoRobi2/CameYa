import { Routes, Route } from "react-router-dom";
import EmailCheck from "./pages/auth/EmailCheck";
import VerifyEmail from "./pages/auth/VerifyEmail";
import WorkerRegister from "./Register&Login/register/WorkerRegister";
import Login from "./Register&Login/login/Login";
import Protected from "./routes/Protected";
import OnboardingGate from "./routes/OnboardingGate";
import TermsAndPriv from "./global/Terms&Priv";
import Contact from "./global/Contact";

// Exportas WorkerPost como named export desde index.ts de su carpeta
import { WorkerPost } from "./Register&Login/register/WorkerPost";

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
      {/* <Route path="/register/employer" element={<EmployerRegister />} /> */}

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/check-email" element={<EmailCheck />} />
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Onboarding protegido (ruta canónica) */}
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

      {/* Alias usado tras el login: /register/worker/post */}
      <Route
        path="/register/worker/post"
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

      {/* Legales / contacto */}
      <Route path="/terms" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />

      {/* 404 -> por ahora vuelve a la landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
