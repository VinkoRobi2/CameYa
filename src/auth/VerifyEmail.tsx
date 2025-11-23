// src/auth/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "no-token"
  >("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/verify?token=${encodeURIComponent(token)}`
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus("error");
          setMessage(
            (data && (data.message as string)) ||
              "No se pudo verificar tu correo."
          );
          return;
        }

        setStatus("success");
        setMessage(
          (data && (data.message as string)) ||
            "Correo verificado correctamente."
        );

        // Tras unos segundos, llevar al paso 3 (completar info)
        setTimeout(() => {
          navigate("/register/student/complete", { replace: true });
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Error de conexión al verificar el correo.");
      }
    };

    verify();
  }, [token, navigate]);

  const title =
    status === "loading"
      ? "Verificando tu correo..."
      : status === "success"
      ? "Correo verificado"
      : "No se pudo verificar tu correo";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40 text-center space-y-4">
              <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>

              {status === "loading" && (
                <p className="text-sm text-gray-300">
                  Esto puede tardar unos segundos...
                </p>
              )}

              {status !== "loading" && (
                <p className="text-sm text-gray-300">{message}</p>
              )}

              {status === "error" || status === "no-token" ? (
                <button
                  onClick={() => navigate("/register/student")}
                  className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-sm font-semibold hover:opacity-90"
                >
                  Volver al registro
                </button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
