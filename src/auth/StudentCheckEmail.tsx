// src/auth/StudentCheckEmail.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import  API_BASE_URL from "../global/ApiBase";  
interface LocationState {
  email?: string;
}


const StudentCheckEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;
  const email = state.email || "tu correo";

  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resendMessage, setResendMessage] = useState<string>("");

  const hasRealEmail = email !== "tu correo";

  const handleResend = async () => {
    if (!hasRealEmail) {
      setResendStatus("error");
      setResendMessage(
        "No pudimos identificar tu correo. Vuelve a registrarte para reenviar el mail."
      );
      return;
    }

    setResendStatus("loading");
    setResendMessage("");

    try {
      // AJUSTA la ruta si tu backend usa otro endpoint
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendStatus("error");
        setResendMessage(
          (data && (data.message as string)) ||
            "No se pudo reenviar el correo. Intenta de nuevo."
        );
        return;
      }

      setResendStatus("success");
      setResendMessage(
        (data && (data.message as string)) ||
          "Hemos reenviado el correo de verificación."
      );
    } catch (err) {
      console.error(err);
      setResendStatus("error");
      setResendMessage("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40 text-center space-y-4">
              <h1 className="text-2xl md:text-3xl font-semibold">
                Verifica tu correo
              </h1>
              <p className="text-sm text-gray-300">
                Te hemos enviado un enlace de verificación a{" "}
                <span className="font-semibold">{email}</span>. Abre el correo y
                haz clic en el enlace para confirmar tu cuenta.
              </p>
              <p className="text-xs text-gray-400">
                Si no lo ves en unos minutos, revisa tu carpeta de spam o
                promociones.
              </p>

              {/* Botón para reenviar correo */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "loading" || !hasRealEmail}
                  className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-primary/60 text-sm font-semibold hover:bg-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resendStatus === "loading"
                    ? "Reenviando..."
                    : "Reenviar correo de verificación"}
                </button>

                {resendMessage && (
                  <p
                    className={`text-xs ${
                      resendStatus === "success"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {resendMessage}
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate("/")}
                className="mt-4 inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-sm font-semibold hover:opacity-90"
              >
                Volver al inicio
              </button>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default StudentCheckEmail;
