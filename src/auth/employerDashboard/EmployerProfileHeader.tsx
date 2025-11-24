// src/auth/employerDashboard/EmployerProfileHeader.tsx
import React from "react";

interface Props {
  initials: string;
  title: string;
  subtitle: string;
  location: string;
}

const EmployerProfileHeader: React.FC<Props> = ({
  initials,
  title,
  subtitle,
  location,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xl">
          {initials || "EM"}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className="text-xs text-slate-400 mt-1">Ubicación: {location}</p>
        </div>
      </div>

      <button className="self-start md:self-auto px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90">
        Editar perfil
      </button>
    </section>
  );
};

export default EmployerProfileHeader;
