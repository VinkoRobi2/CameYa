// src/dashboards/students/pages/StudentProfile.tsx
import type { UserRatingSummary } from "../../common/types";
import { RatingStars } from "../../common/components/RatingStars";

interface StudentProfileProps {
  rating: UserRatingSummary;
}

export const StudentProfile = ({ rating }: StudentProfileProps) => {
  // Aquí luego conectarás con tu backend para traer y actualizar el perfil real
  const mockData = {
    name: "Nombre del Estudiante",
    university: "ESPOL",
    career: "Economía",
    semester: "3er semestre",
    availability: "Fines de semana y tardes",
    bio: "Estudiante responsable, puntual y con ganas de aprender. Me interesan trabajos de eventos, logística y tutorías.",
    skills: ["Atención al cliente", "Excel básico", "Eventos", "Tutorías"],
    links: [
      {
        label: "LinkedIn",
        url: "https://linkedin.com",
      },
    ],
    jobsCompleted: 3,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 flex gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center text-lg font-semibold text-sky-300">
          {mockData.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{mockData.name}</h2>
          <p className="text-sm text-slate-300">
            {mockData.career} · {mockData.university}
          </p>
          <p className="text-xs text-slate-400">{mockData.semester}</p>
          <div className="mt-2">
            <RatingStars rating={rating} size="md" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Disponibilidad</h3>
          <span className="text-xs text-slate-400">
            Esta info la verán los empleadores
          </span>
        </div>
        <p className="text-sm text-slate-300">{mockData.availability}</p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <h3 className="text-sm font-semibold">Sobre mí</h3>
        <p className="text-sm text-slate-300">{mockData.bio}</p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <h3 className="text-sm font-semibold">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {mockData.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs rounded-full bg-slate-800 px-3 py-1 text-slate-200 border border-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <h3 className="text-sm font-semibold">Links</h3>
        {mockData.links.length ? (
          <ul className="text-sm text-sky-300 space-y-1">
            {mockData.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">
            Aún no has agregado links. Puedes incluir tu LinkedIn o portafolio.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Trabajos completados
          </p>
          <p className="text-xs text-slate-400">
            Esto ayuda a los empleadores a confiar en ti.
          </p>
        </div>
        <p className="text-2xl font-bold text-emerald-300">
          {mockData.jobsCompleted}
        </p>
      </section>
    </div>
  );
};
