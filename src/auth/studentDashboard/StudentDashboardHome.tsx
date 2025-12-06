// src/auth/studentDashboard/StudentDashboardHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

interface TrabajoPublico {
  id: number;
  empleador_id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  requisitos: string;
  habilidades: string;
  salario: string;
  negociable: boolean;
  ciudad: string;
  modalidad?: string;
  presencial?: boolean;
  fecha_creacion: string;
  estado: string;
  foto_job?: string;
  foto_empleador?: string;
  foto_perfil?: string;
  imagen_trabajo_url?: string;
  foto_empleador_url?: string;
  nombre_empleador?: string;
  nombre_empresa?: string;
}

interface JobInteres {
  id: number;
}

const JOBS_ENDPOINT = `${API_BASE_URL}/protected/todos_trabajos`;
const INTERESES_ENDPOINT = `${API_BASE_URL}/protected/mis-intereses`;
const GUARDAR_INTERES_ENDPOINT = `${API_BASE_URL}/protected/guardar-interes`;

// Limpia URLs tipo "http://.../uploads/http://.../uploads/job_9.png"
const normalizeFotoUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const lastHttpIndex = trimmed.lastIndexOf("http");
  if (lastHttpIndex > 0) {
    return trimmed.slice(lastHttpIndex);
  }
  return trimmed;
};

const StudentDashboardHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [allTrabajos, setAllTrabajos] = useState<TrabajoPublico[]>([]);
  const [trabajos, setTrabajos] = useState<TrabajoPublico[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<TrabajoPublico | null>(null);

  const [, setLikedJobIds] = useState<number[]>([]);
  const [, setDiscardedJobIds] = useState<number[]>([]);
  const [lastDirection, setLastDirection] = useState<"left" | "right">("right");

  // 🔥 Estado solo visual para feedback de like/dislike
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  // 🎯 Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("");
  const [filterModalidad, setFilterModalidad] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const guardarInteres = async (jobId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(GUARDAR_INTERES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: jobId,
          interesado: true,
        }),
      });
    } catch (err) {
      console.error("Error guardando interés:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resIntereses, resJobs] = await Promise.all([
          fetch(INTERESES_ENDPOINT, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${JOBS_ENDPOINT}?page=${page}&limit=12`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (resIntereses.status === 401 || resJobs.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        const dataIntereses = await resIntereses.json();
        const dataJobs = await resJobs.json();

        let likedIdsFromBackend: number[] = [];
        if (
          resIntereses.ok &&
          dataIntereses &&
          Array.isArray(dataIntereses.intereses)
        ) {
          likedIdsFromBackend = dataIntereses.intereses.map(
            (j: JobInteres) => j.id
          );
          setLikedJobIds(likedIdsFromBackend);
        }

        const jobsRaw: any[] = dataJobs.jobs || [];
        setTotalPages(dataJobs.total_pages || 1);

        const jobsNormalized: TrabajoPublico[] = jobsRaw.map((job: any) => ({
          ...job,
          imagen_trabajo_url: normalizeFotoUrl(
            job.foto_job || job.imagen_trabajo_url
          ),
          foto_empleador_url: normalizeFotoUrl(
            job.foto_empleador || job.foto_perfil
          ),
        }));

        const filteredJobs = jobsNormalized.filter(
          (job) => !likedIdsFromBackend.includes(job.id)
        );

        setAllTrabajos(filteredJobs);
        setTrabajos(filteredJobs);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, logout, navigate]);

  // ⏱ Ocultar feedback después de un tiempo
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 1300);
    return () => clearTimeout(t);
  }, [feedback]);

  const nextPage = () => setPage((p) => (p < totalPages ? p + 1 : p));
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  const openJobModal = (job: TrabajoPublico) => setSelectedJob(job);
  const closeJobModal = () => setSelectedJob(null);

  const parseToList = (text: string | undefined) => {
    if (!text) return [];
    return text
      .split(/[\n•\-;]+/g)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const goPrevJob = () => {
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };

  const goNextJob = () => {
    setCurrentIndex((idx) => (idx < trabajos.length - 1 ? idx + 1 : idx));
  };

  const handleSwipe = (action: "like" | "dislike") => {
    if (!trabajos.length) return;

    const job = trabajos[currentIndex];
    setLastDirection(action === "like" ? "right" : "left");

    // 👇 Dispara animación visual
    setFeedback(action);

    if (action === "like") {
      setLikedJobIds((prev) =>
        prev.includes(job.id) ? prev : [...prev, job.id]
      );
      guardarInteres(job.id);
    } else {
      setDiscardedJobIds((prev) =>
        prev.includes(job.id) ? prev : [...prev, job.id]
      );
    }

    const updated = trabajos.filter((_, idx) => idx !== currentIndex);
    setTrabajos(updated);

    if (updated.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= updated.length) {
      setCurrentIndex(updated.length - 1);
    }
  };

  const trabajoActual =
    trabajos.length > 0 && currentIndex >= 0 && currentIndex < trabajos.length
      ? trabajos[currentIndex]
      : null;

  const getModalidadLabel = (job: TrabajoPublico | null) => {
    if (!job) return "";
    if (typeof job.presencial === "boolean") {
      return job.presencial ? "Presencial" : "No presencial";
    }
    if (job.modalidad && job.modalidad.trim().length > 0) {
      return job.modalidad.trim();
    }
    return "";
  };

  const modalidadActual = getModalidadLabel(trabajoActual);

  // 🔍 Opciones únicas para los filtros
  const uniqueCities = Array.from(
    new Set(
      allTrabajos
        .map((job) => job.ciudad?.trim())
        .filter((c): c is string => !!c && c.length > 0)
    )
  );

  const uniqueCategories = Array.from(
    new Set(
      allTrabajos
        .map((job) => job.categoria?.trim())
        .filter((c): c is string => !!c && c.length > 0)
    )
  );

  const uniqueModalidades = Array.from(
    new Set(
      allTrabajos
        .map((job) => getModalidadLabel(job))
        .filter((m): m is string => !!m && m.trim().length > 0)
    )
  );

  const filtersApplied = Boolean(
    filterCategoria || filterCiudad || filterModalidad
  );

  const applyFilters = () => {
    let filtered = [...allTrabajos];

    if (filterCategoria) {
      filtered = filtered.filter(
        (job) =>
          (job.categoria || "").trim().toLowerCase() ===
          filterCategoria.trim().toLowerCase()
      );
    }

    if (filterCiudad) {
      filtered = filtered.filter(
        (job) =>
          (job.ciudad || "").trim().toLowerCase() ===
          filterCiudad.trim().toLowerCase()
      );
    }

    if (filterModalidad) {
      filtered = filtered.filter(
        (job) =>
          getModalidadLabel(job)?.trim().toLowerCase() ===
          filterModalidad.trim().toLowerCase()
      );
    }

    setTrabajos(filtered);
    setCurrentIndex(0);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterCategoria("");
    setFilterCiudad("");
    setFilterModalidad("");
    setTrabajos(allTrabajos);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Encuentra tu próximo CameYo
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {trabajos.length > 0
                ? `${trabajos.length} CameYos disponibles para ti`
                : "No hay CameYos disponibles por ahora"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Filters</span>
          </button>
        </header>

        {showFilters && (
          <div className="mb-6 flex justify-end">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Filtrar CameYos
                </span>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Cerrar
                </button>
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500">
                  Categoría
                </label>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500"
                >
                  <option value="">Todas</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500">
                  Ciudad
                </label>
                <select
                  value={filterCiudad}
                  onChange={(e) => setFilterCiudad(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500"
                >
                  <option value="">Todas</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modalidad */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500">
                  Modalidad
                </label>
                <select
                  value={filterModalidad}
                  onChange={(e) => setFilterModalidad(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500"
                >
                  <option value="">Todas</option>
                  {uniqueModalidades.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-[11px] px-4 py-2 font-medium hover:bg-slate-800"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando trabajos...</p>
        ) : trabajos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-1">
              {filtersApplied
                ? "No hay CameYos que coincidan con estos filtros."
                : "No hay CameYos nuevos disponibles por ahora."}
            </p>
            <p className="text-xs text-slate-500">
              {filtersApplied
                ? "Prueba ajustando o limpiando los filtros para ver más opciones."
                : "Cuando se publiquen nuevos trabajos, los verás aquí para seguir swippeando."}
            </p>
          </div>
        ) : (
          <>
            {/* Card principal */}
            <section className="mb-10 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
                {/* Flecha izquierda */}
                <button
                  type="button"
                  onClick={goPrevJob}
                  disabled={currentIndex === 0}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ◀
                </button>

                {/* Card swipeable */}
                <div className="flex-1 max-w-4xl">
                  {trabajoActual && (
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={trabajoActual.id}
                        className="relative bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          const threshold = 120;
                          if (info.offset.x > threshold || info.velocity.x > 500) {
                            handleSwipe("like");
                          } else if (
                            info.offset.x < -threshold ||
                            info.velocity.x < -500
                          ) {
                            handleSwipe("dislike");
                          }
                        }}
                        initial={{ opacity: 0, x: 40, rotate: 3 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        exit={{
                          opacity: 0,
                          x: lastDirection === "right" ? 200 : -200,
                          rotate: lastDirection === "right" ? 8 : -8,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      >
                        {/* Imagen izquierda */}
                        <div className="relative w-full md:w-1/2 h-60 md:h-[380px]">
                          {trabajoActual.imagen_trabajo_url ? (
                            <img
                              src={trabajoActual.imagen_trabajo_url}
                              alt={trabajoActual.titulo || "Imagen del CameYo"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-fuchsia-100 via-pink-50 to-purple-100 flex items-center justify-center">
                              <span className="text-6xl">💼</span>
                            </div>
                          )}

                          {/* Badge estado */}
                          <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
                            {trabajoActual.estado === "abierto"
                              ? "Activo"
                              : trabajoActual.estado}
                          </div>
                        </div>

                        {/* Info derecha */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                                {trabajoActual.titulo}
                              </h2>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {trabajoActual.nombre_empresa ||
                                  trabajoActual.nombre_empleador ||
                                  "Empleador CameYa"}
                              </p>
                            </div>

                            {trabajoActual.foto_empleador_url && (
                              <img
                                src={trabajoActual.foto_empleador_url}
                                alt="Empleador"
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                            )}
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {trabajoActual.ciudad && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                📍 {trabajoActual.ciudad}
                              </span>
                            )}
                            {trabajoActual.salario && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                💰 ${trabajoActual.salario}
                                {trabajoActual.negociable && (
                                  <span className="ml-1 text-[10px] opacity-80">
                                    (negociable)
                                  </span>
                                )}
                              </span>
                            )}
                            {modalidadActual && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
                                🕒 {modalidadActual}
                              </span>
                            )}
                            {trabajoActual.categoria && (
                              <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-3 py-1 text-fuchsia-600">
                                {trabajoActual.categoria}
                              </span>
                            )}
                          </div>

                          {/* Descripción */}
                          <div className="space-y-2 text-xs text-slate-600">
                            <p className="line-clamp-3">
                              {trabajoActual.descripcion ||
                                "Sin descripción detallada."}
                            </p>

                            {parseToList(trabajoActual.requisitos).length > 0 && (
                              <div>
                                <p className="font-semibold text-[11px] text-slate-700 mb-1">
                                  Requisitos:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {parseToList(trabajoActual.requisitos).map(
                                    (item, idx) => (
                                      <li key={idx}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {parseToList(trabajoActual.habilidades).length >
                              0 && (
                              <div>
                                <p className="font-semibold text-[11px] text-slate-700 mb-1">
                                  Habilidades deseadas:
                                </p>
                                <ul className="flex flex-wrap gap-1">
                                  {parseToList(trabajoActual.habilidades).map(
                                    (h, idx) => (
                                      <li
                                        key={idx}
                                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
                                      >
                                        {h}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Botones de acción */}
                          <div className="mt-2 flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <button
                                type="button"
                                onClick={() => handleSwipe("dislike")}
                                className="flex-1 inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 md:flex-none md:w-28"
                              >
                                ✕ No me interesa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSwipe("like")}
                                className="flex-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:brightness-105 md:flex-none md:w-32"
                              >
                                ♥ Me interesa
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openJobModal(trabajoActual)}
                              className="text-[11px] text-slate-500 hover:text-slate-800"
                            >
                              Ver detalles completos
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {/* Flecha derecha */}
                <button
                  type="button"
                  onClick={goNextJob}
                  disabled={currentIndex >= trabajos.length - 1}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ▶
                </button>
              </div>

              {/* Indicador de posición */}
              <div className="mt-4 text-[11px] text-slate-500">
                CameYo {currentIndex + 1} de {trabajos.length}
                {totalPages > 1 && (
                  <span className="ml-2">
                    | Página {page} de {totalPages}
                  </span>
                )}
              </div>

              {/* Paginación básica */}
              {totalPages > 1 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={prevPage}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* Modal simple para detalles (si lo quieres usar después) */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeJobModal}
            >
              <motion.div
                className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Aquí podrías reusar parte del contenido del card para detalle */}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {selectedJob.titulo}
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    {selectedJob.nombre_empresa ||
                      selectedJob.nombre_empleador ||
                      "Empleador CameYa"}
                  </p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {selectedJob.descripcion}
                  </p>
                </div>
                <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={closeJobModal}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback visual like/dislike */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div
                className={
                  feedback === "like"
                    ? "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white px-4 py-2 text-xs shadow-lg"
                    : "inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-xs shadow-lg"
                }
              >
                <span
                  className={
                    feedback === "like"
                      ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white text-sm"
                      : "inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 text-sm"
                  }
                >
                  {feedback === "like" ? "♥" : "✕"}
                </span>
                <span>
                  {feedback === "like"
                    ? "Añadido a tus CameYos con interés."
                    : "Descartaste este CameYo."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudentDashboardHome;
