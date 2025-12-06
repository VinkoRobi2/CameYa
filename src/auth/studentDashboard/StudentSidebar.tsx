// src/auth/studentDashboard/StudentSidebar.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import svg_logo from "../../assets/CameYa.Black.SVG.svg";

interface StudentSidebarProps {
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Actualización de estilos para coincidir con el diseño "Descubrir" (degradado activo)
  const btnClasses = (active: boolean) =>
    [
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
      active
        ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium shadow-md" // Estilo activo visual
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
      {/* Botón flotante móvil */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <img src={svg_logo} alt="CameYa" className="h-6 w-auto" />
        <span>Menú estudiante</span>
      </button>

      {/* Overlay móvil */}
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
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <img src={svg_logo} alt="CameYa" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold">CameYa</p>
            <p className="text-xs text-slate-500">Para estudiantes</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          {/* 1. Inicio -> Descubrir */}
          <button
            onClick={() => handleNavigate("/dashboard/student")}
            className={btnClasses(isActive("/dashboard/student"))}
          >
            <span className="text-lg">🧭</span>
            <span>Descubrir</span>
          </button>

          {/* 2. Mis postulaciones -> Matches */}
          <button
            onClick={() => handleNavigate("/dashboard/student/applications")}
            className={btnClasses(
              isActive("/dashboard/student/applications")
            )}
          >
            <span className="text-lg">🔗</span>
            <span>Matches</span>
          </button>

          {/* 4. Mi perfil */}
          <button
            onClick={() => handleNavigate("/dashboard/student/profile")}
            className={btnClasses(isActive("/dashboard/student/profile"))}
          >
            <span className="text-lg">👤</span>
            <span>Mi perfil</span>
          </button>
        </nav>

        {/* Footer / Configuración */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
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

export default StudentSidebar;
