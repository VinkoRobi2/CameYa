// src/auth/employerDashboard/EmployerPosts.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import EmployerSidebar from "./EmployerSidebar";

interface Job {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  requisitos?: string;
  habilidades?: string;
  salario?: string; // ej: "50.00"
  pago_estimado?: number; // fallback si viene calculado
  negociable: boolean;
  ciudad: string;
  modalidad?: string;
  fecha_creacion?: string;
  estado?: string;
  postulacion_contratada_id?: number | null;
}

interface JobApplication {
  id: number;
  trabajo_id: number;
  estudiante_id: number;
  carta_presentacion?: string;
  estado: string;
  creado_en?: string;
  estudiante_nombre: string;
  estudiante_foto_url?: string;
  estudiante_habilidades?: string;
  estudiante_carrera?: string;
}

interface PublicStudentProfile {
  nombre: string;
  apellido: string;
  titulo_perfil?: string;
  sectores_preferencias?: string[] | null;
  ciudad?: string;
  universidad?: string;
  carrera?: string;
  disponibilidad_de_tiempo?: string;
  whatsapp?: string;
  email?: string;
  links?: string | string[];
}

type RatingTagKey =
  | "responsable_puntual"
  | "calidad_trabajo"
  | "buena_comunicacion"
  | "buena_actitud"
  | "autonomo"
  | "no_se_presento"
  | "cancelo_ultima_hora"
  | "falta_respeto"
  | "no_termino_trabajo";

const JOBS_ENDPOINT = `${API_BASE_URL}/protected/trabajos_creados`;
const APPLICATIONS_ENDPOINT = `${API_BASE_URL}/protected/empleador/trabajo/postulaciones`;
const REVIEW_APPLICATION_ENDPOINT = `${API_BASE_URL}/protected/aplicacion/review`;
const PUBLIC_PROFILE_ENDPOINT = (id: number) =>
  `${API_BASE_URL}/protected/perfil-publico/${id}`;
const RATE_STUDENT_ENDPOINT = `${API_BASE_URL}/protected/valorar-estudiante`;

// 🔹 Endpoint alineado con EmpleadorCompletarHandler (completar.go)
const EMPLOYER_COMPLETE_ENDPOINT = `${API_BASE_URL}/protected/completar/empleador`;

