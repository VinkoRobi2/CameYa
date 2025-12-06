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
          `${API_BASE_URL}/verify/${encodeURIComponent(token)}`,
          {
            method: "POST",
          }
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
            "Correo verificado correctamente. Ahora puedes iniciar sesión."
        );

        // Tras unos segundos, llevar al login
        setTimeout(() => {
          navigate("/login", { replace: true });
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {title}
              </h1>

              {status === "loading" && (
                <p className="text-sm text-slate-600">
                  Esto puede tardar unos segundos...
                </p>
              )}

              {status !== "loading" && (
                <p className="text-sm text-slate-600">{message}</p>
              )}

              {(status === "error" || status === "no-token") && (
                <button
                  onClick={() => navigate("/register")}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0A5FE3] text-white text-sm font-semibold px-5 py-2 hover:brightness-110 transition"
                >
                  Volver al registro
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
