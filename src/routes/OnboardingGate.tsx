import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Props = { children: ReactNode };
type GateState = "checking" | "redirect" | "ok";

export default function OnboardingGate({ children }: Props) {
  const { isLoading, isAuthenticated, hasCompletedProfile, isStudent, isEmployer } =
    useAuth();
  const location = useLocation();
  const [state, setState] = useState<GateState>("checking");
  const [redirectTo, setRedirectTo] = useState<string>("/login");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setRedirectTo("/login");
      setState("redirect");
      return;
    }

    // Si ya tiene perfil completo -> mándalo a su dashboard
    if (hasCompletedProfile) {
      if (isStudent) {
        setRedirectTo("/student/dashboard");
      } else if (isEmployer) {
        setRedirectTo("/employer/dashboard");
      } else {
        setRedirectTo("/");
      }
      setState("redirect");
      return;
    }

    // Si NO tiene perfil completo, verificamos que esté en la ruta correcta
    const path = location.pathname;

    if (path.includes("/register/worker") && !isStudent) {
      // Empleador intentando ver onboarding de estudiante
      if (isEmployer) {
        setRedirectTo("/register/employer/onboarding");
      } else {
        setRedirectTo("/");
      }
      setState("redirect");
      return;
    }

    if (path.includes("/register/employer") && !isEmployer) {
      // Estudiante intentando ver onboarding de empleador
      if (isStudent) {
        setRedirectTo("/register/worker/onboarding");
      } else {
        setRedirectTo("/");
      }
      setState("redirect");
      return;
    }

    setState("ok");
  }, [
    isLoading,
    isAuthenticated,
    hasCompletedProfile,
    isStudent,
    isEmployer,
    location.pathname,
  ]);

  if (isLoading || state === "checking") return null;

  if (state === "redirect") {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
