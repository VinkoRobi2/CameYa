// src/routes/OnboardingGate.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = { children: ReactNode };
type GateState = "loading" | "login" | "onboarding" | "ok";

export default function OnboardingGate({ children }: Props) {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setState("login");
        return;
      }

      const rawUser = localStorage.getItem("auth_user");
      if (!rawUser) {
        // si no hay user_data, tratamos como perfil incompleto
        setState("onboarding");
        return;
      }

      const data = JSON.parse(rawUser);

      const tipoCuenta =
        data?.tipo_cuenta ??
        data?.role ??
        data?.user_data?.tipo_cuenta ??
        data?.user_data?.role ??
        "";

      const perfilCompleto = Boolean(
        data?.perfil_completo ??
          data?.completed_onboarding ??
          data?.user_data?.perfil_completo ??
          data?.user_data?.completed_onboarding ??
          false
      );

      if (tipoCuenta === "estudiante") {
        if (perfilCompleto) {
          setState("ok");
        } else {
          setState("onboarding");
        }
      } else {
        // otros roles: de momento los dejamos pasar
        setState("ok");
      }
    } catch (e) {
      console.error(e);
      setState("login");
    }
  }, []);

  if (state === "loading") return null;

  if (state === "login") {
    return <Navigate to="/login" replace />;
  }

  if (state === "onboarding") {
    return <Navigate to="/register/worker/post" replace />;
  }

  // state === "ok"
  return <>{children}</>;
}
