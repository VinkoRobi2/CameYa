// src/auth/studentDashboard/StudentMatches.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

// ⚠️ Ajusta esta ruta si tu backend expone otra para este handler
// GetMatchesEstudianteHandler
const MATCHES_ENDPOINT = `${API_BASE_URL}/protected/matches/aceptados/estudiantes`;

interface MatchBackend {
  empleador_id: number;
  empleador_nombre: string;
  empleador_apellido: string;
  empleador_foto_perfil: string;

  job_id: number;
  job_titulo: string;
  job_descripcion: string;
  job_habilidades_requeridas: string;
  job_pago_estimado: number;
  job_tipo: string;
  job_horario: string;
}

interface Match extends MatchBackend {
  empleador_foto_perfil_url?: string;
}

// Normaliza URLs raras tipo "http://.../uploads/http://.../uploads/img.png"
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

const parseToList = (text: string | undefined) => {
  if (!text) return [];
  return text
    .split(/[\n•\-;,+]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
};

const StudentMatches: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
              "No se pudieron cargar tus matches por ahora."
          );
          return;
        }

        const rawMatches: MatchBackend[] = (data.matches || []) as MatchBackend[];

        const normalized: Match[] = rawMatches.map((m) => ({
          ...m,
          empleador_foto_perfil_url: normalizeFotoUrl(m.empleador_foto_perfil),
        }));

        setMatches(normalized);
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar tus matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [logout, navigate]);

  const openDetails = (m: Match) => setSelectedMatch(m);
  const closeDetails = () => setSelectedMatch(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-8 pt-24 pb-24 overflow-y-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Tus matches
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Aquí ves los empleadores con los que hiciste match en CameYa.
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
          <p className="text-sm text-slate-600">Cargando matches...</p>
        ) : matches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no tienes matches.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Cuando un empleador muestre interés en ti y tú también marques
              interés en su CameYo, aparecerá aquí para que puedan avanzar al
              chat y coordinar detalles.
            </p>
            <button
              onClick={() => navigate("/dashboard/student")}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold px-4 py-2 hover:bg-slate-800"
            >
              Seguir buscando CameYos
            </button>
          </div>
        ) : (
          <section className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => {
              const nombreCompleto = [m.empleador_nombre, m.empleador_apellido]
                .filter(Boolean)
                .join(" ");

              const habilidades = parseToList(m.job_habilidades_requeridas);

              return (
                <article
                  key={`${m.empleador_id}-${m.job_id}`}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden"
                >
                  {/* Header del card */}
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    {m.empleador_foto_perfil_url ? (
                      <img
                        src={m.empleador_foto_perfil_url}
                        alt={nombreCompleto || "Empleador CameYa"}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {nombreCompleto
                          ? nombreCompleto.charAt(0).toUpperCase()
                          : "E"}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {nombreCompleto || "Empleador CameYa"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Match confirmado
                      </p>
                    </div>
                  </div>

                  {/* Info del trabajo */}
                  <div className="px-4 pb-4 flex-1 flex flex-col gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {m.job_titulo || "CameYo sin título"}
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">
                        {m.job_descripcion ||
                          "Este empleador aún no agregó una descripción detallada del CameYo."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {typeof m.job_pago_estimado === "number" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          💰 ${m.job_pago_estimado}
                        </span>
                      )}
                      {m.job_tipo && (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
                          🕒 {m.job_tipo}
                        </span>
                      )}
                      {m.job_horario && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          ⏰ {m.job_horario}
                        </span>
                      )}
                    </div>

                    {habilidades.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] text-slate-500 mb-1">
                          Habilidades que valora:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {habilidades.slice(0, 5).map((h, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
                            >
                              {h}
                            </span>
                          ))}
                          {habilidades.length > 5 && (
                            <span className="text-[11px] text-slate-400">
                              +{habilidades.length - 5} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(m)}
                        className="text-[11px] text-slate-500 hover:text-slate-800"
                      >
                        Ver detalles del CameYo
                      </button>

                      {/* Botón placeholder para futuro chat */}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:brightness-105"
                      >
                        Ir al chat
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Modal de detalles del match */}
        {selectedMatch && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeDetails}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-[92%] max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {selectedMatch.empleador_foto_perfil_url ? (
                    <img
                      src={selectedMatch.empleador_foto_perfil_url}
                      alt="Empleador"
                      className="h-10 w-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {[selectedMatch.empleador_nombre, selectedMatch.empleador_apellido]
                        .filter(Boolean)
                        .join(" ")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {[selectedMatch.empleador_nombre, selectedMatch.empleador_apellido]
                        .filter(Boolean)
                        .join(" ") || "Empleador CameYa"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Match en CameYa
                    </p>
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

              <div className="px-6 py-5 flex-1 overflow-y-auto">
                <h2 className="text-base font-semibold text-slate-900 mb-1">
                  {selectedMatch.job_titulo || "CameYo sin título"}
                </h2>

                <div className="flex flex-wrap gap-2 text-[11px] mb-3">
                  {typeof selectedMatch.job_pago_estimado === "number" && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      💰 ${selectedMatch.job_pago_estimado}
                    </span>
                  )}
                  {selectedMatch.job_tipo && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
                      🕒 {selectedMatch.job_tipo}
                    </span>
                  )}
                  {selectedMatch.job_horario && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      ⏰ {selectedMatch.job_horario}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Descripción del CameYo
                  </p>
                  <p className="text-xs text-slate-600 whitespace-pre-line">
                    {selectedMatch.job_descripcion ||
                      "Este empleador aún no agregó una descripción detallada del CameYo."}
                  </p>
                </div>

                {parseToList(selectedMatch.job_habilidades_requeridas).length >
                  0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Habilidades que valora
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {parseToList(
                        selectedMatch.job_habilidades_requeridas
                      ).map((h, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 mt-2">
                  En futuras versiones podrás iniciar el chat directamente
                  desde aquí, coordinar horarios y dejar registro de la
                  conversación. Por ahora, usa el canal que CameYa habilite
                  para comunicarte con el empleador.
                </p>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Cerrar
                </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:brightness-105"
                    onClick={() => {
                      if (!selectedMatch) return;
                      const employerName = [selectedMatch.empleador_nombre, selectedMatch.empleador_apellido]
                        .filter(Boolean)
                        .join(" ");
                      navigate(`/dashboard/student/chat/${selectedMatch.empleador_id}`, {
                        state: {
                          empleadorId: selectedMatch.empleador_id,
                          jobId: selectedMatch.job_id,
                          jobTitle: selectedMatch.job_titulo,
                          employerName,
                          avatar: selectedMatch.empleador_foto_perfil_url,
                        },
                      });
                    }}
                  >
                    Ir al chat
                  </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentMatches;
