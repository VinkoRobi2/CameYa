import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext";
import Reveal from "../ui/Reveal";

const RegisterChoice: React.FC = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleChoose = (role: "student" | "employer") => {
    setRole(role);
    if (role === "student") {
      navigate("/register/student");
    } else {
      navigate("/register/employer");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="relative flex-1 flex items-center justify-center px-4 py-10">
        {/* Botón volver al inicio */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors bg-white/80 shadow-sm"
        >
          ← Volver al inicio
        </button>

        <div className="w-full max-w-3xl space-y-8">
          <Reveal>
            <h1 className="text-3xl md:text-4xl font-semibold text-center text-slate-900">
              ¿Cómo quieres usar CameYa?
            </h1>
          </Reveal>

          <Reveal>
            <p className="text-center text-slate-600 max-w-xl mx-auto">
              Elige si quieres buscar trabajos flash o publicar oportunidades
              para estudiantes. Puedes cambiarlo más adelante.
            </p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <button
                onClick={() => handleChoose("student")}
                className="relative w-full text-left rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-[#0A5FE3]/50 hover:shadow-lg transition"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A5FE3]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-6 space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Buscar trabajo
                  </h2>
                  <p className="text-sm text-slate-600">
                    Soy estudiante / joven y quiero encontrar trabajos flash de
                    fin de semana o por horas.
                  </p>
                </div>
              </button>
            </Reveal>

            <Reveal>
              <button
                onClick={() => handleChoose("employer")}
                className="relative w-full text-left rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-[#0A5FE3]/50 hover:shadow-lg transition"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A14D]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-6 space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Buscar trabajadores
                  </h2>
                  <p className="text-sm text-slate-600">
                    Quiero publicar trabajos y contratar estudiantes para tareas
                    puntuales.
                  </p>
                </div>
              </button>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterChoice;
