// src/auth/studentDashboard/StudentAboutAvailabilitySection.tsx
import React from "react";

interface Props {
  bio: string;
  availability: string;
}

const StudentAboutAvailabilitySection: React.FC<Props> = ({
  bio,
  availability,
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold mb-2">Sobre mí</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold mb-2">Disponibilidad</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            {availability}
          </span>
        </div>
      </div>
    </section>
  );
};

export default StudentAboutAvailabilitySection;
