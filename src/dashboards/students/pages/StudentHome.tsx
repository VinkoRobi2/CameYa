import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { Job } from "../../common/types";
import { FiltersBar } from "../components/FiltersBar";
import { JobSwipeDeck } from "../components/JobSwipeDeck";
import { API_BASE } from "../../../global_helpers/api";

const JOBS_FEED_URL = `${API_BASE}/feed-jobs`; // <-- cambia si tu endpoint es otro

export default function StudentHome() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<string>("Hoy");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token"); // cambia la key si usas otra

        const res = await axios.get(JOBS_FEED_URL, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
          // si necesitas params (paginación, etc) los agregas aquí:
          // params: { page: 1, limit: 20 },
        });

        const data = res.data;
        // Soporta tanto [Job] como { jobs: Job[] }
        const jobsFromApi: Job[] = Array.isArray(data)
          ? data
          : data?.jobs ?? [];

        setJobs(jobsFromApi);
      } catch (err) {
        console.error("Error cargando trabajos del backend:", err);
        setError("No pudimos cargar los trabajos. Intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      let matchesDate = true;
      if (dateFilter === "Hoy") {
        matchesDate = job.tags?.includes("Hoy") ?? true;
      } else if (dateFilter === "Este fin de semana") {
        matchesDate = job.tags?.includes("Fin de semana") ?? true;
      }

      const matchesCategory = categoryFilter
        ? job.tags?.includes(categoryFilter) ?? false
        : true;

      let matchesMode = true;
      if (modeFilter === "Presencial") {
        matchesMode = job.mode === "PRESENCIAL";
      } else if (modeFilter === "Remoto") {
        matchesMode = job.mode === "REMOTO";
      }

      return matchesDate && matchesCategory && matchesMode;
    });
  }, [jobs, dateFilter, categoryFilter, modeFilter]);

  const handleApply = (job: Job) => {
    // Aquí luego puedes hacer POST /students/jobs/:id/apply
    console.log("Postular a:", job.id);
  };

  const handleSkip = (job: Job) => {
    // Aquí puedes registrar un "skip" si quieres
    console.log("No me interesa:", job.id);
  };

  const handleViewDetails = (job: Job) => {
    // Navegar o abrir modal de detalle
    console.log("Ver detalles de:", job.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
          Encuentra trabajos rápidos cerca de ti 👇
        </h1>
        <p className="text-xs md:text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Desliza las tarjetas o usa los filtros para encontrar trabajos flash
          que encajen con tu horario.
        </p>
      </header>

      <FiltersBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        modeFilter={modeFilter}
        onModeFilterChange={setModeFilter}
      />

      <section className="flex justify-center pt-2 pb-8 min-h-[380px]">
        {isLoading ? (
          <div className="w-full max-w-xl animate-pulse space-y-4">
            <div className="h-64 rounded-[28px] bg-slate-100" />
            <div className="h-8 rounded-full bg-slate-100" />
            <div className="h-8 rounded-full bg-slate-100" />
          </div>
        ) : error ? (
          <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        ) : (
          <JobSwipeDeck
            jobs={filteredJobs}
            onApply={handleApply}
            onSkip={handleSkip}
            onViewDetails={handleViewDetails}
          />
        )}
      </section>
    </div>
  );
}
