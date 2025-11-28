// src/auth/studentDashboard/StudentCompletedJobs.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

interface CompletedJob {
  postulacion_id: number;
  trabajo_id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fecha_creacion: string;
  fecha_trabajo: string;
}

const COMPLETED_JOBS_ENDPOINT = `${API_BASE_URL}/protected/trabajos-completados`;

const StudentCompletedJobs: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchCompleted = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(COMPLETED_JOBS_ENDPOINT, {
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
            data.error ||
              data.message ||
              "No se pudieron cargar tus trabajos completados."
          );
          return;
        }

        const list = (data.trabajos_completados || []) as CompletedJob[];
        setJobs(list);
      } catch (err) {
        console.error(err);
        setError(
          "Error de conexión al cargar tus trabajos completados. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompleted();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto relative">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Trabajos completados</h1>
          <p className="text-sm text-slate-600">
            Aquí verás los CameYos que fueron marcados como completados tanto
            por ti como por el empleador.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando trabajos...</p>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no tienes trabajos completados.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Cuando un CameYo se marque como completado por ambas partes,
              aparecerá aquí como parte de tu historial.
            </p>
            <button
              onClick={() => navigate("/dashboard/student")}
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90"
            >
              Ver trabajos disponibles
            </button>
          </div>
        ) : (
          <section className="space-y-3">
            {jobs.map((job) => {
              const salarioLabel =
                job.precio && job.precio > 0
                  ? `$${job.precio.toFixed(2)}`
                  : "A convenir";

              return (
                <article
                  key={job.postulacion_id}
                  className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {job.titulo || "Trabajo sin título"}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-sky-50 text-sky-700 border-sky-200">
                        Trabajo completado
                      </span>
                    </div>
                    {job.descripcion && (
                      <p className="text-[11px] text-slate-600 mb-1 line-clamp-2">
                        {job.descripcion}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Te postulaste el {formatDate(job.fecha_creacion)} ·
                      Trabajo publicado el {formatDate(job.fecha_trabajo)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-[160px]">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        Pago estimado
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {salarioLabel}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      ID trabajo: {job.trabajo_id}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentCompletedJobs;
