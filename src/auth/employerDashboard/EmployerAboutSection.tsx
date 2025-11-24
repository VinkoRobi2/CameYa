// src/auth/employerDashboard/EmployerAboutSection.tsx
import React from "react";

interface Props {
  bio: string;
  prefs: string[];
  website?: string;
}

const EmployerAboutSection: React.FC<Props> = ({ bio, prefs, website }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold mb-2">Sobre la empresa</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-2">Áreas de actividad</h2>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p) => (
              <span
                key={p}
                className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
              >
                {p}
              </span>
            ))}
            {prefs.length === 0 && (
              <p className="text-xs text-slate-500">
                Aquí aparecerán las áreas en las que sueles publicar CameYos.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">Sitio web / enlaces</h2>
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm hover:underline break-all"
            >
              {website}
            </a>
          ) : (
            <p className="text-xs text-slate-500">
              Aquí aparecerá el sitio web de tu empresa cuando lo configuremos.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmployerAboutSection;
