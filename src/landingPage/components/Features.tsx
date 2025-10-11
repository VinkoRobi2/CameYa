import Reveal from "../../ui/Reveal";

export default function Features() {
  const features = [
    { icon: "bolt", title: "RÁPIDO", desc: "Concreta trabajos en horas o días, sin esperas ni procesos complejos.", tone: "primary" },
    { icon: "verified_user", title: "SEGURO", desc: "Perfiles y reputaciones verificadas para confianza y transparencia.", tone: "accent" },
    { icon: "sync_alt", title: "FLEXIBLE", desc: "Se adapta a trabajos, habilidades y disponibilidad.", tone: "primary" },
    { icon: "diversity_3", title: "JOVEN", desc: "Comunidad dinámica de estudiantes y recién graduados.", tone: "accent" },
  ];

  return (
    <section className="py-24 bg-background-light dark:bg-background-dark" id="about">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <Reveal><h2 className="font-display text-4xl font-semibold tracking-tight">Los pilares de CameYa</h2></Reveal>
        <Reveal><p className="mt-4 text-lg text-foreground-light/70 dark:text-foreground-dark/70 max-w-3xl mx-auto">Cuatro principios que guían la experiencia y el valor que entregamos.</p></Reveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <Reveal key={i}>
              <div className={`flex flex-col items-center text-center rounded-xl p-8 ${f.tone === "accent" ? "bg-accent/5 dark:bg-accent/10" : "bg-primary/5 dark:bg-primary/10"}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${f.tone === "accent" ? "bg-accent" : "bg-primary"} text-white mb-5`}>
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
