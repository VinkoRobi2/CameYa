// src/dashboards/students/components/StudentSidebar.tsx
import type { StudentTab } from "../index";

interface StudentSidebarProps {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
}

const navItems: { id: StudentTab; label: string; description: string }[] = [
  {
    id: "home",
    label: "Inicio",
    description: "Explorar trabajos",
  },
  {
    id: "applications",
    label: "Postulaciones",
    description: "Estados y contacto",
  },
  {
    id: "completed",
    label: "Completados",
    description: "Historial e ingresos",
  },
  {
    id: "profile",
    label: "Mi perfil",
    description: "Lo que ven los empleadores",
  },
];

export const StudentSidebar = ({
  activeTab,
  onTabChange,
}: StudentSidebarProps) => {
  return (
    <nav className="flex flex-col w-full h-full px-3 py-4 gap-4">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          CameYa · Estudiante
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left rounded-xl px-3 py-2.5 transition border text-sm ${
                isActive
                  ? "bg-sky-500/20 border-sky-500/70 text-sky-50"
                  : "bg-transparent border-transparent text-slate-300 hover:bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-slate-400">{item.description}</div>
            </button>
          );
        })}
      </div>

      <div className="px-2 pb-2 text-[11px] text-slate-500">
        <p>CameYa: el trabajo que llega ya.</p>
      </div>
    </nav>
  );
};
