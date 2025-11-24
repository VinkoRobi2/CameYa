// src/auth/studentDashboard/StudentStatsSection.tsx
import React from "react";

interface StudentStatsSectionProps {
  isVerified: boolean;
}

const StudentStatsSection: React.FC<StudentStatsSectionProps> = ({
  isVerified,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">Valoración general</p>
        <p className="text-2xl font-semibold">4.8 ⭐</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">Trabajos completados</p>
        <p className="text-2xl font-semibold">0</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">Estado</p>
        <p className="text-sm font-medium text-emerald-600">
          {isVerified ? "Perfil verificado" : "Pendiente de verificación"}
        </p>
      </div>
    </section>
  );
};

export default StudentStatsSection;
