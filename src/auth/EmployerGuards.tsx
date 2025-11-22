// src/auth/EmployerGuards.tsx
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type GuardProps = {
  children: ReactNode;
};

/**
 * Solo permite pasar a usuarios con tipo_cuenta === "empleador".
 * Si no hay user_data o no es empleador, redirige según el caso.
 */
export const EmployerGuard: React.FC<GuardProps> = ({ children }) => {
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

  // Si no hay info de usuario, lo mandamos al login
  if (!tipoCuenta) {
    return <Navigate to="/login" replace />;
  }

  // Si NO es empleador, lo mandamos a su dashboard de estudiante
  if (tipoCuenta !== "empleador") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Es empleador → dejamos pasar
  return <>{children}</>;
};

/**
 * Variante que además puede verificar perfil_completo del empleador.
 * Úsalo solo si quieres forzar que tenga el onboarding completo.
 */
export const EmployerOnboardingGuard: React.FC<GuardProps> = ({
  children,
}) => {
  const raw = localStorage.getItem("user_data");
  let tipoCuenta: string | null = null;
  let perfilCompleto = false;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      tipoCuenta = parsed?.tipo_cuenta ?? null;
      perfilCompleto = Boolean(parsed?.perfil_completo);
    } catch {
      tipoCuenta = null;
    }
  }

  if (!tipoCuenta) {
    return <Navigate to="/login" replace />;
  }

  if (tipoCuenta !== "empleador") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Si quieres obligar a completar perfil antes de usar el dashboard:
  if (!perfilCompleto) {
    return <Navigate to="/register/employer/post" replace />;
  }

  return <>{children}</>;
};
