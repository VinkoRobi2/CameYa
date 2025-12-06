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
  modalidad: string;
  fecha_creacion: string;
  postulacion_contratada_id: number | null;
  estado: string;

  // Backend extra
  foto_job?: string;
  foto_empleador?: string;
  foto_perfil?: string;
  nombre_empleador?: string;
  apellido_empleador?: string;
  rating_empleador?: number;
  presencial?: boolean;

  // Normalizados
  imagen_trabajo_url?: string;
  foto_empleador_url?: string;
}

interface ApiResponseTrabajos {
  page: number;
  total_pages: number;
  total_jobs: number;
  jobs: TrabajoPublico[];
}

interface JobInteres {
  id: number;
}

interface ApiResponseIntereses {
  total: number;
  intereses: JobInteres[];
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
      console.error("Error al guardar interés:", err);
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

        const dataIntereses: ApiResponseIntereses | any =
          (await resIntereses.json().catch(() => ({}))) || {};
        const dataJobs: ApiResponseTrabajos | any =
          (await resJobs.json().catch(() => ({}))) || {};

        if (!resJobs.ok) {
          setError(
            (dataJobs as any).error ||
              (dataJobs as any).message ||
              "No se pudieron cargar los trabajos disponibles."
          );
          return;
        }

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

  // ⏱ Ocultar feedback después de un rato
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 900);
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
    } else {
      setCurrentIndex(currentIndex);
    }
  };

  const trabajoActual = trabajos[currentIndex];

  const getEmployerName = (job: TrabajoPublico | null) => {
    if (!job) return "";
    const full = `${job.nombre_empleador ?? ""} ${
      job.apellido_empleador ?? ""
    }`.trim();
    return full || `Empleador #${job.empleador_id}`;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 py-8 overflow-y-auto">
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
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Filters</span>
          </button>
        </header>

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
              No hay CameYos nuevos disponibles por ahora.
            </p>
            <p className="text-xs text-slate-500">
              Cuando se publiquen nuevos trabajos, los verás aquí para seguir
              swippeando.
            </p>
          </div>
        ) : (
          <>
            {/* Card principal */}
            <section className="mb-10 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
                <button
                  type="button"
                  onClick={goPrevJob}
                  disabled={currentIndex === 0}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>

                <AnimatePresence mode="popLayout">
                  {trabajoActual && (
                    <motion.article
                      key={trabajoActual.id}
                      className="relative bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-2xl hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-200 flex flex-col md:flex-row w-full cursor-pointer"
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
                        rotate: lastDirection === "right" ? 10 : -10,
                      }}
                      transition={{ duration: 0.25 }}
                      whileDrag={{ scale: 1.02, rotate: 2 }}
                      onClick={() => openJobModal(trabajoActual)}
                    >
                      {/* Overlay grande de corazón/X al hacer swipe */}
                      <AnimatePresence>
                        {feedback === "like" && (
                          <motion.div
                            key="like-overlay"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.25 }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <div className="rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500/90 px-6 py-4 shadow-2xl border-2 border-white">
                              <span className="text-3xl md:text-4xl text-white">
                                ♥
                              </span>
                            </div>
                          </motion.div>
                        )}
                        {feedback === "dislike" && (
                          <motion.div
                            key="dislike-overlay"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.25 }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <div className="rounded-full bg-white/95 px-6 py-4 shadow-2xl border-2 border-red-400">
                              <span className="text-3xl md:text-4xl text-red-500">
                                ✕
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Imagen izquierda */}
                      <div className="relative w-full md:w-1/2 h-60 md:h-[380px]">
                        {trabajoActual.imagen_trabajo_url ? (
                          <img
                            src={trabajoActual.imagen_trabajo_url}
                            alt={trabajoActual.titulo || "Imagen del CameYo"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400" />
                        )}

                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500" />
                            CameYo
                          </span>
                        </div>
                      </div>

                      {/* Detalles derecha */}
                      <div className="flex-1 px-6 md:px-8 py-6 flex flex-col gap-4 justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                                {trabajoActual.titulo || "Trabajo sin título"}
                              </h2>
                              <p className="text-sm text-slate-500">
                                {getEmployerName(trabajoActual)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700">
                              <span>⭐</span>
                              <span>
                                {typeof trabajoActual.rating_empleador ===
                                  "number"
                                  ? trabajoActual.rating_empleador.toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700">
                              {trabajoActual.salario &&
                              trabajoActual.salario.trim().length > 0
                                ? `$${trabajoActual.salario}`
                                : "Pago a convenir"}
                              {trabajoActual.negociable && " · Negociable"}
                            </span>

                            {modalidadActual && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 capitalize">
                                {modalidadActual}
                              </span>
                            )}

                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700">
                              {trabajoActual.ciudad && trabajoActual.ciudad.trim()
                                ? trabajoActual.ciudad
                                : "Ubicación no especificada"}
                            </span>
                          </div>

                          {/* Descripción */}
                          {trabajoActual.descripcion && (
                            <div className="mt-4">
                              <h3 className="text-xs font-semibold text-slate-700 mb-1">
                                Description
                              </h3>
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                                {trabajoActual.descripcion}
                              </p>
                            </div>
                          )}

                          {/* Requirements SIEMPRE visibles */}
                          <div className="mt-3">
                            <h3 className="text-xs font-semibold text-slate-700 mb-1">
                              Requirements
                            </h3>
                            {(() => {
                              const list = parseToList(
                                trabajoActual.habilidades ||
                                  trabajoActual.requisitos
                              );
                              if (list.length === 0) {
                                return (
                                  <p className="text-[11px] text-slate-400">
                                    Este empleador no indicó requisitos
                                    específicos para este CameYo.
                                  </p>
                                );
                              }
                              return (
                                <div className="flex flex-wrap gap-2">
                                  {list.slice(0, 4).map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-4">
                          <div className="text-[11px] text-slate-400">
                            Publicado el{" "}
                            {new Date(
                              trabajoActual.fecha_creacion
                            ).toLocaleDateString()}
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              openJobModal(trabajoActual);
                            }}
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={goNextJob}
                  disabled={currentIndex === trabajos.length - 1}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              </div>

              {/* Botones swipe */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-6">
                  <motion.button
                    type="button"
                    onClick={() => handleSwipe("dislike")}
                    disabled={!trabajoActual}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{
                      scale: 1.07,
                      boxShadow: "0 18px 45px rgba(239,68,68,0.25)",
                    }}
                    className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center rounded-full border-[3px] border-red-400 bg-white text-red-500 text-2xl font-bold shadow-md hover:bg-red-50 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ✕
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleSwipe("like")}
                    disabled={!trabajoActual}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{
                      scale: 1.07,
                      boxShadow: "0 20px 50px rgba(236,72,153,0.35)",
                    }}
                    className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 text-white text-3xl font-bold shadow-xl hover:opacity-95 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ♥
                  </motion.button>
                </div>

                <p className="text-[10px] text-slate-500">
                  “✕ No me interesa” · “♥ Me interesa” — también puedes arrastrar
                  la tarjeta para hacer swipe.
                </p>

                <p className="text-[11px] text-slate-500 mt-1">
                  CameYo {currentIndex + 1} de {trabajos.length} · Página {page}
                </p>
              </div>

              {/* Paginación */}
              <div className="mt-6 flex justify-between items-center w-full max-w-5xl text-xs text-slate-600">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  ← Página anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  Siguiente página →
                </button>
              </div>
            </section>
          </>
        )}

        {/* Modal detalles */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={closeJobModal}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 px-6 md:px-8 py-5 overflow-y-auto">
                {selectedJob.imagen_trabajo_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                    <img
                      src={selectedJob.imagen_trabajo_url}
                      alt={selectedJob.titulo || "Imagen del CameYo"}
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                      {selectedJob.categoria || "CameYo"}
                    </p>
                    <h2 className="text-lg font-semibold">
                      {selectedJob.titulo || "Trabajo sin título"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedJob.ciudad || "Ciudad no especificada"} ·{" "}
                      {getModalidadLabel(selectedJob) ||
                        "Modalidad no especificada"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Publicado el{" "}
                      {new Date(
                        selectedJob.fecha_creacion
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={closeJobModal}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <section className="mb-5">
                  <h3 className="text-sm font-semibold mb-1">
                    Descripción del CameYo
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.descripcion}
                  </p>
                </section>

                {/* Requisitos SIEMPRE visibles en modal */}
                <section className="mb-5">
                  <h3 className="text-sm font-semibold mb-1">Requisitos</h3>
                  {(() => {
                    const list = parseToList(selectedJob.requisitos);
                    if (list.length === 0) {
                      return (
                        <p className="text-xs text-slate-500">
                          Este empleador no ha indicado requisitos específicos
                          para este CameYo.
                        </p>
                      );
                    }
                    return (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {list.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    );
                  })()}
                </section>

                {selectedJob.habilidades && (
                  <section className="mb-5">
                    <h3 className="text-sm font-semibold mb-1">
                      Habilidades valoradas
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                      {parseToList(selectedJob.habilidades).map(
                        (item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-100"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </section>
                )}
              </div>

              <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50 px-6 py-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mb-2 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-600">
                      {selectedJob.foto_empleador_url ? (
                        <img
                          src={selectedJob.foto_empleador_url}
                          alt={getEmployerName(selectedJob)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {getEmployerName(selectedJob)
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {getEmployerName(selectedJob)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Creador de este CameYo
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-700 border border-slate-200">
                      <span>⭐</span>
                      <span>
                        {typeof selectedJob.rating_empleador === "number"
                          ? selectedJob.rating_empleador.toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold">Pago:</span>{" "}
                      {selectedJob.salario &&
                      selectedJob.salario.trim().length > 0
                        ? `$${selectedJob.salario}`
                        : "A convenir"}
                      {selectedJob.negociable && " · Negociable"}
                    </p>
                    <p>
                      <span className="font-semibold">Categoría:</span>{" "}
                      {selectedJob.categoria || "No especificada"}
                    </p>
                    <p>
                      <span className="font-semibold">Modalidad:</span>{" "}
                      {getModalidadLabel(selectedJob) ||
                        "No especificada por el empleador"}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span>{" "}
                      {selectedJob.estado}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-[10px] text-slate-500">
                  Más adelante, cuando activemos las postulaciones y el chat,
                  podrás pasar de “Me interesa” a postulación o match directo
                  con el empleador.
                </p>
              </aside>
            </div>
          </div>
        )}

        {/* Toast flotante de feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                <span
                  className={
                    feedback === "like"
                      ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 text-white text-sm"
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
