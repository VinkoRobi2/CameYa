// src/global/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../global/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ("student" | "employer")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, login } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("auth_token");
  const storedUserStr = localStorage.getItem("auth_user");

  // Rehidratar el AuthContext desde localStorage si hace falta
  useEffect(() => {
    if (!user && storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        const tipoCuenta = parsed.tipo_cuenta || parsed.role;

        const normalizedUser = {
          id: String(parsed.user_id ?? parsed.id ?? ""),
          name:
            parsed.nombre || parsed.apellido
              ? `${parsed.nombre ?? ""} ${parsed.apellido ?? ""}`.trim()
              : parsed.name ?? "",
          email: parsed.email,
          role:
            tipoCuenta === "estudiante"
              ? ("student" as const)
              : tipoCuenta === "empleador"
              ? ("employer" as const)
              : null,
        };

        login(normalizedUser);
      } catch {
        // ignoramos errores de parseo
      }
    }
  }, [user, storedUserStr, login]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && storedUserStr) {
    try {
      const parsed = JSON.parse(storedUserStr);
      const tipoCuenta = parsed.tipo_cuenta || parsed.role;
      const role =
        tipoCuenta === "estudiante"
          ? "student"
          : tipoCuenta === "empleador"
          ? "employer"
          : null;

      if (role && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
