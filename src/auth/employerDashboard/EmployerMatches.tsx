// src/auth/employerDashboard/EmployerMatches.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import EmployerSidebar from "./EmployerSidebar";

const MATCHES_ENDPOINT = `${API_BASE_URL}/protected/matches/aceptados`;

interface EmployerMatch {
  // puede que el backend no envíe id explícito
  id?: number;

  // 👇 AÑADIMOS EL match_id QUE VIENE DEL BACK
  match_id?: number;

  job_id?: number;
  job_titulo?: string;
  job_descripcion?: string;

  // info de estudiante
  estudiante_id?: number;
  estudiante_nombre?: string; // por si backend usa este nombre
  nombre?: string;
  apellido?: string;
  carrera?: string;
  estudiante_carrera?: string;
  universidad?: string;
  estudiante_universidad?: string;

  // imágenes
  foto_job?: string;
  job_foto?: string;
  foto_perfil?: string;
  estudiante_foto_perfil?: string;

  // otros campos que puedan venir
  [key: string]: any;
}

const EmployerMatches: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<EmployerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(MATCHES_ENDPOINT, {
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
              "No se pudieron cargar tus matches como empleador."
          );
          return;
        }

        // el backend devuelve { matches: [...] }
        const listRaw =
          (Array.isArray(data.matches) && data.matches) ||
          (Array.isArray(data.data) && data.data) ||
          (Array.isArray(data) && data) ||
          [];

        setMatches(listRaw as EmployerMatch[]);
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar tus matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [logout, navigate]);

  const totalMatches = matches.length;
  const subtitle =
    totalMatches === 0
      ? "Aún no tienes matches con estudiantes."
      : totalMatches === 1
      ? "1 match"
      : `${totalMatches} matches`;

  const getJobTitle = (m: EmployerMatch) =>
    m.job_titulo || m.trabajo_titulo || m.titulo || "CameYo sin título";

  const getStudentName = (m: EmployerMatch) => {
    const fromEstudianteNombre = m.estudiante_nombre?.trim() || "";
    const fromNombreApellido = `${m.nombre ?? ""} ${m.apellido ?? ""}`
      .trim()
      .replace(/\s+/g, " ");
    const finalName =
      fromEstudianteNombre || fromNombreApellido || "Estudiante CameYa";
    return finalName;
  };

  const getCareer = (m: EmployerMatch) =>
    m.estudiante_carrera || m.carrera || "";

  const getUniversity = (m: EmployerMatch) =>
    m.estudiante_universidad || m.universidad || "";

  const getDescription = (m: EmployerMatch) =>
    m.job_descripcion || m.descripcion || "";

  const getImage = (m: EmployerMatch) =>
    m.foto_job ||
    m.job_foto ||
    m.foto_perfil ||
    m.estudiante_foto_perfil ||
    "";

  return (
    <div className="min-h-screen flex bg-slate-50">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header estilo "Your Matches" */}
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Tus Matches
              </h1>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              {totalMatches === 0 && (
                <p className="text-[11px] text-slate-500 mt-2 max-w-xl">
                  Cuando tú y un estudiante tengan interés mutuo en un CameYo,
                  aparecerá aquí para que puedas continuar el proceso y luego
                  chatear desde CameYa.
                </p>
              )}
            </div>
          </header>

          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-600">Cargando matches...</p>
          ) : totalMatches === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-700 mb-1">
                Aún no tienes matches.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Publica un CameYo y comienza a swpear estudiantes desde la
                sección correspondiente. Cuando haya interés mutuo, los verás
                aquí.
              </p>
              <button
                onClick={() => navigate("/dashboard/employer/jobs/new")}
                className="inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90"
              >
                Publicar nuevo CameYo
              </button>
            </div>
          ) : (
            <section className="space-y-4">
              {matches.map((match, idx) => {
                const jobTitle = getJobTitle(match);
                const studentName = getStudentName(match);
                const career = getCareer(match);
                const university = getUniversity(match);
                const description = getDescription(match);
                const imgSrc = getImage(match);

                // 👇 Normalizamos el ID del match
                const matchId = match.match_id ?? match.id;

                return (
                  <article
                    key={match.id ?? `${match.job_id}-${match.estudiante_id}-${idx}`}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Izquierda: avatar + info principal */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden bg-slate-200">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={studentName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600">
                              {studentName
                                .split(" ")
                                .filter(Boolean)
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {jobTitle}
                        </p>
                        {(career || university) && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {career && <span>{career}</span>}
                            {career && university && " • "}
                            {university && <span>{university}</span>}
                          </p>
                        )}
                        {description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Derecha: botón Enviar mensaje */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-primary/80 px-3.5 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/5 active:scale-[0.98] transition"
                        onClick={() => {
                          if (!match.estudiante_id) return;
                          navigate(
                            `/dashboard/employer/chat/${match.estudiante_id}`,
                            {
                              state: {
                                estudianteId: match.estudiante_id,
                                jobId: match.job_id,
                                jobTitle,
                                studentName,
                                avatar: imgSrc,
                                // 👇 Pasamos el ID de match en ambos formatos
                                matchId,
                                match_id: matchId,
                              },
                            }
                          );
                        }}
                      >
                        <span className="text-xs">💬</span>
                        <span>Enviar mensaje</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerMatches;
