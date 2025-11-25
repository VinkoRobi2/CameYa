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
  salario: string; // viene como "50.00"
  negociable: boolean;
  ciudad: string;
  modalidad: string;
  fecha_creacion?: string;
  estado?: string;
  postulacion_contratada_id?: number | null;

  // por compatibilidad si en algún otro endpoint usas estos nombres
  pago_estimado?: number;
  ubicacion?: string;
  creado_en?: string;
  creadoEn?: string;
  created_at?: string;
}

// Postulación devuelta por el backend
interface JobApplication {
  id: number; // postulacion_id
  trabajo_id: number;
  estudiante_id: number;
  carta_presentacion: string;
  estado: string;
  creado_en?: string;

  estudiante_nombre: string;
  estudiante_foto_url?: string;
  estudiante_habilidades?: string;
  estudiante_carrera?: string;
}

// Perfil público del estudiante (respuesta de /perfil-publico/:id)
interface PublicStudentProfile {
  nombre: string;
  apellido: string;
  titulo_perfil: string;
  sectores_preferencias: string[];
  ciudad: string;
  carrera: string;
  universidad: string;
  habilidades_basicas: string[];
  foto_perfil: string;
  whatsapp: string;
  disponibilidad_de_tiempo: string;
}

// Rutas backend
const JOBS_ENDPOINT = `${API_BASE_URL}/protected/trabajos_creados`;
const APPLICATIONS_ENDPOINT = `${API_BASE_URL}/protected/empleador/trabajo/postulaciones`;
const ACCEPT_APPLICATION_ENDPOINT = (id: number) =>
  `${API_BASE_URL}/protected/empleador/postulacion/${id}/aceptar`;
const REJECT_APPLICATION_ENDPOINT = (id: number) =>
  `${API_BASE_URL}/protected/empleador/postulacion/${id}/rechazar`;
const PUBLIC_PROFILE_ENDPOINT = (id: number) =>
  `${API_BASE_URL}/protected/perfil-publico/${id}`;

