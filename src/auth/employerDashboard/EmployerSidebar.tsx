// src/auth/employerDashboard/EmployerSidebar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  const buttonClasses = (active: boolean) =>
    [
      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left",
      active
        ? "bg-primary/10 text-primary font-medium"
        : "text-slate-600 hover:bg-slate-50",
    ].join(" ");

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false); // cerrar menú en móvil al navegar
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    // Wrapper para integrarse bien en el layout padre
    <div className="relative w-0 md:w-64 md:flex-shrink-0">
      {/* Botón flotante para abrir menú en móvil */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <span className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
          CY
        </span>
        <span>Menú empleador</span>
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
          "md:static md:translate-x-0", // siempre visible en desktop
        ].join(" ")}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            CY
          </div>
          <div>
            <p className="text-sm font-semibold">CameYa</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {/* Inicio */}
          <button
            onClick={() => handleNavigate(baseDashboardPath)}
            className={buttonClasses(isActive(baseDashboardPath))}
          >
            Inicio
          </button>

          {/* Publicar nuevo CameYo */}
          <button
            onClick={() => handleNavigate("/dashboard/employer/jobs/new")}
            className={buttonClasses(
              isActive("/dashboard/employer/jobs/new")
            )}
          >
            Publicar nuevo CameYo
          </button>

          {/* Rutas placeholder para el futuro */}
          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/posts`)}
            className={buttonClasses(isActive(`${baseDashboardPath}/posts`))}
          >
            Mis publicaciones
          </button>

          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/history`)}
            className={buttonClasses(isActive(`${baseDashboardPath}/history`))}
          >
            Historial de CameYos
          </button>

          <button
            onClick={() => handleNavigate(`${baseDashboardPath}/profile`)}
            className={buttonClasses(isActive(`${baseDashboardPath}/profile`))}
          >
            Mi perfil
          </button>
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
          <button
            onClick={() =>
              handleNavigate(`${baseDashboardPath}/settings`)
            }
            className={buttonClasses(
              isActive(`${baseDashboardPath}/settings`)
            )}
          >
            Configuración
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </div>
  );
};

export default EmployerSidebar;
