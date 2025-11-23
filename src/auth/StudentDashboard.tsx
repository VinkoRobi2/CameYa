// src/auth/StudentDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext";

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const storedUserStr = localStorage.getItem("auth_user");
  let extra: any = {};
  if (storedUserStr) {
    try {
      extra = JSON.parse(storedUserStr);
    } catch {
      extra = {};
    }
  }

  const displayName = extra.nombre || user?.name || "Estudiante CameYa";
  const subtitle =
    (extra.carrera && extra.universidad &&
      `${extra.carrera} en ${extra.universidad}`) ||
    "Estudiante universitario";
  const bio =
    extra.biografia ||
    "Aquí irá tu biografía cuando conectemos el backend. Por ahora es solo un ejemplo.";
  const availability =
    extra.disponibilidad_de_tiempo || "Solo fines de semana";
  const skills: string[] = extra.habilidades_basicas
    ? String(extra.habilidades_basicas)
        .split(/[,|\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : ["Atención al cliente", "Eventos", "Excel básico", "Trabajo en equipo"];

  const linksRaw = extra.links;
  const links: string[] = Array.isArray(linksRaw)
    ? linksRaw
    : linksRaw
    ? String(linksRaw)
        .split(/[,|\n]/)
        .map((s: string) => s.trim())
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            CY
          </div>
          <div>
            <p className="text-sm font-semibold">CameYa</p>
            <p className="text-xs text-slate-500">Para estudiantes</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Inicio
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Mis postulaciones
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Trabajos completados
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-left">
            Mi perfil
          </button>
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Configuración
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {/* Perfil header */}
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

        {/* Métricas simples */}
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
              Perfil verificado
            </p>
          </div>
        </section>

        {/* Sobre mí, habilidades, disponibilidad, links */}
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

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-3">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
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

export default StudentDashboard;
