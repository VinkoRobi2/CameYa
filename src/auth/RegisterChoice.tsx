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
    <div className="min-h-screen bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark flex flex-col">
      <main className="relative flex-1 flex items-center justify-center px-4 py-10">
        {/* Botón volver al inicio */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          ← Volver al inicio
        </button>

        <div className="w-full max-w-3xl space-y-8">
          <Reveal>
            <h1 className="text-3xl md:text-4xl font-semibold text-center">
              ¿Cómo quieres usar CameYa?
            </h1>
          </Reveal>

          <Reveal>
            <p className="text-center text-foreground-light/70 dark:text-foreground-dark/70 max-w-xl mx-auto text-sm md:text-base">
              Elige si quieres buscar trabajos flash o publicar oportunidades
              para estudiantes. Puedes cambiarlo más adelante.
            </p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <button
                onClick={() => handleChoose("student")}
                className="relative w-full text-left rounded-2xl overflow-hidden border border-primary/10 bg-white/95 dark:bg-background-dark/95 hover:border-primary/60 hover:shadow-lg transition shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-6 space-y-2">
                  <h2 className="text-xl font-semibold">
                    Buscar trabajo
                  </h2>
                  <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
                    Soy estudiante / joven y quiero encontrar trabajos flash de
                    fin de semana o por horas.
                  </p>
                </div>
              </button>
            </Reveal>

            <Reveal>
              <button
                onClick={() => handleChoose("employer")}
                className="relative w-full text-left rounded-2xl overflow-hidden border border-primary/10 bg-white/95 dark:bg-background-dark/95 hover:border-primary/60 hover:shadow-lg transition shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-6 space-y-2">
                  <h2 className="text-xl font-semibold">
                    Buscar trabajadores
                  </h2>
                  <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
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
