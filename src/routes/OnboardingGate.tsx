import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { ME_URL } from "../global_helpers/api";

type Props = { children: ReactNode };

export default function OnboardingGate({ children }: Props) {
  const [dest, setDest] = useState<"loading" | "onboarding" | "dashboard">("loading");

  useEffect(() => {
    async function go() {
      const token = localStorage.getItem("auth_token");
      if (!token) { setDest("onboarding"); return; }
      const res = await fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setDest("onboarding"); return; }
      const me = await res.json();
      setDest(me.completed_onboarding ? "dashboard" : "onboarding");
    }
    go();
  }, []);

  if (dest === "loading") return <div className="p-6 text-sm">Cargando…</div>;
  if (dest === "dashboard") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
