// src/auth/studentDashboard/StudentDashboardHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

interface EmpleadorPublico {
  id: number;
  nombre: string;
  apellido: string;
  empresa: string;
  ciudad: string;
  sector_laboral: string[];
  frase_corta: string;
  foto_perfil: string;
  whatsapp: string;
  tipo_identidad: string;
}

interface ApiResponse {
  page: number;
  limit: number;
  empleadores: EmpleadorPublico[];
}

// 🔁 Ajusta esta ruta si tu handler está montado con otro path
const EMPLOYERS_ENDPOINT = `${API_BASE_URL}/protected/perfiles-publicos-empleadores`;

const StudentDashboardHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [empleadores, setEmpleadores] = useState<EmpleadorPublico[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchEmpleadores = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${EMPLOYERS_ENDPOINT}?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: ApiResponse = await res.json().catch(() => ({} as any));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data as any).error ||
              (data as any).message ||
              "No se pudieron cargar los empleadores."
          );
          return;
        }

        setEmpleadores(data.empleadores || []);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleadores();
  }, [page, limit, logout, navigate]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Buscar trabajos</h1>
          <p className="text-sm text-slate-600">
            Explora empleadores y CameYos potenciales para ti.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando oportunidades...</p>
        ) : empleadores.length === 0 ? (
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
              {empleadores.map((emp) => {
                const isCompany =
                  emp.tipo_identidad &&
                  emp.tipo_identidad.toLowerCase() === "empresa";

                const displayName = isCompany
                  ? emp.empresa || `${emp.nombre} ${emp.apellido}`.trim()
                  : `${emp.nombre} ${emp.apellido}`.trim() || "Empleador CameYa";

                const subtitle = isCompany
                  ? "Empresa usuaria de CameYa"
                  : "Empleador individual";

                const initials =
                  (displayName || "CY")
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "CY";

                const sectores =
                  emp.sector_laboral && emp.sector_laboral.length > 0
                    ? emp.sector_laboral.map((s) => s.trim()).filter(Boolean)
                    : [];

                return (
                  <article
                    key={emp.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">
                          {displayName}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {subtitle} · {emp.ciudad || "Ciudad no especificada"}
                        </p>
                      </div>
                    </div>

                    {emp.frase_corta && (
                      <p className="text-xs text-slate-600">
                        {emp.frase_corta}
                      </p>
                    )}

                    {sectores.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sectores.map((sec) => (
                          <span
                            key={sec}
                            className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-medium"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Solo detalles del post, sin medios de contacto */}
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50">
                        Ver detalles
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Controles de paginación simples */}
            <div className="flex justify-between items-center text-xs text-slate-600">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Página anterior
              </button>
              <span>Página {page}</span>
              <button
                onClick={nextPage}
                className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
              >
                Siguiente página →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboardHome;
