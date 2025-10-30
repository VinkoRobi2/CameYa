import { Navigate } from "react-router-dom";
import { ME_URL } from "../global_helpers/api";
import { useEffect, useState, type ReactNode } from "react";

type Props = { children: ReactNode };

export default function Protected({ children }: Props) {
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("auth_token");
      if (!token) return setOk(false);
      const res = await fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return setOk(true);
      const me = await res.json();
      if (!me.email_verificado) return setOk(false);
      setOk(true);
    }
    check();
  }, []);

  if (ok === null) return <div className="p-6 text-sm">Cargando…</div>;
  if (ok === false) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
