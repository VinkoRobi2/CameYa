// src/auth/employerDashboard/EmployerSidebar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import svg_logo from "../../assets/CameYa.Black.SVG.svg";

interface Props {
  mode: "person" | "company";
  onLogout: () => void;
}

const EmployerSidebar: React.FC<Props> = ({ mode, onLogout }) => {
  const subtitle = mode === "company" ? "Para empresas" : "Para empleadores";
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const baseDashboardPath =
    mode === "company"
      ? "/dashboard/employer/company"
      : "/dashboard/employer/person";

  const isActive = (path: string) => location.pathname === path;

  // Lógica de estilos actualizada para replicar el diseño de la imagen
  const buttonClasses = (active: boolean) =>
    [
      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200",
      active
        ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium shadow-md" // Estilo activo tipo "Discover"
        : "text-slate-600 hover:bg-slate-50 font-normal",
    ].join(" ");

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative w-0 md:w-64 md:flex-shrink-0 md:h-screen md:min-h-screen">
      {/* Botón flotante para abrir menú en móvil */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <img src={svg_logo} alt="CameYa" className="h-6 w-auto" />
        <span>Menú</span>
      </button>

      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:h-screen md:min-h-screen",
        ].join(" ")}
      >
        {/* Header (Conservado igual) */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <img src={svg_logo} alt="CameYa" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold">CameYa</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          {/* 1. Descubrir (Dashboard Home) */}
          <button
            onClick={() => handleNavigate(baseDashboardPath)}
            className={buttonClasses(isActive(baseDashboardPath))}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🧭</span>
              <span>Descubrir</span>
            </div>
          </button>

          {/* 2. Matches */}
          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/posts`)}
            className={buttonClasses(isActive(`${baseDashboardPath}/posts`))}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🔗</span>
              <span>Matches</span>
            </div>
            {/* Badge de notificaciones (Rojo si no está activo, blanco si está activo) */}
            <span
              className={`flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                isActive(`${baseDashboardPath}/matches`)
                  ? "bg-white text-purple-600"
                  : "bg-red-500 text-white"
              }`}
            >
              3
            </span>
          </button>

          {/* 3. Postear trabajo */}
          <button
            onClick={() => handleNavigate("/dashboard/employer/jobs/new")}
            className={buttonClasses(
              isActive("/dashboard/employer/jobs/new")
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📝</span>
              <span>Postear trabajo</span>
            </div>
          </button>

          {/* 4. Perfil */}
          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/profile`)}
            className={buttonClasses(isActive(`${baseDashboardPath}/profile`))}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <span>Perfil</span>
            </div>
          </button>
        </nav>

        {/* Footer / Configuración */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/settings`)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left"
          >
            <span className="text-lg">⚙️</span>
            <span>Configuración</span>
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-left"
          >
            <span className="text-lg">🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default EmployerSidebar;
