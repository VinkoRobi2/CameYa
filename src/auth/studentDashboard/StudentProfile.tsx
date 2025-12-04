// src/auth/studentDashboard/StudentProfile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";
import StudentProfileHeader from "./StudentProfileHeader";

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

        // Actualiza auth_user en localStorage con los nuevos datos
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

  // Nombre a mostrar
  const displayName =
    (data.nombre || data.apellido
      ? `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim()
      : "") ||
    user?.name ||
    "Estudiante CameYa";

  // Subtítulo: carrera + universidad si existen
  let subtitle = "";
  if (data.carrera && data.universidad) {
    subtitle = `${data.carrera} en ${data.universidad}`;
  } else if (data.carrera) {
    subtitle = data.carrera;
  } else if (data.universidad) {
    subtitle = String(data.universidad);
  } else {
    subtitle = "Estudiante universitario CameYa";
  }

  // Bio
  const bio =
    data.biografia ||
    data.bibiografia ||
    "Aquí irá tu biografía completa. En cuanto se vaya enriqueciendo tu perfil, se mostrará aquí.";

  // Disponibilidad
  const availability =
    data.disponibilidad_de_tiempo ||
    data.disponibilidad ||
    "Solo fines de semana";

  // Habilidades (text[] o string)
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

  // Links (string o array)
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

  // Iniciales y foto de perfil
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const photoUrl: string | null =
    (typeof data.foto_perfil === "string" && data.foto_perfil.length > 0
      ? data.foto_perfil
      : null) || null;

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

        {/* Header de perfil con imagen si viene en el response */}
        <StudentProfileHeader
          initials={initials}
          displayName={displayName}
          subtitle={subtitle}
          photoUrl={photoUrl}
        />

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

        {/* Sobre mí + disponibilidad + datos básicos */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-2">Sobre mí</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{bio}</p>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {data.ciudad && (
                <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                  📍 {data.ciudad}
                </span>
              )}
              {data.universidad && (
                <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                  🎓 {data.universidad}
                </span>
              )}
              {data.carrera && (
                <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                  📚 {data.carrera}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-2">Disponibilidad</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                {availability}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Esta información se muestra a los empleadores para que sepan
              cuándo puedes trabajar.
            </p>
          </div>
        </section>

        {/* Habilidades + links */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-3">Habilidades</h2>
            <div className="flex flex-wrap gap-2 mb-1">
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
