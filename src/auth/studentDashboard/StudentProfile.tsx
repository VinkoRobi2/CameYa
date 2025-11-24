// src/auth/studentDashboard/StudentProfile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

const StudentProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedUserStr =
    typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;

  let localExtra: any = {};
  if (storedUserStr) {
    try {
      localExtra = JSON.parse(storedUserStr);
    } catch {
      localExtra = {};
    }
  }

  const cleanItem = (raw: string): string =>
    raw.replace(/^[{\s"]+/, "").replace(/[}"\s]+$/, "");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/protected/perfil-privado-estudiante`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data && (data.message as string)) ||
              "No se pudo cargar tu perfil."
          );
          return;
        }

        setProfile(data);

        try {
          const prevStr = localStorage.getItem("auth_user");
          const prev = prevStr ? JSON.parse(prevStr) : {};
          localStorage.setItem(
            "auth_user",
            JSON.stringify({ ...prev, ...data })
          );
        } catch {
          // ignore
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  const data = profile || localExtra || {};

  const displayName =
    (data.nombre || data.apellido
      ? `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim()
      : "") ||
    user?.name ||
    "Estudiante CameYa";

  const subtitleParts: string[] = [];
  if (data.titulo_perfil) subtitleParts.push(data.titulo_perfil);
  if (data.carrera && data.universidad) {
    subtitleParts.push(`${data.carrera} en ${data.universidad}`);
  }
  const subtitle =
    subtitleParts.join(" · ") || "Estudiante universitario CameYa";

  const bio =
    data.biografia ||
    data.bibiografia ||
    "Aquí irá tu biografía completa. En cuanto se vaya enriqueciendo tu perfil, se mostrará aquí.";

  const availability =
    data.disponibilidad_de_tiempo ||
    data.disponibilidad ||
    "Solo fines de semana";

  const habilidadesRaw = data.habilidades_basicas ?? data.habilidades ?? [];
  const habilidadesList: string[] = Array.isArray(habilidadesRaw)
    ? habilidadesRaw
        .flatMap((item: any) =>
          String(item)
            .split(/[,|\n]/)
            .map((s) => cleanItem(s))
        )
        .filter((s: string) => s.length > 0)
    : String(habilidadesRaw)
        .split(/[,|\n]/)
        .map((s: string) => cleanItem(s))
        .filter((s: string) => s.length > 0);

  const sectoresRaw =
    data.sectores_preferencias ?? data.sector_preferencias ?? [];
  const sectoresList: string[] = Array.isArray(sectoresRaw)
    ? sectoresRaw
        .flatMap((item: any) =>
          String(item)
            .split(/[,|\n]/)
            .map((s) => cleanItem(s))
        )
        .filter((s: string) => s.length > 0)
    : [];

  const linksRaw = data.links;
  const links: string[] = Array.isArray(linksRaw)
    ? linksRaw
        .map((l: any) => cleanItem(String(l)))
        .filter((s: string) => s.length > 0)
    : linksRaw
    ? String(linksRaw)
        .split(/[,|\n]/)
        .map((s: string) => cleanItem(s))
        .filter((s: string) => s.length > 0)
    : [];

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-600">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Header de perfil */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xl">
              {initials || "ST"}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
              <p className="text-xs text-slate-400 mt-1">
                Esta es la info que verán los empleadores cuando revisen tu
                perfil.
              </p>
            </div>
          </div>

          <button className="self-start md:self-auto px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90">
            Editar perfil
          </button>
        </section>

        {/* Métricas placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Valoración general</p>
            <p className="text-2xl font-semibold">4.8 ⭐</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Trabajos completados</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Estado</p>
            <p className="text-sm font-medium text-emerald-600">
              {data.email_verificado
                ? "Perfil verificado"
                : "Pendiente de verificación"}
            </p>
          </div>
        </section>

        {/* Sobre mí + disponibilidad */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-2">Sobre mí</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-2">Disponibilidad</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                {availability}
              </span>
            </div>
          </div>
        </section>

        {/* Habilidades + sectores + links */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-3">Habilidades</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {habilidadesList.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {habilidadesList.length === 0 && (
                <p className="text-xs text-slate-500">
                  Aquí aparecerán tus habilidades básicas.
                </p>
              )}
            </div>

            {sectoresList.length > 0 && (
              <>
                <h3 className="text-xs font-semibold mb-2">
                  Sectores preferidos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sectoresList.map((sec) => (
                    <span
                      key={sec}
                      className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-3">
              Enlaces profesionales
            </h2>
            <div className="space-y-1 text-sm">
              {links.length === 0 && (
                <p className="text-slate-500 text-xs">
                  Aquí aparecerán tus enlaces (LinkedIn, portafolio, GitHub,
                  etc.).
                </p>
              )}
              {links.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-primary hover:underline break-all"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;
