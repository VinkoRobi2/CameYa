// src/auth/studentDashboard/StudentSkillsLinksSection.tsx
import React from "react";

interface Props {
  skills: string[];
  sectors: string[];
  links: string[];
}

const StudentSkillsLinksSection: React.FC<Props> = ({
  skills,
  sectors,
  links,
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold mb-3">Habilidades</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-slate-500">
              Aquí aparecerán tus habilidades básicas.
            </p>
          )}
        </div>

        {sectors.length > 0 && (
          <>
            <h3 className="text-xs font-semibold mb-2">Sectores preferidos</h3>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sec) => (
                <span
                  key={sec}
                  className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium"
                >
                  {sec}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold mb-3">Enlaces profesionales</h2>
        <div className="space-y-1 text-sm">
          {links.length === 0 && (
            <p className="text-slate-500 text-xs">
              Aquí aparecerán tus enlaces (LinkedIn, portafolio, GitHub, etc.).
            </p>
          )}
          {links.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noreferrer"
              className="block text-primary hover:underline break-all"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentSkillsLinksSection;