const EmployerPosts: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de postulaciones
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [appsActionMsg, setAppsActionMsg] = useState<string | null>(null);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Perfil público del estudiante
  const [publicProfile, setPublicProfile] =
    useState<PublicStudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Leemos tipo_identidad para el sidebar (persona / empresa)
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

  // Cargar trabajos publicados
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

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data && (data.error as string)) ||
              (data && (data.message as string)) ||
              "No se pudieron cargar tus publicaciones."
          );
          return;
        }

        const rawJobs = Array.isArray(data)
          ? data
          : Array.isArray((data as any).jobs)
          ? (data as any).jobs
          : [];

        setJobs(rawJobs as Job[]);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [logout, navigate]);

  const formatDate = (job: Job) => {
    const raw =
      job.fecha_creacion ||
      job.creado_en ||
      job.creadoEn ||
      job.created_at ||
      (job as any).creado;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-EC", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------- VER POSTULACIONES (abrir modal + fetch) ----------

  const openApplicationsModal = async (job: Job) => {
    setSelectedJob(job);
    setApplications([]);
    setAppsError(null);
    setAppsActionMsg(null);
    setCurrentAppIndex(0);
    setPublicProfile(null);
    setProfileError(null);
    setProfileLoading(false);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

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

      const mapped: JobApplication[] = postulaciones.map((p) => ({
        id: p.postulacion_id,
        trabajo_id: data.trabajo_id,
        estudiante_id: p.estudiante_id,
        carta_presentacion: p.carta_presentacion,
        estado: p.estado,
        creado_en: p.creado_en,
        estudiante_nombre: `${p.nombre} ${p.apellido}`,
        estudiante_foto_url: p.foto_perfil,
        estudiante_habilidades: p.habilidades,
        estudiante_carrera: p.carrera,
      }));

      setApplications(mapped);
      setCurrentAppIndex(0);
    } catch (err) {
      console.error(err);
      setAppsError("Error de conexión. Intenta nuevamente.");
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
  };

  const currentApp =
    applications.length > 0 ? applications[currentAppIndex] : null;

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

  // ---------- ACCIONES: ACEPTAR / RECHAZAR / VER PERFIL ----------

  const updateApplicationStateLocal = (id: number, newState: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, estado: newState } : app
      )
    );
    setAppsActionMsg(
      newState === "ACEPTADO"
        ? "Has aceptado a este postulante."
        : "Has rechazado a este postulante."
    );
  };

  const handleAcceptCurrent = async () => {
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

      const res = await fetch(ACCEPT_APPLICATION_ENDPOINT(currentApp.id), {
        method: "POST",
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
        setAppsError(
          data.error ||
            data.message ||
            "No se pudo aceptar al postulante. Intenta de nuevo."
        );
        return;
      }

      updateApplicationStateLocal(currentApp.id, "ACEPTADO");
    } catch (err) {
      console.error(err);
      setAppsError("Error de conexión. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCurrent = async () => {
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

      const res = await fetch(REJECT_APPLICATION_ENDPOINT(currentApp.id), {
        method: "POST",
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
        setAppsError(
          data.error ||
            data.message ||
            "No se pudo rechazar al postulante. Intenta de nuevo."
        );
        return;
      }

      updateApplicationStateLocal(currentApp.id, "RECHAZADO");
    } catch (err) {
      console.error(err);
      setAppsError("Error de conexión. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔍 Ver perfil público del estudiante
  const handleViewPublicProfile = async () => {
    if (!currentApp) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);

      const res = await fetch(
        PUBLIC_PROFILE_ENDPOINT(currentApp.estudiante_id),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      // El backend responde { data: p }
      setPublicProfile(data.data as PublicStudentProfile);
    } catch (err) {
      console.error(err);
      setProfileError("Error de conexión al cargar el perfil.");
      setPublicProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Mis publicaciones</h1>
            <p className="text-sm text-slate-600">
              Aquí ves todos los CameYos que has publicado como empleador.
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
              // usamos salario del backend; si algún endpoint viejo manda pago_estimado, lo usamos como fallback
              const salarioStr =
                (job.salario && job.salario.toString()) ??
                (job.pago_estimado != null
                  ? job.pago_estimado.toFixed(2)
                  : "");
              const salarioLabel =
                salarioStr && salarioStr.trim().length > 0
                  ? `$${salarioStr}`
                  : "A convenir";

              const estado = job.estado || "activo";
              const negociableText = job.negociable
                ? "Pago negociable"
                : "Pago fijo";

              const location =
                job.ciudad || job.ubicacion || "Ubicación no especificada";

              return (
                <article
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-medium">
                        {job.categoria}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {estado === "activo" ? "Activo" : estado}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold mb-1">
                      {job.titulo}
                    </h2>

                    <p className="text-xs text-slate-600 mb-2">
                      {job.descripcion}
                    </p>

                    <p className="text-[11px] text-slate-500 mb-1">
                      Ubicación:{" "}
                      <span className="font-medium">{location}</span>
                    </p>

                    {job.requisitos && (
                      <p className="text-[11px] text-slate-500 mb-1">
                        Requisitos: {job.requisitos}
                      </p>
                    )}

                    {job.habilidades && (
                      <p className="text-[11px] text-slate-500">
                        Habilidades: {job.habilidades}
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-44 flex flex-col items-start md:items-end gap-2 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Salario</p>
                      <p className="text-base font-semibold">
                        {salarioLabel}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {negociableText}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Publicado: {formatDate(job)}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                        onClick={() => openApplicationsModal(job)}
                      >
                        Ver postulaciones
                      </button>
                      <button className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50">
                        Editar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* MODAL DE POSTULACIONES */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeApplicationsModal}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-4xl w-[90%] max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* LADO IZQUIERDO: info del trabajo + navegación */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 px-6 py-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold mb-1">
                    {selectedJob.titulo}
                  </h2>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Categoria: {selectedJob.categoria}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Ubicación: {selectedJob.ciudad || selectedJob.ubicacion}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Publicado: {formatDate(selectedJob)}
                  </p>

                  <p className="text-[11px] text-slate-500 mb-1">
                    Postulaciones recibidas:{" "}
                      <span className="font-semibold">
                        {applications.length}
                      </span>
                  </p>
                </div>

                {applications.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600">
                    <button
                      className="px-3 py-1 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                      disabled={!canGoPrev}
                      onClick={goPrev}
                    >
                      ← Anterior
                    </button>
                    <span>
                      {currentAppIndex + 1} de {applications.length}
                    </span>
                    <button
                      className="px-3 py-1 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
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

              {/* LADO DERECHO: detalle del postulante + perfil público */}
              <div className="flex-1 px-8 py-6 overflow-y-auto">
                {appsLoading ? (
                  <p className="text-xs text-slate-600">
                    Cargando postulaciones...
                  </p>
                ) : appsError ? (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                    {appsError}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-xs text-slate-600">
                    Aún no hay estudiantes postulando a este CameYo.
                  </div>
                ) : currentApp ? (
                  <>
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
                          <p className="text-sm font-semibold">
                            {currentApp.estudiante_nombre}
                          </p>
                          {currentApp.estudiante_carrera && (
                            <p className="text-[11px] text-slate-500">
                              {currentApp.estudiante_carrera}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500">
                            Postulación #{currentApp.id} ·{" "}
                            {currentApp.estado}
                          </p>
                        </div>
                      </div>
                    </div>

                    <section className="mb-4">
                      <h3 className="text-sm font-semibold mb-1">
                        Carta de presentación
                      </h3>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {currentApp.carta_presentacion}
                      </p>
                    </section>

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
                                className="px-3 py-1 rounded-full bg-slate-100"
                              >
                                {h}
                              </span>
                            ))}
                        </div>
                      </section>
                    )}

                    {/* Mensajes de acción aceptar/rechazar */}
                    {appsActionMsg && (
                      <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                        {appsActionMsg}
                      </div>
                    )}

                    {/* Bloque de perfil público */}
                    <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">
                          Perfil público del estudiante
                        </h3>
                        <button
                          className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleViewPublicProfile}
                          disabled={profileLoading || actionLoading}
                        >
                          {profileLoading
                            ? "Cargando perfil..."
                            : "Ver perfil público"}
                        </button>
                      </div>

                      {profileError && (
                        <div className="mb-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                          {profileError}
                        </div>
                      )}

                      {publicProfile && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-700 space-y-1">
                          <p className="font-semibold text-slate-800">
                            {publicProfile.nombre} {publicProfile.apellido}
                          </p>
                          {publicProfile.titulo_perfil && (
                            <p>{publicProfile.titulo_perfil}</p>
                          )}
                          <p>
                            <span className="font-medium">Universidad:</span>{" "}
                            {publicProfile.universidad}
                          </p>
                          <p>
                            <span className="font-medium">Carrera:</span>{" "}
                            {publicProfile.carrera}
                          </p>
                          <p>
                            <span className="font-medium">Ciudad:</span>{" "}
                            {publicProfile.ciudad}
                          </p>
                          <p>
                            <span className="font-medium">Disponibilidad:</span>{" "}
                            {publicProfile.disponibilidad_de_tiempo}
                          </p>
                          <p>
                            <span className="font-medium">WhatsApp:</span>{" "}
                            {publicProfile.whatsapp}
                          </p>

                          {publicProfile.sectores_preferencias &&
                            publicProfile.sectores_preferencias.length > 0 && (
                              <div className="mt-1">
                                <p className="font-medium mb-1">
                                  Sectores de preferencia:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {publicProfile.sectores_preferencias.map(
                                    (s, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-white border border-slate-200"
                                      >
                                        {s}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {publicProfile.habilidades_basicas &&
                            publicProfile.habilidades_basicas.length > 0 && (
                              <div className="mt-1">
                                <p className="font-medium mb-1">
                                  Habilidades básicas:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {publicProfile.habilidades_basicas.map(
                                    (h, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-white border border-slate-200"
                                      >
                                        {h}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </section>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <button
                        className="px-3 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleRejectCurrent}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Procesando..." : "Rechazar"}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAcceptCurrent}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Procesando..." : "Aceptar"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployerPosts;
