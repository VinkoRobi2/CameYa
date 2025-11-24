import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";
import EmployerSidebar from "./EmployerSidebar";

interface PublicStudent {
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

interface ApiResponse {
  page: number;
  limit: number;
  data: PublicStudent[];
  count: number;
}

const STUDENTS_ENDPOINT = `${API_BASE_URL}/protected/perfiles-publicos-estudiantes`;

const EmployerStudentsHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leemos tipo_identidad para saber cómo mostrar el sidebar
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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${STUDENTS_ENDPOINT}?page=${page}&limit=${limit}`,
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
            (data as any).err ||
              (data as any).error ||
              "No se pudieron cargar los estudiantes."
          );
          return;
        }

        setStudents(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, limit, logout, navigate]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Buscar estudiantes</h1>
          <p className="text-sm text-slate-600">
            Explora perfiles públicos de estudiantes para tus CameYos.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando perfiles...</p>
        ) : students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no hay estudiantes con perfil público completo.
            </p>
            <p className="text-xs text-slate-500">
              Cuando los estudiantes completen su perfil, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {students.map((st, idx) => {
                const fullName = `${st.nombre ?? ""} ${
                  st.apellido ?? ""
                }`.trim() || "Estudiante CameYa";

                const subtitleParts: string[] = [];
                if (st.titulo_perfil) subtitleParts.push(st.titulo_perfil);
                if (st.carrera && st.universidad) {
                  subtitleParts.push(`${st.carrera} en ${st.universidad}`);
                }
                const subtitle =
                  subtitleParts.join(" · ") || "Estudiante universitario";

                const initials =
                  fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "ST";

                const sectores =
                  st.sectores_preferencias && st.sectores_preferencias.length > 0
                    ? st.sectores_preferencias
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                    : [];

                const habilidades =
                  st.habilidades_basicas && st.habilidades_basicas.length > 0
                    ? st.habilidades_basicas
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                    : [];

                const disponibilidad =
                  st.disponibilidad_de_tiempo || "No especificado";

                return (
                  <article
                    key={`${fullName}-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">{fullName}</h2>
                        <p className="text-xs text-slate-500">
                          {subtitle}
                          {st.ciudad && ` · ${st.ciudad}`}
                        </p>
                      </div>
                    </div>

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

                    {habilidades.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {habilidades.map((hab) => (
                          <span
                            key={hab}
                            className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium"
                          >
                            {hab}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500">
                      Disponibilidad:{" "}
                      <span className="font-medium">{disponibilidad}</span>
                    </p>

                    {/* Solo detalles, sin datos de contacto directo */}
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50">
                        Ver detalles
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

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

export default EmployerStudentsHome;
