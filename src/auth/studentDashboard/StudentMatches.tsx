// src/auth/studentDashboard/StudentMatches.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

const MATCHES_ENDPOINT = `${API_BASE_URL}/protected/matches/aceptados/estudiantes`;

interface StudentMatch {
  id?: number;

  // 👇 AÑADIMOS match_id
  match_id?: number;

  // Trabajo
  job_id?: number;
  job_titulo?: string;
  trabajo_titulo?: string;
  titulo?: string;
  job_descripcion?: string;
  descripcion?: string;

  // Empleador
  empleador_id?: number;
  empleador_nombre?: string;
  nombre?: string;
  apellido?: string;
  empresa?: string;
  empleador_empresa?: string;

  // Imagen / ciudad
  foto_empleador?: string;
  foto_perfil?: string;
  foto_job?: string;
  job_foto?: string;
  ciudad?: string;

  [key: string]: any;
}

const StudentMatches: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<StudentMatch[]>([]);
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
              "No se pudieron cargar tus matches como estudiante."
          );
          return;
        }

        const listRaw =
          (Array.isArray(data.matches) && data.matches) ||
          (Array.isArray(data.data) && data.data) ||
          (Array.isArray(data) && data) ||
          [];

        setMatches(listRaw as StudentMatch[]);
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
      ? "Aún no tienes matches con empleadores."
      : totalMatches === 1
      ? "1 match"
      : `${totalMatches} matches`;

  const getJobTitle = (m: StudentMatch) =>
    m.job_titulo || m.trabajo_titulo || m.titulo || "CameYo sin título";

  const getEmployerName = (m: StudentMatch) => {
    const fromField = m.empleador_nombre?.trim() || "";
    const fromNombreApellido = `${m.nombre ?? ""} ${m.apellido ?? ""}`
      .trim()
      .replace(/\s+/g, " ");
    const finalName =
      fromField || fromNombreApellido || "Empleador CameYa";
    return finalName;
  };

  const getCompany = (m: StudentMatch) =>
    m.empresa || m.empleador_empresa || "";

  const getDescription = (m: StudentMatch) =>
    m.job_descripcion || m.descripcion || "";

  const getImage = (m: StudentMatch) =>
    m.foto_empleador || m.foto_perfil || m.foto_job || m.job_foto || "";

  const openChat = (match: StudentMatch) => {
    if (!match.empleador_id) return;

    const jobTitle = getJobTitle(match);
    const employerName = getEmployerName(match);
    const avatar = getImage(match);

    // 👇 Normalizamos el id de match
    const matchId = match.match_id ?? match.id;

    navigate(`/dashboard/student/chat/${match.empleador_id}`, {
      state: {
        empleadorId: match.empleador_id,
        jobId: match.job_id,
        jobTitle,
        employerName,
        avatar,
        // pasamos el match también aquí
        matchId,
        match_id: matchId,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header tipo "Tus Matches" igual que en EmployerMatches */}
          <header className="mb-8 flex items-center justify_between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Tus Matches
              </h1>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              {totalMatches === 0 && (
                <p className="text-[11px] text-slate-500 mt-2 max-w-xl">
                  Cuando tú y un empleador tengan interés mutuo en un CameYo,
                  aparecerá aquí para que puedan continuar el proceso y luego
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
                Sigue swpeando CameYos en la pantalla principal. Cuando haya
                interés mutuo con un empleador, lo verás aquí y podrás escribirle
                por chat.
              </p>
            </div>
          ) : (
            <section className="space-y-4">
              {matches.map((match, idx) => {
                const jobTitle = getJobTitle(match);
                const employerName = getEmployerName(match);
                const company = getCompany(match);
                const description = getDescription(match);
                const imgSrc = getImage(match);

                return (
                  <article
                    key={match.id ?? `${match.job_id}-${match.empleador_id}-${idx}`}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Izquierda: avatar + info principal */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden bg-slate-200">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={employerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600">
                              {employerName
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
                          {employerName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {jobTitle}
                        </p>
                        {(company || match.ciudad) && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {company && <span>{company}</span>}
                            {company && match.ciudad && " • "}
                            {match.ciudad && <span>{match.ciudad}</span>}
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
                        onClick={() => openChat(match)}
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

export default StudentMatches;
