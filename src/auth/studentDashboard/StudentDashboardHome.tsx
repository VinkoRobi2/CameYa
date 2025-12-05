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

  // 🔹 Campos que llegan del backend
  foto_job?: string;
  foto_empleador?: string;
  foto_perfil?: string;

  // 🔹 Campos normalizados para el front
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

// 🔹 Limpia URLs rotas tipo "http://.../uploads/http://.../uploads/job_9.png"
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

  const [likedJobIds, setLikedJobIds] = useState<number[]>([]);
  const [discardedJobIds, setDiscardedJobIds] = useState<number[]>([]);
  const [lastDirection, setLastDirection] = useState<"left" | "right">("right");

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

        // 🔹 Normalizamos imagen del job y foto del empleador
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Explorar CameYos</h1>
          <p className="text-sm text-slate-600">
            Desliza entre trabajos como si fuera Tinder: marca los que te
            interesan y descarta los que no encajan contigo.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando trabajos...</p>
        ) : trabajos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              No hay CameYos nuevos disponibles por ahora.
            </p>
            <p className="text-xs text-slate-500">
              Cuando se publiquen nuevos trabajos, los verás aquí para
              seguir swippeando.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-6 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 w-full max-w-3xl">
                <button
                  type="button"
                  onClick={goPrevJob}
                  disabled={currentIndex === 0}
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>

                <AnimatePresence mode="popLayout">
                  {trabajoActual && (
                    <motion.article
                      key={trabajoActual.id}
                      className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer w-full"
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
                      initial={{ opacity: 0, x: 40, rotate: 4 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{
                        opacity: 0,
                        x: lastDirection === "right" ? 200 : -200,
                        rotate: lastDirection === "right" ? 12 : -12,
                      }}
                      transition={{ duration: 0.25 }}
                      whileDrag={{ scale: 1.02, rotate: 3 }}
                      onClick={() => openJobModal(trabajoActual)}
                    >
                      <div className="relative h-56 w-full">
                        {trabajoActual.imagen_trabajo_url ? (
                          <img
                            src={trabajoActual.imagen_trabajo_url}
                            alt={trabajoActual.titulo || "Imagen del CameYo"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-primary to-sky-400" />
                        )}

                        <div className="absolute inset-0 bg-black/20" />

                        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-4 pt-10">
                          <p className="text-[11px] uppercase tracking-wide text-white/80 mb-1">
                            {trabajoActual.categoria || "CameYo"}
                          </p>
                          <h2 className="text-lg font-semibold text-white leading-tight line-clamp-2">
                            {trabajoActual.titulo || "Trabajo sin título"}
                          </h2>
                          <p className="text-[11px] text-white/80 mt-1">
                            {(trabajoActual.ciudad &&
                            trabajoActual.ciudad.trim().length > 0
                              ? trabajoActual.ciudad
                              : "Ciudad no especificada") +
                              " · " +
                              (trabajoActual.modalidad &&
                              trabajoActual.modalidad.trim().length > 0
                                ? trabajoActual.modalidad
                                : "Modalidad no especificada")}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-600">
                            <p className="font-semibold text-slate-800">
                              {trabajoActual.salario &&
                              trabajoActual.salario.trim().length > 0
                                ? `$${trabajoActual.salario}`
                                : "Pago a convenir"}
                            </p>
                            {trabajoActual.negociable && (
                              <p className="text-[11px] text-slate-500">
                                Pago negociable
                              </p>
                            )}
                          </div>

                          <div className="text-right text-[11px] text-slate-500">
                            <p>
                              Publicado el{" "}
                              {new Date(
                                trabajoActual.fecha_creacion
                              ).toLocaleDateString()}
                            </p>
                            <p className="capitalize">
                              Estado: {trabajoActual.estado.toLowerCase()}
                            </p>
                          </div>
                        </div>

                        {trabajoActual.descripcion && (
                          <p className="text-[11px] text-slate-600 line-clamp-3">
                            {trabajoActual.descripcion}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-1">
                          {trabajoActual.categoria && (
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-medium">
                              {trabajoActual.categoria}
                            </span>
                          )}
                          {trabajoActual.modalidad && (
                            <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-[11px] font-medium">
                              {trabajoActual.modalidad}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex">
                          <button
                            type="button"
                            className="flex-1 px-3 py-2 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              openJobModal(trabajoActual);
                            }}
                          >
                            Ver detalles completos
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
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="text-[11px] text-slate-600">
                  CameYo {currentIndex + 1} de {trabajos.length} · Página {page}
                </p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSwipe("dislike")}
                    disabled={!trabajoActual}
                    className="h-11 w-11 md:h-12 md:w-12 flex items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 text-lg font-bold shadow-sm hover:bg-red-100 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ✕
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwipe("like")}
                    disabled={!trabajoActual}
                    className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-2xl font-bold shadow-md hover:bg-emerald-100 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ♥
                  </button>
                </div>

                <p className="text-[10px] text-slate-500">
                  “✕ No me interesa” · “♥ Me interesa” — el swipe arrastrando la
                  card hace lo mismo, con animación.
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center w-full max-w-3xl text-xs text-slate-600">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  ← Página anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Siguiente página →
                </button>
              </div>
            </section>
          </>
        )}

        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={closeJobModal}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
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
                      {selectedJob.modalidad || "Modalidad no especificada"}
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

                {selectedJob.requisitos && (
                  <section className="mb-5">
                    <h3 className="text-sm font-semibold mb-1">Requisitos</h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {parseToList(selectedJob.requisitos).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

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
                          alt={`Empleador ${selectedJob.empleador_id}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>E#{selectedJob.empleador_id}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Empleador #{selectedJob.empleador_id}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Creador de este CameYo
                    </p>
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
      </main>
    </div>
  );
};

export default StudentDashboardHome;
