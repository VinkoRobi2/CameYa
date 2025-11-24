// src/auth/employerDashboard/EmployerSidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface Props {
  mode: "person" | "company";
  onLogout: () => void;
}

const EmployerSidebar: React.FC<Props> = ({ mode, onLogout }) => {
  const subtitle = mode === "company" ? "Para empresas" : "Para empleadores";
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
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
          onClick={() => navigate(baseDashboardPath)}
          className={buttonClasses(isActive(baseDashboardPath))}
        >
          Inicio
        </button>

        {/* Publicar nuevo CameYo */}
        <button
          onClick={() => navigate("/dashboard/employer/jobs/new")}
          className={buttonClasses(
            isActive("/dashboard/employer/jobs/new")
          )}
        >
          Publicar nuevo CameYo
        </button>

        {/* Rutas placeholder para el futuro */}
        <button
          onClick={() => navigate(`${baseDashboardPath}/posts`)}
          className={buttonClasses(isActive(`${baseDashboardPath}/posts`))}
        >
          Mis publicaciones
        </button>

        <button
          onClick={() => navigate(`${baseDashboardPath}/history`)}
          className={buttonClasses(isActive(`${baseDashboardPath}/history`))}
        >
          Historial de CameYos
        </button>

        <button
          onClick={() => navigate(`${baseDashboardPath}/profile`)}
          className={buttonClasses(isActive(`${baseDashboardPath}/profile`))}
        >
          Mi perfil
        </button>
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
        <button
          onClick={() => navigate(`${baseDashboardPath}/settings`)}
          className={buttonClasses(isActive(`${baseDashboardPath}/settings`))}
        >
          Configuración
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-left"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default EmployerSidebar;
