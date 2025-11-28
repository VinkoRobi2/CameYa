import React from "react";
import Header from "../../landingPage/components/Header";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-4">
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                Acerca de CameYa
              </h1>
              <p className="text-base md:text-lg text-foreground-light/70 dark:text-foreground-dark/70 max-w-3xl mx-auto">
                CameYa conecta estudiantes y jóvenes con trabajos flash de
                fin de semana o por horas, y ayuda a personas y empresas a
                resolver tareas puntuales de forma rápida, segura y flexible.
              </p>
            </div>

            {/* Qué es CameYa */}
            <section className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="font-display text-2xl font-semibold">
                  Qué es CameYa
                </h2>
                <p className="text-sm md:text-base text-foreground-light/70 dark:text-foreground-dark/70">
                  Es una plataforma pensada para la realidad de Ecuador, donde
                  los estudiantes pueden ganar ingresos extra sin descuidar sus
                  estudios, y los empleadores encuentran ayuda confiable para
                  tareas concretas: eventos, logística, soporte en oficina,
                  campañas, proyectos académicos y más.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5 space-y-2">
                <p className="text-sm font-semibold text-primary">
                  Nuestro enfoque
                </p>
                <p className="text-sm md:text-base text-foreground-light/80 dark:text-foreground-dark/80">
                  Empezamos en Guayaquil y el ecosistema universitario, con la
                  idea de construir una comunidad cerrada y confiable antes de
                  escalar a más ciudades y universidades.
                </p>
              </div>
            </section>

            {/* Para quién es */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-white/80 dark:bg-background-dark/80 p-5 space-y-3">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    school
                  </span>
                  Para estudiantes
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-foreground-light/75 dark:text-foreground-dark/75 list-disc list-inside">
                  <li>Trabajos por día o por horas, principalmente fines de semana.</li>
                  <li>Perfiles verificados con correo institucional.</li>
                  <li>Reputación basada en valoraciones de empleadores.</li>
                  <li>
                    Control sobre tu disponibilidad: tú eliges cuándo y en qué
                    tipo de CameYo participar.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white/80 dark:bg-background-dark/80 p-5 space-y-3">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    group
                  </span>
                  Para empleadores
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-foreground-light/75 dark:text-foreground-dark/75 list-disc list-inside">
                  <li>
                    Publica CameYo con fecha, horario, ubicación y pago estimado.
                  </li>
                  <li>
                    Revisa perfiles públicos de estudiantes, sus habilidades y
                    valoraciones previas.
                  </li>
                  <li>Comunicación directa una vez aceptada la postulación.</li>
                  <li>
                    Sistema de reputación para construir confianza a largo plazo.
                  </li>
                </ul>
              </div>
            </section>

            {/* Seguridad / confianza */}
            <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  verified_user
                </span>
                Seguridad y confianza
              </h2>
              <div className="grid gap-4 md:grid-cols-3 text-sm md:text-base text-foreground-light/80 dark:text-foreground-dark/80">
                <p>
                  • Verificación con correos institucionales y datos básicos
                  para estudiantes.
                </p>
                <p>
                  • Perfiles de empleadores con información de contacto clara y,
                  en el caso de empresas, opción de dominio corporativo.
                </p>
                <p>
                  • Valoraciones cruzadas entre estudiantes y empleadores para
                  reducir fricciones y casos atípicos.
                </p>
              </div>
            </section>

            {/* Call to action */}
            <section className="text-center space-y-4">
              <h2 className="font-display text-2xl font-semibold">
                Empezar es sencillo
              </h2>
              <p className="text-sm md:text-base text-foreground-light/70 dark:text-foreground-dark/70 max-w-xl mx-auto">
                Si eres estudiante, crea tu cuenta y postula a tu primer CameYo.
                Si eres empleador, publica tu primera oportunidad y prueba el
                modelo con un trabajo puntual.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/register/student"
                  className="h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center hover:brightness-110"
                >
                  Soy estudiante
                </a>
                <a
                  href="/register/employer"
                  className="h-11 px-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center hover:bg-primary/20"
                >
                  Soy empleador
                </a>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
