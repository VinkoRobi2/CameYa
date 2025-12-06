// src/auth/employerDashboard/EmployerPosts.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import EmployerSidebar from "./EmployerSidebar";

const MATCHES_ENDPOINT = `${API_BASE_URL}/protected/matches/aceptados`;

interface EmployerMatch {
  // puede que el backend no envíe id explícito
  id?: number;

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

const EmployerPosts: React.FC = () => {
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

  const getIdChip = (_label: string, value?: number) =>
    value != null ? `#${value}` : "N/D";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 py-8 overflow-y-auto">
        {/* Header estilo "Your Matches" */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Tus Matches
            </h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            {totalMatches === 0 && (
              <p className="text-[11px] text-slate-500 mt-2">
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no tienes matches.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Publica un CameYo y comienza a swpear estudiantes desde la sección
              correspondiente. Cuando haya interés mutuo, los verás aquí.
            </p>
            <button
              onClick={() => navigate("/dashboard/employer/jobs/new")}
              className="inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90"
            >
              Publicar nuevo CameYo
            </button>
          </div>
        ) : (
          <section className="grid gap-6 md:gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, idx) => {
              const jobTitle = getJobTitle(match);
              const studentName = getStudentName(match);
              const career = getCareer(match);
              const university = getUniversity(match);
              const description = getDescription(match);
              const imgSrc = getImage(match);

              return (
                <article
                  key={match.id ?? `${match.job_id}-${match.estudiante_id}-${idx}`}
                  className="bg-white rounded-[26px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_24px_60px_rgba(15,23,42,0.16)] transition-shadow duration-200"
                >
                  {/* Imagen (estudiante) */}
                  <div className="relative h-40 md:h-44 w-full overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center text-white text-lg font-semibold">
                        {studentName
                          .split(" ")
                          .filter(Boolean)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}

                    {/* Badge Match */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-white/90 backdrop-blur text-[11px] font-medium text-slate-700 shadow-sm">
                        <span className="mr-1 text-[13px]">✨</span> Match
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="px-4 pt-4 pb-3 flex-1 flex flex-col">
                    <div className="space-y-1.5">
                      <h2 className="text-sm md:text-base font-semibold text-slate-900">
                        {jobTitle}
                      </h2>
                      <p className="text-[11px] text-slate-600">
                        Match con{" "}
                        <span className="font-semibold">{studentName}</span>
                      </p>
                      {(career || university) && (
                        <p className="text-[11px] text-slate-500">
                          {career && <span>{career}</span>}
                          {career && university && " • "}
                          {university && <span>{university}</span>}
                        </p>
                      )}
                      {description && (
                        <p className="mt-2 text-[11px] text-slate-500 line-clamp-3">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* Chips */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1">
                        <span>📄</span>
                        <span>Job ID {getIdChip("Job", match.job_id)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1">
                        <span>🎓</span>
                        <span>
                          Estudiante ID {getIdChip("Est", match.estudiante_id)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Botón "Send Message" estilo barra inferior */}
                  <button
                    type="button"
                    className="mt-2 w-full rounded-t-none rounded-b-[26px] bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white text-[12px] font-medium py-2.5 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
                    // TODO: cuando tengas chat, aquí puedes navegar al chat con el estudiante / match
                    onClick={() => {
                      console.log(
                        "Open chat for match",
                        match.job_id,
                        match.estudiante_id
                      );
                    }}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      💬
                    </span>
                    <span>Send Message</span>
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default EmployerPosts;
