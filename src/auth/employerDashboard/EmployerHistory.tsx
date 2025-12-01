// src/auth/employerDashboard/EmployerHistory.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployerSidebar from "./EmployerSidebar";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";

interface TrabajoCompletado {
  trabajo_id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  pago_estimado: number;
  postulacion_id: number;
  estudiante_id: number;
  nombre_estudiante: string;
  apellido_estudiante: string;
  fecha_postulacion: string;
  fecha_completado: string;
  fecha_trabajo: string;
}

const EmployerHistory: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // persona / empresa para sidebar → misma lógica que EmployerPosts
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

  const [trabajos, setTrabajos] = useState<TrabajoCompletado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-EC", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  useEffect(() => {
    const fetchTrabajos = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/protected/trabajos-completados-emp`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({} as any));

        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            (data && (data.error as string)) ||
              (data && (data.message as string)) ||
              "Error al cargar el historial de CameYos."
          );
        }

        const trabajosCompletados: TrabajoCompletado[] =
          data.trabajos_completados || [];

        setTrabajos(trabajosCompletados);
      } catch (err: any) {
        setError(
          err?.message ||
            "Ocurrió un error al cargar el historial de CameYos."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrabajos();
  }, [logout, navigate]);

  // Ahora usamos pago_estimado del backend
  const totalGastado = trabajos.reduce(
    (acc, t) => acc + (t.pago_estimado || 0),
    0
  );

  // Para “Realizado el …” usamos fecha_trabajo, y si no viene, fecha_completado o fecha_postulacion
  const getFechaTrabajo = (t: TrabajoCompletado) =>
    t.fecha_trabajo || t.fecha_completado || t.fecha_postulacion;

  const ultimoTrabajo =
    trabajos.length > 0 ? trabajos[0] : undefined; // asumiendo orden DESC desde el backend

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar empleador */}
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      {/* Contenido principal */}
      <main className="flex-1 md:ml-0">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Encabezado */}
          <header className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Historial de CameYos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Revisa los CameYos que ya fueron completados con éxito por tus
              estudiantes.
            </p>
          </header>

          {/* Estados de carga / error */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-slate-500">
                Cargando tu historial de CameYos...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && trabajos.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                Aún no tienes CameYos completados.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cuando un trabajo sea marcado como completado por ti y por el
                estudiante, aparecerá aquí.
              </p>
            </div>
          )}

          {/* Contenido cuando sí hay trabajos */}
          {!loading && !error && trabajos.length > 0 && (
            <>
              {/* Resumen */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    CameYos completados
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {trabajos.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Total gastado
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(totalGastado)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Último CameYo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {ultimoTrabajo ? ultimoTrabajo.titulo : "-"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ultimoTrabajo
                      ? `Realizado el ${formatDate(
                          getFechaTrabajo(ultimoTrabajo)
                        )}`
                      : ""}
                  </p>
                </div>
              </section>

              {/* Lista de trabajos */}
              <section className="space-y-4">
                {trabajos.map((trabajo) => (
                  <article
                    key={trabajo.postulacion_id}
                    className="rounded-2xl bg-white border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <h2 className="text-sm md:text-base font-semibold text-slate-900">
                          {trabajo.titulo}
                        </h2>
                        <p className="mt-1 text-xs md:text-sm text-slate-500 line-clamp-2">
                          {trabajo.descripcion}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {trabajo.categoria} · {trabajo.ubicacion}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Estudiante:{" "}
                          <span className="font-medium text-slate-700">
                            {trabajo.nombre_estudiante}{" "}
                            {trabajo.apellido_estudiante}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-1 text-xs">
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                          Trabajo #{trabajo.trabajo_id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Fecha del trabajo:{" "}
                          <span className="font-medium text-slate-700">
                            {formatDate(getFechaTrabajo(trabajo))}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        Publicado el{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(trabajo.fecha_postulacion)}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        Pago final:{" "}
                        <span className="text-primary">
                          {formatCurrency(trabajo.pago_estimado || 0)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerHistory;