const EmployerPosts: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [appsActionMsg, setAppsActionMsg] = useState<string | null>(null);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [isHiredView, setIsHiredView] = useState(false);

  // Perfil público
  const [publicProfile, setPublicProfile] =
    useState<PublicStudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Valoración
  const [rating, setRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [ratingTags, setRatingTags] = useState<Record<RatingTagKey, boolean>>({
    responsable_puntual: false,
    calidad_trabajo: false,
    buena_comunicacion: false,
    buena_actitud: false,
    autonomo: false,
    no_se_presento: false,
    cancelo_ultima_hora: false,
    falta_respeto: false,
    no_termino_trabajo: false,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  // 🔹 Estado de completado del lado del empleador
  const [employerCompleted, setEmployerCompleted] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);

  const toggleRatingTag = (key: RatingTagKey) => {
    setRatingTags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentApp =
    applications.length > 0 && currentAppIndex >= 0
      ? applications[currentAppIndex]
      : null;

  // persona / empresa para sidebar
  const storedUserStr = localStorage.getItem("auth_user");
  let mode: "person" | "company" = "person";
  if (storedUserStr) {
    try {
      const u = JSON.parse(storedUserStr);
      const tipoIdentidad = u.tipo_identidad || u.TipoIdentidad;
      if (
        typeof tipoIdentidad === "string" &&
        tipoIdentidad.toLowerCase() === "empresa"
      ) {
        mode = "company";
      }
    } catch {
      mode = "person";
    }
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Cargar trabajos
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(JOBS_ENDPOINT, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({} as any));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data && (data.error as string)) ||
              (data && (data.message as string)) ||
              "No se pudieron cargar tus CameYos."
          );
          return;
        }

        const jobsData = (data.jobs || data.data || []) as Job[];
        setJobs(jobsData);
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar tus CameYos.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [logout, navigate]);

  // Perfil público estudiante contratado
  const fetchPublicProfile = async (studentId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);

      const res = await fetch(PUBLIC_PROFILE_ENDPOINT(studentId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setProfileError(
          data.err ||
            data.error ||
            data.message ||
            "No se pudo cargar el perfil público."
        );
        setPublicProfile(null);
        return;
      }

      setPublicProfile(data.data as PublicStudentProfile);
    } catch (err) {
      console.error(err);
      setProfileError("Error de conexión al cargar el perfil.");
      setPublicProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const openApplicationsModal = async (job: Job) => {
    setSelectedJob(job);
    setApplications([]);
    setAppsError(null);
    setAppsActionMsg(null);
    setCurrentAppIndex(0);
    setPublicProfile(null);
    setProfileError(null);
    setProfileLoading(false);
    setIsHiredView(false);
    setRating(null);
    setRatingComment("");
    setRatingMessage(null);
    setRatingTags({
      responsable_puntual: false,
      calidad_trabajo: false,
      buena_comunicacion: false,
      buena_actitud: false,
      autonomo: false,
      no_se_presento: false,
      cancelo_ultima_hora: false,
      falta_respeto: false,
      no_termino_trabajo: false,
    });
    setRatingLoading(false);
    setEmployerCompleted(false);
    setCompleteLoading(false);
    setCompleteMessage(null);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const alreadyHired =
      job.postulacion_contratada_id !== null &&
      job.postulacion_contratada_id !== undefined;

    try {
      setAppsLoading(true);

      const res = await fetch(APPLICATIONS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: job.id }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setAppsError(
          data.error ||
            data.message ||
            "No se pudieron cargar las postulaciones."
        );
        return;
      }

      const postulaciones = (data.postulaciones || []) as any[];

      let mapped: JobApplication[] = postulaciones.map((p) => ({
        id: p.postulacion_id,
        trabajo_id: job.id,
        estudiante_id: p.estudiante_id,
        carta_presentacion: p.carta_presentacion,
        estado: p.estado,
        creado_en: p.creado_en,
        estudiante_nombre: `${p.nombre} ${p.apellido}`,
        estudiante_foto_url: p.foto_perfil,
        estudiante_habilidades: p.habilidades,
        estudiante_carrera: p.carrera,
      }));

      if (alreadyHired && job.postulacion_contratada_id) {
        const hired = mapped.find(
          (m) => m.id === job.postulacion_contratada_id
        );
        if (hired) {
          mapped = [hired];
          setIsHiredView(true);
          // Si ya viene como completado del backend, habilitamos rating directo
          const estadoUpper = (hired.estado || "").toUpperCase();
          const isCompleted =
            estadoUpper === "COMPLETADA" ||
            estadoUpper === "COMPLETADO" ||
            estadoUpper === "FINALIZADA" ||
            estadoUpper === "FINALIZADO";
          setEmployerCompleted(isCompleted);
          fetchPublicProfile(hired.estudiante_id);
        }
      }

      setApplications(mapped);
      setCurrentAppIndex(0);
    } catch (err) {
      console.error(err);
      setAppsError("Error de conexión al cargar postulaciones.");
    } finally {
      setAppsLoading(false);
    }
  };

  const closeApplicationsModal = () => {
    setSelectedJob(null);
    setApplications([]);
    setAppsError(null);
    setAppsActionMsg(null);
    setCurrentAppIndex(0);
    setActionLoading(false);
    setPublicProfile(null);
    setProfileError(null);
    setProfileLoading(false);
    setIsHiredView(false);
    setRating(null);
    setRatingComment("");
    setRatingMessage(null);
    setRatingTags({
      responsable_puntual: false,
      calidad_trabajo: false,
      buena_comunicacion: false,
      buena_actitud: false,
      autonomo: false,
      no_se_presento: false,
      cancelo_ultima_hora: false,
      falta_respeto: false,
      no_termino_trabajo: false,
    });
    setRatingLoading(false);
    setEmployerCompleted(false);
    setCompleteLoading(false);
    setCompleteMessage(null);
  };

  const canGoPrev = currentAppIndex > 0;
  const canGoNext = currentAppIndex < applications.length - 1;

  const goPrev = () => {
    if (canGoPrev) {
      setAppsActionMsg(null);
      setCurrentAppIndex((i) => i - 1);
      setPublicProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  };

  const goNext = () => {
    if (canGoNext) {
      setAppsActionMsg(null);
      setCurrentAppIndex((i) => i + 1);
      setPublicProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  };

  // aceptar / rechazar
  const updateApplicationStateLocal = (id: number, newState: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, estado: newState } : app))
    );
    setAppsActionMsg(
      newState === "ACEPTADO"
        ? "Has aceptado a este postulante."
        : "Has rechazado a este postulante."
    );
  };

  const reviewCurrentApplication = async (accion: "aceptar" | "rechazar") => {
    if (!currentApp) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setActionLoading(true);
      setAppsActionMsg(null);

      const trabajoId = selectedJob?.id ?? currentApp.trabajo_id;

      const payload = {
        postulacion_id: currentApp.id,
        trabajo_id: trabajoId,
        accion,
      };

      const res = await fetch(REVIEW_APPLICATION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setAppsError(
          data.error ||
            data.message ||
            "No se pudo procesar la postulación. Intenta de nuevo."
        );
        return;
      }

      const newState = accion === "aceptar" ? "ACEPTADO" : "RECHAZADO";
      updateApplicationStateLocal(currentApp.id, newState);

      if (accion === "aceptar") {
        // pasar a modo contratado
        setIsHiredView(true);
        setApplications((prev) =>
          prev.filter((app) => app.id === currentApp.id)
        );
        setCurrentAppIndex(0);
        setSelectedJob((prev) =>
          prev
            ? { ...prev, postulacion_contratada_id: currentApp.id }
            : prev
        );
        fetchPublicProfile(currentApp.estudiante_id);

        // refrescar listado de jobs
        setJobs((prev) =>
          prev.map((job) =>
            job.id === trabajoId
              ? { ...job, postulacion_contratada_id: currentApp.id }
              : job
          )
        );
      }
    } catch (err) {
      console.error(err);
      setAppsError("Error de conexión. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptCurrent = () => reviewCurrentApplication("aceptar");
  const handleRejectCurrent = () => reviewCurrentApplication("rechazar");

  // 🔹 Empleador marca como completado (EmpleadorCompletarHandler)
  const handleEmployerComplete = async () => {
    if (!currentApp || !selectedJob) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setCompleteLoading(true);
      setCompleteMessage(null);

      const res = await fetch(EMPLOYER_COMPLETE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postulacion_id: currentApp.id,
          job_id: selectedJob.id, // 👈 coincide con completar.go
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setCompleteMessage(
          data.error ||
            data.message ||
            "No se pudo marcar como completado. Intenta de nuevo."
        );
        return;
      }

      setCompleteMessage(
        "Has marcado este CameYo como completado. Ahora puedes valorar al estudiante."
      );
      setEmployerCompleted(true);

      // Actualizar estado local a "completado"
      setApplications((prev) =>
        prev.map((a) =>
          a.id === currentApp.id ? { ...a, estado: "completado" } : a
        )
      );
      setSelectedJob((prev) =>
        prev ? { ...prev, estado: "completado" } : prev
      );
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? { ...j, estado: "completado" } : j
        )
      );
    } catch (err) {
      console.error(err);
      setCompleteMessage(
        "Error de conexión al marcar como completado. Intenta nuevamente."
      );
    } finally {
      setCompleteLoading(false);
    }
  };

  // ---- Enviar valoración al backend ----
  const handleSubmitRating = async () => {
    if (!currentApp || !selectedJob) return;

    if (rating === null) {
      setRatingMessage("Selecciona una calificación antes de enviar.");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const payload = {
      estudiante_valorado_id: currentApp.estudiante_id,
      job_id: selectedJob.id,
      rating,
      comentario: ratingComment.trim(),
      ...ratingTags,
    };

    try {
      setRatingLoading(true);
      setRatingMessage(null);

      const res = await fetch(RATE_STUDENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setRatingMessage(
          data.error ||
            data.message ||
            "No se pudo guardar la valoración. Intenta de nuevo."
        );
        return;
      }

      setRatingMessage(
        "Gracias por valorar al estudiante. Tu opinión ayuda a otros empleadores."
      );
    } catch (err) {
      console.error(err);
      setRatingMessage(
        "Error de conexión al enviar la valoración. Intenta nuevamente."
      );
    } finally {
      setRatingLoading(false);
    }
  };

  // -------- RENDER --------

  return (
    <div className="min-h-screen flex bg-slate-50">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-x-hidden">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              Mis CameYos publicados
            </h1>
            <p className="text-xs text-slate-500">
              Revisa tus publicaciones, postulaciones y estudiantes
              contratados.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/employer/jobs/new")}
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90"
          >
            Publicar nuevo CameYo
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando publicaciones...</p>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no tienes CameYos publicados.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Crea tu primer trabajo para que los estudiantes puedan postular.
            </p>
            <button
              onClick={() => navigate("/dashboard/employer/jobs/new")}
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90"
            >
              Publicar un CameYo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const salarioStr =
                (job.salario && job.salario.toString()) ??
                (job.pago_estimado != null
                  ? job.pago_estimado.toFixed(2)
                  : "");
              const salarioLabel =
                salarioStr && salarioStr.trim().length > 0
                  ? `$${salarioStr}`
                  : "A convenir";

              const estado =
                job.postulacion_contratada_id != null
                  ? "contratado"
                  : job.estado || "activo";

              const negociableText = job.negociable
                ? "Pago negociable"
                : "Pago fijo";

              return (
                <article
                  key={job.id}
                  className="rounded-2xl bg-white border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {job.titulo}
                      </h2>
                      {estado === "contratado" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          Estudiante contratado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-1 line-clamp-2">
                      {job.descripcion}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                        {job.categoria}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                        {job.ciudad || "Ciudad no especificada"}
                      </span>
                      {job.modalidad && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                          {job.modalidad}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                        {negociableText}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        Pago estimado
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {salarioLabel}
                      </p>
                    </div>
                    {job.fecha_creacion && (
                      <p className="text-[10px] text-slate-400">
                        Publicado: {formatDate(job.fecha_creacion)}
                      </p>
                    )}
                    <button
                      onClick={() => openApplicationsModal(job)}
                      className="mt-1 px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700"
                    >
                      {job.postulacion_contratada_id
                        ? "Ver estudiante contratado"
                        : "Ver postulaciones"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* MODAL POSTULACIONES / CONTRATADO */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeApplicationsModal}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-4xl w-[90%] max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lado izquierdo */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 px-6 py-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold mb-1">
                    {selectedJob.titulo}
                  </h2>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Categoría: {selectedJob.categoria}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Ubicación: {selectedJob.ciudad || "No especificada"}
                  </p>
                  {selectedJob.modalidad && (
                    <p className="text-[11px] text-slate-500 mb-1">
                      Modalidad: {selectedJob.modalidad}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Postulaciones: {applications.length}
                  </p>
                  {selectedJob.fecha_creacion && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Publicado el {formatDate(selectedJob.fecha_creacion)}
                    </p>
                  )}
                </div>

                {applications.length > 1 && !isHiredView && (
                  <div className="mt-4 flex items-center gap-2 text-[11px]">
                    <button
                      className="px-2.5 py-1 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                      disabled={!canGoPrev}
                      onClick={goPrev}
                    >
                      ← Anterior
                    </button>
                    <span className="text-slate-500">
                      {currentAppIndex + 1} de {applications.length}
                    </span>
                    <button
                      className="px-2.5 py-1 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                      disabled={!canGoNext}
                      onClick={goNext}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}

                <button
                  onClick={closeApplicationsModal}
                  className="mt-4 text-[11px] text-slate-500 hover:text-slate-700 self-start"
                >
                  Cerrar
                </button>
              </div>

              {/* Lado derecho */}
              <div className="flex-1 px-8 py-6 overflow-y-auto">
                {appsLoading ? (
                  <p className="text-xs text-slate-500">
                    Cargando postulaciones...
                  </p>
                ) : appsError ? (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                    {appsError}
                  </div>
                ) : !currentApp ? (
                  <div className="text-xs text-slate-600">
                    No hay información para este CameYo.
                  </div>
                ) : isHiredView ? (
                  <>
                    {/* Vista estudiante contratado */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-xs font-semibold text-slate-600">
                          {currentApp.estudiante_foto_url ? (
                            <img
                              src={currentApp.estudiante_foto_url}
                              alt={currentApp.estudiante_nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            currentApp.estudiante_nombre
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {currentApp.estudiante_nombre}
                          </p>
                          {currentApp.estudiante_carrera && (
                            <p className="text-[11px] text-slate-600">
                              {currentApp.estudiante_carrera}
                            </p>
                          )}
                          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            Estudiante contratado para este CameYo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos de contacto y perfil */}
                    <section className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <h3 className="text-xs font-semibold mb-2 text-slate-800">
                        Datos de contacto
                      </h3>
                      {profileLoading ? (
                        <p className="text-[11px] text-slate-500">
                          Cargando información...
                        </p>
                      ) : profileError ? (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                          {profileError}
                        </div>
                      ) : publicProfile ? (
                        <div className="space-y-1 text-[11px] text-slate-700">
                          <p>
                            <span className="font-medium">Nombre:</span>{" "}
                            {publicProfile.nombre} {publicProfile.apellido}
                          </p>
                          {publicProfile.titulo_perfil && (
                            <p>
                              <span className="font-medium">
                                Título de perfil:
                              </span>{" "}
                              {publicProfile.titulo_perfil}
                            </p>
                          )}
                          {publicProfile.universidad && (
                            <p>
                              <span className="font-medium">Universidad:</span>{" "}
                              {publicProfile.universidad}
                            </p>
                          )}
                          {publicProfile.carrera && (
                            <p>
                              <span className="font-medium">Carrera:</span>{" "}
                              {publicProfile.carrera}
                            </p>
                          )}
                          {publicProfile.ciudad && (
                            <p>
                              <span className="font-medium">Ciudad:</span>{" "}
                              {publicProfile.ciudad}
                            </p>
                          )}
                          {publicProfile.disponibilidad_de_tiempo && (
                            <p>
                              <span className="font-medium">
                                Disponibilidad:
                              </span>{" "}
                              {publicProfile.disponibilidad_de_tiempo}
                            </p>
                          )}
                          {publicProfile.whatsapp && (
                            <p>
                              <span className="font-medium">WhatsApp:</span>{" "}
                              {publicProfile.whatsapp}
                            </p>
                          )}
                          {publicProfile.email && (
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {publicProfile.email}
                            </p>
                          )}
                          {publicProfile.links && (
                            <div className="mt-1">
                              <p className="font-medium mb-1">Links:</p>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const raw = publicProfile.links;
                                  let linksArr: string[] = [];

                                  if (Array.isArray(raw)) {
                                    linksArr = raw;
                                  } else if (typeof raw === "string") {
                                    const cleaned = raw.replace(/[{}]/g, "");
                                    linksArr = cleaned
                                      .split(",")
                                      .map((l) => l.trim())
                                      .filter(Boolean);
                                  }

                                  return linksArr.map((link, idx) => {
                                    const href = link.startsWith("http")
                                      ? link
                                      : `https://${link}`;
                                    return (
                                      <a
                                        key={idx}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 rounded-full bg-white border border-emerald-200 hover:bg-emerald-100 text-[11px]"
                                      >
                                        {link}
                                      </a>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-600">
                          Para ver los datos completos de contacto, pulsa
                          “Actualizar perfil”. Se cargará la información
                          pública del estudiante.
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            fetchPublicProfile(currentApp.estudiante_id)
                          }
                          className="px-3 py-1 rounded-full border border-sky-500 text-[11px] text-sky-700 font-semibold hover:bg-sky-50"
                        >
                          Actualizar perfil
                        </button>
                      </div>
                    </section>

                    {/* Marcar como completado + mensaje */}
                    <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                      <h3 className="text-sm font-semibold mb-1">
                        Estado del CameYo
                      </h3>
                      {!employerCompleted ? (
                        <>
                          <p className="text-[11px] text-slate-600 mb-2">
                            Cuando el trabajo realmente haya terminado, marca
                            aquí como completado. Luego podrás dejar una
                            valoración sobre el estudiante.
                          </p>
                          {completeMessage && (
                            <div className="mb-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
                              {completeMessage}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleEmployerComplete}
                            disabled={completeLoading}
                            className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {completeLoading
                              ? "Marcando..."
                              : "Marcar como completado"}
                          </button>
                        </>
                      ) : (
                        <>
                          {completeMessage && (
                            <div className="mb-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                              {completeMessage}
                            </div>
                          )}
                          {!completeMessage && (
                            <p className="text-[11px] text-emerald-700 mb-1">
                              Ya marcaste este CameYo como completado.
                            </p>
                          )}
                        </>
                      )}
                    </section>

                    {/* Bloque de valoración (solo cuando employerCompleted === true) */}
                    {employerCompleted ? (
                      <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                        <h3 className="text-sm font-semibold mb-2">
                          Valorar al estudiante
                        </h3>

                        <p className="text-[11px] text-slate-600 mb-2">
                          Deja una valoración sobre cómo fue trabajar con este
                          estudiante. Esto ayuda a otros empleadores.
                        </p>

                        {/* Paso 1: rating global */}
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`w-7 h-7 rounded-full border text-xs font-semibold ${
                                rating !== null && rating >= star
                                  ? "bg-amber-400 border-amber-400 text-white"
                                  : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              {star}
                            </button>
                          ))}
                          <span className="text-[11px] text-slate-500 ml-2">
                            {rating
                              ? `Calificación: ${rating}/5`
                              : "Selecciona una calificación (5⭐ = lo volverías a contratar)"}
                          </span>
                        </div>

                        {/* Paso 2: tags rápidos */}
                        <div className="mb-3">
                          <p className="text-[11px] text-slate-600 mb-1">
                            Selecciona lo que mejor describe la experiencia:
                          </p>

                          {/* Positivos */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {[
                              {
                                key: "responsable_puntual",
                                label: "Responsable y puntual",
                              },
                              {
                                key: "calidad_trabajo",
                                label: "Buena calidad de trabajo",
                              },
                              {
                                key: "buena_comunicacion",
                                label: "Buen comunicador",
                              },
                              {
                                key: "buena_actitud",
                                label: "Buena actitud / profesional",
                              },
                              {
                                key: "autonomo",
                                label: "Autónomo, poca guía",
                              },
                            ].map((chip) => (
                              <button
                                key={chip.key}
                                type="button"
                                onClick={() =>
                                  toggleRatingTag(chip.key as RatingTagKey)
                                }
                                className={`px-3 py-1 rounded-full border text-[11px] ${
                                  ratingTags[chip.key as RatingTagKey]
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                    : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>

                          {/* Flags de alerta */}
                          <p className="text-[11px] text-slate-600 mb-1">
                            ¿Ocurrió algo de esto? Márcalo como alerta:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                key: "no_se_presento",
                                label: "No se presentó",
                              },
                              {
                                key: "cancelo_ultima_hora",
                                label: "Canceló a última hora",
                              },
                              {
                                key: "falta_respeto",
                                label: "Falta de respeto",
                              },
                              {
                                key: "no_termino_trabajo",
                                label: "No terminó el trabajo",
                              },
                            ].map((chip) => (
                              <button
                                key={chip.key}
                                type="button"
                                onClick={() =>
                                  toggleRatingTag(chip.key as RatingTagKey)
                                }
                                className={`px-3 py-1 rounded-full border text-[11px] ${
                                  ratingTags[chip.key as RatingTagKey]
                                    ? "bg-red-100 border-red-300 text-red-800"
                                    : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comentario opcional */}
                        <textarea
                          className="w-full rounded-2xl border border-slate-200 text-[11px] px-3 py-2 mb-2 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
                          rows={3}
                          placeholder="Comentario opcional sobre el desempeño del estudiante (máx. 200 caracteres)..."
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          maxLength={200}
                        />

                        {ratingMessage && (
                          <div className="mb-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
                            {ratingMessage}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSubmitRating}
                          disabled={ratingLoading}
                          className="px-4 py-1.5 rounded-full bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {ratingLoading ? "Guardando..." : "Guardar valoración"}
                        </button>
                      </section>
                    ) : (
                      <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                        <h3 className="text-sm font-semibold mb-2">
                          Valorar al estudiante
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          Podrás dejar una valoración cuando marques este CameYo
                          como completado. Así mantenemos el historial de
                          evaluaciones atado a trabajos realmente terminados.
                        </p>
                      </section>
                    )}

                    {currentApp.estudiante_habilidades && (
                      <section className="mb-4">
                        <h3 className="text-sm font-semibold mb-1">
                          Habilidades destacadas
                        </h3>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                          {currentApp.estudiante_habilidades
                            .split(/[,;]+/g)
                            .map((h) => h.trim())
                            .filter(Boolean)
                            .map((h, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full bg-slate-50 border border-slate-200"
                              >
                                {h}
                              </span>
                            ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  // -------- Vista normal antes de contratar --------
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-[11px] font-semibold text-slate-600">
                          {currentApp.estudiante_foto_url ? (
                            <img
                              src={currentApp.estudiante_foto_url}
                              alt={currentApp.estudiante_nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            currentApp.estudiante_nombre
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {currentApp.estudiante_nombre}
                          </p>
                          {currentApp.estudiante_carrera && (
                            <p className="text-[11px] text-slate-600">
                              {currentApp.estudiante_carrera}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Postuló el{" "}
                            {currentApp.creado_en
                              ? formatDate(currentApp.creado_en)
                              : "fecha no disponible"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {currentApp.carta_presentacion && (
                      <section className="mb-4">
                        <h3 className="text-sm font-semibold mb-1">
                          Carta de presentación
                        </h3>
                        <p className="text-[11px] text-slate-700 whitespace-pre-line">
                          {currentApp.carta_presentacion}
                        </p>
                      </section>
                    )}

                    {currentApp.estudiante_habilidades && (
                      <section className="mb-4">
                        <h3 className="text-sm font-semibold mb-1">
                          Habilidades destacadas
                        </h3>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                          {currentApp.estudiante_habilidades
                            .split(/[,;]+/g)
                            .map((h) => h.trim())
                            .filter(Boolean)
                            .map((h, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full bg-slate-50 border border-slate-200"
                              >
                                {h}
                              </span>
                            ))}
                        </div>
                      </section>
                    )}

                    {appsActionMsg && (
                      <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                        {appsActionMsg}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAcceptCurrent}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? "Procesando..." : "Aceptar postulante"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectCurrent}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Rechazar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployerPosts;
