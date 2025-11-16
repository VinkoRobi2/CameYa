// src/routes/Protected.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = { children: ReactNode };

export default function Protected({ children }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAllowed(!!token);
  }, []);

  if (allowed === null) {
    // pequeño fallback, puedes poner un skeleton si quieres
    return null;
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
