import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import EmployerSidebar from "./EmployerSidebar";

interface Job {
  id: number;
  categoria: string;
  titulo: string;
  pago_estimado: number;
  negociable: boolean;
  ubicacion: string;
  descripcion: string;
  requisitos?: string;
  habilidades?: string;
  estado?: string;
  creado_en?: string;
  creadoEn?: string;
  created_at?: string;
}

// TODO: si tu backend usa otra ruta, cámbiala aquí:
const JOBS_ENDPOINT = `${API_BASE_URL}/protected/trabajos_creados`;

const EmployerPosts: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leemos tipo_identidad para saber si es persona o empresa
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

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const formatDate = (job: Job) => {
    const raw =
      job.creado_en || job.creadoEn || job.created_at || (job as any).creado;
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
              const pago = Number(job.pago_estimado ?? 0);
              const estado = job.estado || "activo";
              const negociableText = job.negociable
                ? "Pago negociable"
                : "Pago fijo";

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
                      Ubicación: <span className="font-medium">{job.ubicacion}</span>
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
                      <p className="text-xs text-slate-500">Pago estimado</p>
                      <p className="text-base font-semibold">
                        ${pago.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {negociableText}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Publicado: {formatDate(job)}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50">
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
      </main>
    </div>
  );
};

export default EmployerPosts;
