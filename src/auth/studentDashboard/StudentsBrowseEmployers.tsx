// src/auth/studentDashboard/StudentsBrowseEmployers.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

const BROWSE_EMPLOYERS_ENDPOINT = `${API_BASE_URL}/protected/browse/empleadores`;

interface JobActivoBackend {
  id: number;
  titulo: string;
  descripcion: string;
  pago_estimado: string;
  foto: string;
}

interface EmpleadorBackend {
  empleador_id: number;
  nombre: string;
  apellido: string;
  empresa: string;
  biografia: string;
  ciudad: string;
  foto_perfil: string;
  promedio_rating: number;
  total_reviews: number;
  trabajos_activos: JobActivoBackend[];
}

interface JobActivo extends JobActivoBackend {
  foto_url?: string;
}

interface Empleador extends EmpleadorBackend {
  foto_perfil_url?: string;
  trabajos_activos: JobActivo[];
}

// Normaliza URLs tipo "http://.../uploads/http://.../uploads/img.png"
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

const StudentsBrowseEmployers: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [empleadores, setEmpleadores] = useState<Empleador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmployer, setSelectedEmployer] = useState<Empleador | null>(
    null
  );

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

    const fetchEmployers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(BROWSE_EMPLOYERS_ENDPOINT, {
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
              "No se pudieron cargar los empleadores por ahora."
          );
          return;
        }

        const rawList = (data.empleadores || []) as EmpleadorBackend[];

        const normalized: Empleador[] = rawList.map((emp) => ({
          ...emp,
          foto_perfil_url: normalizeFotoUrl(emp.foto_perfil),
          trabajos_activos: (emp.trabajos_activos || []).map((j) => ({
            ...j,
            foto_url: normalizeFotoUrl(j.foto),
          })),
        }));

        setEmpleadores(normalized);
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar los empleadores.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, [logout, navigate]);

  const openDetails = (emp: Empleador) => setSelectedEmployer(emp);
  const closeDetails = () => setSelectedEmployer(null);

  const formatRating = (rating: number) =>
    rating && rating > 0 ? rating.toFixed(1) : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto flex flex-col items-center">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4 w-full max-w-5xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Browse Employers
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explora empleadores, conoce sus perfiles y los CameYos que
              ofrecen.
            </p>
          </div>
        </header>

        {/* Estado de carga / error */}
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando empleadores...</p>
        ) : empleadores.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no hay empleadores para explorar.
            </p>
            <p className="text-xs text-slate-500">
              Cuando se registren empleadores y publiquen CameYos, podrás verlos
              aquí.
            </p>
          </div>
        ) : (
          <section className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 w-full max-w-5xl">
            {empleadores.map((emp) => {
              const nombreCompleto = [emp.nombre, emp.apellido]
                .filter(Boolean)
                .join(" ");

              const hasJobs = emp.trabajos_activos && emp.trabajos_activos.length > 0;
              const jobsCount = emp.trabajos_activos.length;

              return (
                <article
                  key={emp.empleador_id}
                  onClick={() => openDetails(emp)}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col cursor-pointer transition hover:shadow-md hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    {emp.foto_perfil_url ? (
                      <img
                        src={emp.foto_perfil_url}
                        alt={nombreCompleto || "Empleador CameYa"}
                        className="h-11 w-11 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {nombreCompleto
                          ? nombreCompleto.charAt(0).toUpperCase()
                          : "E"}
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {nombreCompleto || "Empleador CameYa"}
                      </p>
                      {emp.empresa && (
                        <p className="text-[11px] text-slate-500">
                          {emp.empresa}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                    {/* Bio corta o placeholder */}
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {emp.biografia ||
                        "Este empleador aún no ha añadido una biografía detallada."}
                    </p>

                    {/* Chips: rating, trabajos activos, ciudad */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        ⭐ {formatRating(emp.promedio_rating)}{" "}
                        {emp.total_reviews > 0 && (
                          <span className="ml-1 text-[10px] text-amber-600/80">
                            ({emp.total_reviews} reviews)
                          </span>
                        )}
                      </span>

                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        🧳{" "}
                        {hasJobs
                          ? `${jobsCount} trabajo${jobsCount === 1 ? "" : "s"} activo${jobsCount === 1 ? "" : "s"}`
                          : "Sin trabajos activos"}
                      </span>

                      {emp.ciudad && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          📍 {emp.ciudad}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Modal de perfil expandido */}
        {selectedEmployer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeDetails}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-[94%] max-h-[84vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {selectedEmployer.foto_perfil_url ? (
                    <img
                      src={selectedEmployer.foto_perfil_url}
                      alt="Empleador"
                      className="h-11 w-11 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {[selectedEmployer.nombre, selectedEmployer.apellido]
                        .filter(Boolean)
                        .join(" ")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {[selectedEmployer.nombre, selectedEmployer.apellido]
                        .filter(Boolean)
                        .join(" ") || "Empleador CameYa"}
                    </p>
                    {selectedEmployer.empresa && (
                      <p className="text-[11px] text-slate-500">
                        {selectedEmployer.empresa}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                        ⭐ {formatRating(selectedEmployer.promedio_rating)}{" "}
                        {selectedEmployer.total_reviews > 0 && (
                          <span className="ml-1 text-amber-600/80">
                            ({selectedEmployer.total_reviews} reviews)
                          </span>
                        )}
                      </span>
                      {selectedEmployer.ciudad && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                          📍 {selectedEmployer.ciudad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Cerrar
                </button>
              </div>

              {/* Contenido scrollable */}
              <div className="px-6 py-5 flex-1 overflow-y-auto">
                {/* Bio */}
                <section className="mb-6">
                  <h2 className="text-xs font-semibold text-slate-700 mb-1">
                    Sobre este empleador
                  </h2>
                  <p className="text-xs text-slate-600 whitespace-pre-line">
                    {selectedEmployer.biografia ||
                      "Este empleador aún no ha agregado una biografía detallada."}
                  </p>
                </section>

                {/* Trabajos activos */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-700">
                      Trabajos activos publicados
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {selectedEmployer.trabajos_activos.length} CameYo
                      {selectedEmployer.trabajos_activos.length === 1 ? "" : "s"}{" "}
                      disponible{selectedEmployer.trabajos_activos.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {selectedEmployer.trabajos_activos.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      En este momento este empleador no tiene CameYos activos.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedEmployer.trabajos_activos.map((job) => (
                        <article
                          key={job.id}
                          className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 flex gap-3"
                        >
                          {job.foto_url ? (
                            <img
                              src={job.foto_url}
                              alt={job.titulo || "CameYo"}
                              className="hidden sm:block h-16 w-16 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="hidden sm:flex h-16 w-16 rounded-xl bg-gradient-to-br from-fuchsia-100 via-pink-50 to-purple-100 items-center justify-center text-xl">
                              💼
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {job.titulo || "CameYo sin título"}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {job.descripcion ||
                                "Este CameYo aún no tiene una descripción detallada."}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                              {job.pago_estimado && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                  💰 {job.pago_estimado}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Cerrar
                </button>
                {/* Placeholder para futuro: ir a chat / ver perfil público, etc. */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:brightness-105"
                >
                  Ver CameYos de este empleador
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentsBrowseEmployers;
