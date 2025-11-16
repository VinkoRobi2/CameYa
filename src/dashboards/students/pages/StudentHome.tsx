// src/dashboards/students/pages/StudentHome.tsx
import { useState } from "react";
import type { Job } from "../../common/types";
import { FiltersBar } from "../components/FiltersBar";
import { JobSwipeDeck } from "../components/JobSwipeDeck";

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Staff para evento en ESPOL",
    employerName: "Eventos U",
    employerAvatarUrl: "",
    paymentLabel: "$25 · por día",
    dateLabel: "Sábado · 09:00–15:00",
    locationLabel: "Campus Prosperina, ESPOL",
    tags: ["Hoy", "Eventos", "Principiante OK"],
    mode: "PRESENCIAL",
  },
  {
    id: "2",
    title: "Tutor de Matemáticas Básicas",
    employerName: "Familia Ramírez",
    employerAvatarUrl: "",
    paymentLabel: "$8 · por hora",
    dateLabel: "Viernes por la tarde",
    locationLabel: "Remoto",
    tags: ["Tutorías", "Remoto"],
    mode: "REMOTO",
  },
];

export default function StudentHome() {
  const [dateFilter, setDateFilter] = useState<string>("Todos");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<string | null>(null);

  // Por ahora, no filtramos realmente MOCK_JOBS.
  // Cuando conectes al backend, aplicas filtros aquí.
  const filteredJobs = MOCK_JOBS;

  const handleApply = (job: Job) => {
    // Aquí luego llamarás al endpoint de crear postulación
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
    <div className="space-y-6">
      {/* Tarjetas de resumen arriba, estilo CameYa */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background-dark/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-light/60 dark:text-foreground-dark/60">
            Tu progreso
          </p>
          <p className="mt-1 text-2xl font-semibold">3</p>
          <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">
            trabajos completados
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background-dark/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-light/60 dark:text-foreground-dark/60">
            Ingresos estimados
          </p>
          <p className="mt-1 text-2xl font-semibold">$75</p>
          <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">
            generados con CameYa
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background-dark/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-light/60 dark:text-foreground-dark/60">
            Reputación
          </p>
          <p className="mt-1 text-2xl font-semibold">4.8 ⭐</p>
          <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">
            basada en 12 valoraciones
          </p>
        </div>
      </section>

      {/* Zona principal de explorar trabajos (deck tipo Tinder) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-base md:text-lg font-semibold tracking-tight">
            Explorar trabajos rápidos
          </h2>
          <p className="text-xs text-foreground-light/70 dark:text-foreground-dark/70">
            Filtra por fecha, categoría o modalidad y postula en segundos.
          </p>
        </div>

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
      </section>
    </div>
  );
}
