// src/auth/EmployerCompanyDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext";

const EmployerCompanyDashboard: React.FC = () => {
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

  const companyName =
    extra.nombre_comercial || extra.razon_social || user?.name || "Tu empresa";
  const subtitle = extra.area_actividad_principal || "Empresa usuaria de CameYa";
  const bio =
    extra.descripcion_empresa ||
    extra.biografia ||
    "Este es tu panel como empresa. Aquí verás tus CameYos publicados y el desempeño de tus estudiantes.";
  const location = extra.ciudad || extra.ubicacion || "Guayaquil";

  const prefs: string[] = extra.preferencias_categorias
    ? (Array.isArray(extra.preferencias_categorias)
        ? extra.preferencias_categorias
        : String(extra.preferencias_categorias).split(/[,|\n]/)
      )
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : ["Eventos", "Retail", "Logística"];

  const website = extra.dominio_corporativo
    ? `https://${extra.dominio_corporativo}`
    : "";

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
            <p className="text-xs text-slate-500">Para empresas</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Inicio
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            Publicar nuevo CameYo
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
            CameYos activos
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-left">
            Perfil de empresa
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
        {/* Header empresa */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xl">
              {companyName
                .split(" ")
                .filter(Boolean)
                .map((p: string) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "EM"}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{companyName}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
              <p className="text-xs text-slate-400 mt-1">Ubicación: {location}</p>
            </div>
          </div>

          <button className="self-start md:self-auto px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90">
            Editar perfil
          </button>
        </section>

        {/* Métricas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">CameYos publicados</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Estudiantes contratados</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Valoración promedio</p>
            <p className="text-2xl font-semibold">4.9 ⭐</p>
          </div>
        </section>

        {/* Sobre empresa y prefs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-2">Sobre la empresa</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-2">
                Áreas de actividad
              </h2>
              <div className="flex flex-wrap gap-2">
                {prefs.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-2">
                Sitio web / enlaces
              </h2>
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm hover:underline break-all"
                >
                  {website}
                </a>
              ) : (
                <p className="text-xs text-slate-500">
                  Aquí aparecerá el sitio web de tu empresa cuando lo
                  configuremos.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployerCompanyDashboard;
