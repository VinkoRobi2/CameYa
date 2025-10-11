import Reveal from "../../ui/Reveal";

export default function HowTo() {
  const steps = [
    { num: 1, icon: "person_add", title: "Crea tu cuenta",  desc: "Regístrate, completa tu perfil y define tu disponibilidad." },
    { num: 2, icon: "verified",    title: "Verifica tu perfil", desc: "Aumenta tu confianza y visibilidad dentro de CameYa." },
    { num: 3, icon: "search",      title: "Explora oportunidades", desc: "Filtra por tipo de trabajo, horario y ubicación." },
    { num: 4, icon: "send",        title: "Postula o publica", desc: "Aplica en un clic o publica tu gig con requisitos claros." },
    { num: 5, icon: "contract",    title: "Acordar y ejecutar", desc: "Define entregables y tiempos; comunica con claridad." },
    { num: 6, icon: "ratings",     title: "Califica y crece", desc: "Gana reputación y accede a mejores oportunidades." },
  ];

  return (
    <section className="py-24 bg-background-light dark:bg-background-dark" id="howto">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="font-display text-4xl font-semibold tracking-tight text-center">Cómo empezar en CameYa</h2></Reveal>
        <Reveal><p className="mt-4 text-lg text-foreground-light/70 dark:text-foreground-dark/70 max-w-3xl mx-auto text-center">Sigue estos pasos para comenzar a trabajar o contratar en cuestión de horas.</p></Reveal>

        <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <Reveal key={s.num}>
              <li className="relative rounded-xl border border-primary/10 dark:border-primary/20 bg-primary/5 dark:bg-primary/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary">Paso {s.num}</span>
                    <h3 className="font-display text-lg font-semibold leading-tight">{s.title}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground-light/70 dark:text-foreground-dark/70">{s.desc}</p>
                <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
