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

      <main className="flex-1 px-4 md:px-10 pt-20 pb-10 overflow-y-auto flex flex-col items-center">
        {/* Header */}
        <header className="w-full max-w-5xl mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">
              Descubrir CameYos
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-slate-900">
              Encuentra tu próximo trabajo flash
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {trabajos.length > 0
                ? `${trabajos.length} CameYos disponibles para ti ahora mismo`
                : "Te avisamos cuando haya nuevos CameYos para ti."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/80 shadow-sm border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Filtros</span>
            <span className="h-5 w-[1px] bg-slate-200" />
            <span className="text-[11px] text-slate-400">
              {filtersApplied ? "Aplicados" : "Todos"}
            </span>
          </button>
        </header>

        {/* Panel de filtros flotante */}
        {showFilters && (
          <div className="w-full max-w-5xl mb-6 flex justify-end">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs space-y-3">
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

        {/* Errores */}
        {error && (
          <div className="w-full max-w-xl mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        {loading ? (
          <p className="mt-10 text-sm text-slate-600">Cargando CameYos...</p>
        ) : trabajos.length === 0 ? (
          // 🔄 Estado sin CameYos – estilo "No more jobs to show"
          <div className="mt-16 w-full flex flex-col items-center">
            <div className="max-w-md w-full bg-white/80 border border-slate-100 rounded-3xl shadow-xl px-8 py-16 text-center">
              <div className="flex items-center justify-center mb-5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🎉</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                No hay CameYos para mostrar
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {filtersApplied
                  ? "No encontramos CameYos que coincidan con esos filtros."
                  : "Vuelve más tarde para ver nuevos CameYos publicados."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-105"
              >
                Mostrar CameYos otra vez
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Card tipo SwipeHire centrado */}
            <section className="mt-4 w-full flex flex-col items-center">
              {/* Pequeño subtítulo sobre el CameYo actual */}
              {trabajoActual && (
                <div className="mb-4 text-xs text-slate-500">
                  CameYos disponibles en{" "}
                  <span className="font-semibold text-slate-700">
                    {trabajoActual.ciudad || "tu zona"}
                  </span>
                </div>
              )}

              <div className="w-full flex justify-center">
                <div className="w-full max-w-xl">
                  {trabajoActual && (
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={trabajoActual.id}
                        className="relative bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          const threshold = 120;
                          if (
                            info.offset.x > threshold ||
                            info.velocity.x > 500
                          ) {
                            handleSwipe("like");
                          } else if (
                            info.offset.x < -threshold ||
                            info.velocity.x < -500
                          ) {
                            handleSwipe("dislike");
                          }
                        }}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                          opacity: 0,
                          x: lastDirection === "right" ? 200 : -200,
                          rotate: lastDirection === "right" ? 8 : -8,
                        }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                      >
                        {/* Imagen del trabajo */}
                        <div className="relative h-64 md:h-72 w-full">
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

                          {/* Estado / badge */}
                          <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-emerald-50/95 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
                            {trabajoActual.estado === "abierto"
                              ? "CameYo activo"
                              : trabajoActual.estado}
                          </div>

                          {/* Foto de empleador */}
                          {trabajoActual.foto_empleador_url && (
                            <div className="absolute bottom-[-24px] right-5 h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                              <img
                                src={trabajoActual.foto_empleador_url}
                                alt="Empleador"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Contenido del card */}
                        <div className="px-6 pt-7 pb-6 space-y-5">
                          {/* Título / empresa */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                                {trabajoActual.titulo}
                              </h2>
                              <p className="mt-1 text-xs text-slate-500">
                                {trabajoActual.nombre_empresa ||
                                  trabajoActual.nombre_empleador ||
                                  "Empleador CameYa"}
                              </p>
                            </div>
                          </div>

                          {/* Chips principales */}
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {trabajoActual.categoria && (
                              <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-3 py-1 text-fuchsia-600">
                                💼 {trabajoActual.categoria}
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
                          </div>

                          {/* Sección Sobre el CameYo */}
                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="flex items-center gap-1 font-semibold text-[11px] text-slate-700">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-50 text-pink-500 text-[11px]">
                                i
                              </span>
                              Sobre el CameYo
                            </p>
                            <p className="text-xs leading-relaxed line-clamp-3">
                              {trabajoActual.descripcion ||
                                "Este empleador aún no ha añadido una descripción detallada."}
                            </p>
                          </div>

                          {/* Requisitos / habilidades */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {parseToList(trabajoActual.requisitos).length > 0 && (
                              <div>
                                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                                    ✓
                                  </span>
                                  Requisitos
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
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
                                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-50 text-purple-600 text-[11px]">
                                    ✧
                                  </span>
                                  Habilidades deseadas
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {parseToList(trabajoActual.habilidades).map(
                                    (h, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
                                      >
                                        {h}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mensaje inferior tipo "swipeó tu job" */}
                          <div className="mt-1 rounded-2xl bg-emerald-50 text-[11px] text-emerald-700 px-3 py-2 flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">
                              ♥
                            </span>
                            <span>
                              Si marcas este CameYo con interés, el empleador
                              podrá verte en la lista de candidatos potenciales.
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Botones grandes de acción */}
              <div className="mt-6 flex items-center justify-center gap-8">
                <button
                  type="button"
                  onClick={() => handleSwipe("dislike")}
                  className="h-14 w-14 flex items-center justify-center rounded-full bg-white border border-red-100 text-red-500 text-xl shadow-md hover:bg-red-50"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => handleSwipe("like")}
                  className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white text-2xl shadow-lg hover:brightness-105"
                >
                  ♥
                </button>
              </div>

              {/* Indicador de posición y paginación simple */}
              <div className="mt-4 text-[11px] text-slate-500 flex flex-col items-center gap-1">
                <span>
                  {currentIndex + 1}/{trabajos.length}
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevPage}
                      disabled={page === 1}
                      className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                    >
                      Página anterior
                    </button>
                    <span>
                      Página {page} de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                    >
                      Siguiente página
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Modal simple para detalles */}
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
