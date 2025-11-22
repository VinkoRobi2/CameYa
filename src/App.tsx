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

// Dashboard de empleadores
import EmployerDashboard from "./dashboards/employers/pages/EmployerDashboard";

// Tu landing real dentro de /landingPage
import LandingPage from "./landingPage/LandingPage";

// Selector para elegir tipo de registro
import ChooseRegister from "./Register&Login/register/ChooseRegister";

// Componente que decide a qué dashboard ir según el tipo de cuenta
function RoleDashboardRouter() {
  // Ajusta esto a cómo estés guardando los datos del usuario
  const raw = localStorage.getItem("user_data");
  let tipoCuenta: string | null = null;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      tipoCuenta = parsed?.tipo_cuenta ?? null;
    } catch {
      tipoCuenta = null;
    }
  }

  if (tipoCuenta === "empleador") {
    return <EmployerDashboard />;
  }

  // Por defecto, estudiante
  return <StudentDashboard />;
}

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

      {/* Dashboard estudiante (ruta principal explícita) */}
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

      {/* Dashboard empleador */}
      <Route
        path="/employer/dashboard"
        element={
          <Protected>
            <OnboardingGate>
              <EmployerDashboard />
            </OnboardingGate>
          </Protected>
        }
      />

      {/* Alias genérico /dashboard -> decide según tipo_cuenta */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <OnboardingGate>
              <RoleDashboardRouter />
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
