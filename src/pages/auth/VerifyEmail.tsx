import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { VERIFY_EMAIL_URL } from "../../global_helpers/api";

export default function VerifyEmail() {
  const [sp] = useSearchParams();
  const token = sp.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function go() {
      if (!token) {
        setStatus("error");
        setMessage("Token no proporcionado.");
        return;
      }
      setStatus("loading");
      try {
        const res = await fetch(`${VERIFY_EMAIL_URL}?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("ok");
          setMessage(data?.message || "Correo electrónico verificado correctamente.");
        } else {
          setStatus("error");
          setMessage(data?.message || "Token inválido o expirado.");
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "No se pudo verificar el correo.");
      }
    }
    go();
  }, [token]);

  return (
    <section className="min-h-[70vh] grid place-items-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Verificación de correo</h1>

        {status === "loading" && (
          <p className="mt-3 text-sm text-foreground-light/70">Verificando…</p>
        )}

        {status !== "loading" && (
          <p className={`mt-3 text-sm ${status === "ok" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <div className="mt-6">
          <Link to="/login" className="inline-block px-5 py-2 rounded-full bg-primary text-white">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
