import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface StudentSidebarProps {
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const btnClasses = (active: boolean) =>
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
    // Wrapper para controlar ancho en layout padre
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
        <span>Menú estudiante</span>
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
          "md:static md:translate-x-0", // en desktop siempre visible
        ].join(" ")}
      >
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
          <button
            onClick={() => handleNavigate("/dashboard/student")}
            className={btnClasses(isActive("/dashboard/student"))}
          >
            Inicio
          </button>

          <button
            onClick={() => handleNavigate("/dashboard/student/applications")}
            className={btnClasses(
              isActive("/dashboard/student/applications")
            )}
          >
            Mis postulaciones
          </button>

          <button
            onClick={() => handleNavigate("/dashboard/student/completed")}
            className={btnClasses(
              isActive("/dashboard/student/completed")
            )}
          >
            Trabajos completados
          </button>

          <button
            onClick={() => handleNavigate("/dashboard/student/profile")}
            className={btnClasses(
              isActive("/dashboard/student/profile")
            )}
          >
            Mi perfil
          </button>
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
          <button className={btnClasses(false)}>Configuración</button>
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

export default StudentSidebar;
