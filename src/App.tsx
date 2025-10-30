import { Routes, Route } from "react-router-dom";
import EmailCheck from "./pages/auth/EmailCheck";
import VerifyEmail from "./pages/auth/VerifyEmail";
import WorkerRegister from "./Register&Login/register/WorkerRegister";
import Login from "./Register&Login/login/Login";
import Protected from "./routes/Protected";
import OnboardingGate from "./routes/OnboardingGate";
import { WorkerPost } from "./Register&Login/register/WorkerPost";

export default function App() {
  return (
    <Routes>
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

      {/* Dashboard y landing (placeholder) */}
      <Route path="/dashboard" element={<div className="p-6">Dashboard</div>} />
      <Route path="*" element={<div className="p-6">Landing</div>} />
    </Routes>
  );
}
