import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { VERIFY_EMAIL_URL } from "../../global_helpers/api";

/**
 * Esta página puede recibir el token en query (?token=...) o en el hash (#token=...).
 * Independientemente de cómo venga, el POST al backend se hace como /verify/:token
 */
export default function VerifyEmail() {
  const [sp] = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function go() {
      // 1) Leer token del query o del hash
      const tokenFromQuery = sp.get("token") || "";
      const tokenFromHash =
        typeof window !== "undefined" && window.location.hash.startsWith("#token=")
          ? window.location.hash.slice("#token=".length)
          : "";
      const token = tokenFromQuery || tokenFromHash;

      if (!token) {
        setStatus("error");
        setMessage("Token no proporcionado.");
        return;
      }

      setStatus("loading");
      try {
        // 2) POST al backend con token en el PATH: /verify/:token
        const res = await fetch(`${VERIFY_EMAIL_URL}/${encodeURIComponent(token)}`, {
          method: "POST",
        });
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
  }, [sp]);

  return (
    <section className="min-h-[70vh] grid place-items-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Verificación de correo</h1>

        {status === "loading" && <p className="mt-3 text-sm text-foreground-light/70">Verificando…</p>}

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
