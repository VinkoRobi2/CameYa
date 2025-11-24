// src/auth/studentDashboard/StudentSidebar.tsx
import React from "react";

interface StudentSidebarProps {
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
  return (
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
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-left">
          Inicio
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
          Mis postulaciones
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
          Trabajos completados
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
          Mi perfil
        </button>
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-slate-200 text-sm space-y-1">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-left">
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

export default StudentSidebar;
