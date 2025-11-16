// src/dashboards/students/pages/StudentHome.tsx
import { useState } from "react";
import type { Job } from "../../common/types";
import { FiltersBar } from "../components/FiltersBar";
import { JobSwipeDeck } from "../components/JobSwipeDeck";

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Ayudante en evento universitario",
    employerName: "Club de Emprendimiento ESPOL",
    paymentLabel: "$25 · por día",
    dateLabel: "Sábado · 09:00–15:00",
    locationLabel: "ESPOL, Guayaquil",
    tags: ["Fin de semana", "Principiante OK", "Presencial"],
    mode: "PRESENCIAL",
  },
  {
    id: "2",
    title: "Tutor de Matemáticas Básicas",
    employerName: "Familia Ramírez",
    paymentLabel: "$8 · por hora",
    dateLabel: "Viernes tarde",
    locationLabel: "Remoto",
    tags: ["Tutorías", "Remoto"],
    mode: "REMOTO",
  },
];

export const StudentHome = () => {
  const [dateFilter, setDateFilter] = useState<string>("Todos");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<string | null>(null);

  // Por ahora estos filtros no cambian la data mock;
  // cuando conectes API aplica los filtros sobre el array de trabajos.
  const filteredJobs = mockJobs;

  const handleApply = (job: Job) => {
    // Aquí luego llamarás a tu endpoint de crear postulación
    console.log("Postular a:", job.id);
  };

  const handleSkip = (job: Job) => {
    console.log("No me interesa:", job.id);
  };

  const handleViewDetails = (job: Job) => {
    // Podrías abrir un modal o navegar a /jobs/:id
    console.log("Ver detalles de:", job.id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <p className="mb-4 text-sm text-slate-300">
        Encuentra trabajos cortos, bien explicados y pensados para estudiantes.
        Postula solo a los que realmente puedas cumplir.
      </p>

      <FiltersBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        modeFilter={modeFilter}
        onModeFilterChange={setModeFilter}
      />

      <div className="flex justify-center mt-2">
        <JobSwipeDeck
          jobs={filteredJobs}
          onApply={handleApply}
          onSkip={handleSkip}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
};
