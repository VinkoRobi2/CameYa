// src/auth/studentDashboard/StudentProfileHeader.tsx
import React from "react";

interface StudentProfileHeaderProps {
  initials: string;
  displayName: string;
  subtitle: string;
  photoUrl?: string | null;
}

const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  initials,
  displayName,
  subtitle,
  photoUrl,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-xl">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials || "ST"}</span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{displayName}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className="text-xs text-slate-400 mt-1">
            Esta es la info que verán los empleadores cuando revisen tu perfil.
          </p>
        </div>
      </div>

      <button className="self-start md:self-auto px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90">
        Editar perfil
      </button>
    </section>
  );
};

export default StudentProfileHeader;
