// src/auth/employerDashboard/EmployerStatsSection.tsx
import React from "react";

const EmployerStatsSection: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">CameYos publicados</p>
        <p className="text-2xl font-semibold">0</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">Estudiantes contratados</p>
        <p className="text-2xl font-semibold">0</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-1">Valoración promedio</p>
        <p className="text-2xl font-semibold">4.9 ⭐</p>
      </div>
    </section>
  );
};

export default EmployerStatsSection;
