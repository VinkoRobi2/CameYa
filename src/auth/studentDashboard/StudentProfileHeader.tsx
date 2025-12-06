import React from "react";

interface StudentProfileHeaderProps {
  initials: string;
  displayName: string;
  subtitle: string;
  photoUrl?: string | null;
  onEditClick?: () => void;
  onPreviewClick?: () => void; // 👈 nuevo
}

const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  initials,
  displayName,
  subtitle,
  photoUrl,
  onEditClick,
  onPreviewClick,
}) => {
  return (
    <section className="mb-10">
      {/* Banda superior con degradado */}
      <div className="relative">
        <div className="h-40 w-full rounded-3xl bg-gradient-to-r from-[#0A5FE3] to-[#00A14D]" />

        {/* Texto centrado en el header */}
        <div className="absolute inset-x-0 top-6 flex flex-col items-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-90">
            Your Profile
          </p>
          <p className="text-[11px] opacity-90 mt-1">Student Account</p>
        </div>

        {/* Avatar flotando */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-2xl">
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
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="mt-16 bg-white rounded-3xl shadow-sm border border-slate-200 px-6 py-6 md:px-10 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            {displayName}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className="text-xs text-slate-400 mt-1">
            Esta es la información que verán los empleadores cuando revisen tu
            perfil.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 justify-center md:justify-end">
          <button
            type="button"
            onClick={onEditClick}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0A5FE3] to-[#00A14D] text-white text-sm font-medium shadow-sm hover:opacity-90 transition"
          >
            Editar perfil
          </button>
          <button
            type="button"
            onClick={onPreviewClick}
            className="px-5 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Vista previa
          </button>
        </div>
      </div>
    </section>
  );
};

export default StudentProfileHeader;
