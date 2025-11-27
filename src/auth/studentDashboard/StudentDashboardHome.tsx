import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
}

interface ApiResponseTrabajos {
  page: number;
  total_pages: number;
  total_jobs: number;
  jobs: TrabajoPublico[];
}

// Endpoint para los trabajos abiertos
const JOBS_ENDPOINT = `${API_BASE_URL}/protected/todos_trabajos`;
// Endpoint para postular a un trabajo
const APPLY_ENDPOINT = (jobId: number) =>
  `${API_BASE_URL}/protected/trabajos/${jobId}/postular`;

const StudentDashboardHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [trabajos, setTrabajos] = useState<TrabajoPublico[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [selectedJob, setSelectedJob] = useState<TrabajoPublico | null>(null);

  // Estado de postulación
  const [cartaPresentacion, setCartaPresentacion] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchTrabajos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${JOBS_ENDPOINT}?page=${page}&limit=9`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: ApiResponseTrabajos = await res.json().catch(
          () => ({} as any)
        );

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data as any).error ||
              (data as any).message ||
              "No se pudieron cargar los trabajos disponibles."
          );
          return;
        }

        setTrabajos(data.jobs || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrabajos();
  }, [page, logout, navigate]);

  const nextPage = () => setPage((p) => (p < totalPages ? p + 1 : p));
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  const openJobModal = (job: TrabajoPublico) => {
    setSelectedJob(job);
    setCartaPresentacion("");
    setApplyError(null);
    setApplySuccess(null);
    setApplyLoading(false);
  };

  const closeJobModal = () => {
    setSelectedJob(null);
  };

  // Utilidad para mostrar requisitos/habilidades como lista
  const parseToList = (text: string | undefined) => {
    if (!text) return [];
    return text
      .split(/[\n•\-;]+/g)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    setApplyLoading(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const res = await fetch(APPLY_ENDPOINT(selectedJob.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carta_presentacion: cartaPresentacion,
          job_id: selectedJob.id,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setApplyError(
          data.error ||
            data.message ||
            "No se pudo completar la postulación. Inténtalo de nuevo."
        );
        return;
      }

      // Marcar éxito
      setApplySuccess("Te has postulado correctamente a este trabajo.");

      // Opcional: actualizar el job en el listado para reflejar que ya tiene postulacion_contratada_id
      if (typeof data.job_application_id === "number") {
        setTrabajos((prev) =>
          prev.map((job) =>
            job.id === selectedJob.id
              ? { ...job, postulacion_contratada_id: data.job_application_id }
              : job
          )
        );
      }

      // Si quieres cerrar el modal después de postular, descomenta:
      // setTimeout(() => {
      //   closeJobModal();
      // }, 1200);
    } catch (err) {
      console.error(err);
      setApplyError("Error de conexión. Intenta nuevamente.");
    } finally {
      setApplyLoading(false);
    }
  };

  const jobAlreadyHasApplication = !!selectedJob?.postulacion_contratada_id;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto relative">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Trabajos disponibles</h1>
          <p className="text-sm text-slate-600">
            Explora CameYos abiertos y encuentra oportunidades que encajen
            contigo.
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
              Aún no hay CameYos disponibles.
            </p>
            <p className="text-xs text-slate-500">
              Vuelve más tarde, pronto habrá empleadores publicando trabajos.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {trabajos.map((job) => {
                const ciudad =
                  job.ciudad && job.ciudad.trim().length > 0
                    ? job.ciudad
                    : "Ciudad no especificada";

                const modalidad =
                  job.modalidad && job.modalidad.trim().length > 0
                    ? job.modalidad
                    : "Modalidad no especificada";

                const salarioLabel =
                  job.salario && job.salario.trim().length > 0
                    ? job.salario
                    : "A convenir";

                const descripcionCorta =
                  job.descripcion && job.descripcion.length > 140
                    ? job.descripcion.slice(0, 140) + "..."
                    : job.descripcion;

                return (
                  <article
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold">
                          {job.titulo || "Trabajo sin título"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ciudad} · {modalidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-800">
                          {salarioLabel}
                        </p>
                        {job.negociable && (
                          <p className="text-[11px] text-slate-500">
                            Negociable
                          </p>
                        )}
                      </div>
                    </div>

                    {descripcionCorta && (
                      <p className="text-xs text-slate-600">
                        {descripcionCorta}
                      </p>
                    )}

                    {job.categoria && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-medium">
                          {job.categoria}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                        onClick={() => openJobModal(job)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Controles de paginación */}
            <div className="flex justify-between items-center text-xs text-slate-600">
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
          </>
        )}

        {/* MODAL DE DETALLES DEL TRABAJO */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeJobModal}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-4xl w-[90%] max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido principal */}
              <div className="flex-1 px-8 py-6 overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedJob.titulo || "Trabajo sin título"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Publicado por Empleador #{selectedJob.empleador_id}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedJob.ciudad || "Ciudad no especificada"} ·{" "}
                      {selectedJob.modalidad || "Modalidad no especificada"}
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
                    Descripción del trabajo
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
                    <ul className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                      {parseToList(selectedJob.habilidades).map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-100"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}

                {/* Carta de presentación */}
                <section className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">
                    Carta de presentación
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Cuéntale brevemente al empleador por qué eres un buen fit
                    para este CameYo.
                  </p>
                  <textarea
                    className="w-full min-h-[100px] text-xs rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 resize-none"
                    placeholder="Ej: Soy estudiante de X semestre, tengo experiencia en..., puedo ayudarles especialmente con..."
                    value={cartaPresentacion}
                    onChange={(e) => setCartaPresentacion(e.target.value)}
                  />
                </section>

                {applyError && (
                  <div className="mb-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                    {applyError}
                  </div>
                )}
                {applySuccess && (
                  <div className="mb-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                    {applySuccess}
                  </div>
                )}
              </div>

              {/* Panel lateral empleador / info rápida */}
              <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50 px-6 py-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mb-2 flex items-center justify-center text-xs font-semibold text-slate-600">
                      E#{selectedJob.empleador_id}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Empleador #{selectedJob.empleador_id}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Publicó este CameYo
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold">Salario:</span>{" "}
                      {selectedJob.salario && selectedJob.salario.trim()
                        ? selectedJob.salario
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
                    <p>
                      <span className="font-semibold">Publicado:</span>{" "}
                      {new Date(
                        selectedJob.fecha_creacion
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  className="mt-6 w-full rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleApply}
                  disabled={applyLoading || jobAlreadyHasApplication}
                >
                  {jobAlreadyHasApplication
                    ? "Este trabajo ya tiene una postulación asociada"
                    : applyLoading
                    ? "Postulando..."
                    : "Postular a este trabajo"}
                </button>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboardHome;
