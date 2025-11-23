// src/auth/StudentCheckEmail.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";

interface LocationState {
  email?: string;
}

const StudentCheckEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;
  const email = state.email || "tu correo";

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
              <button
                onClick={() => navigate("/")}
                className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-sm font-semibold hover:opacity-90"
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
