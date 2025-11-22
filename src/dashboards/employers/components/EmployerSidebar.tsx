import { NavLink } from "react-router-dom";
import {
  Briefcase,
  Home,
  FileText,
  Users,
  UserCircle2,
  Settings,
  LogOut,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  {
    label: "Inicio",
    to: "/employers/dashboard",
    icon: Home,
  },
  {
    label: "Mis publicaciones",
    to: "/employers/dashboard/posts",
    icon: FileText,
  },
  {
    label: "Solicitantes",
    to: "/employers/dashboard/applicants",
    icon: Users,
  },
  {
    label: "Mi perfil",
    to: "/employers/dashboard/profile",
    icon: UserCircle2,
  },
];

export const EmployerSidebar = () => {
  const baseItemClasses =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors";
  const inactiveClasses =
    "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40";
  const activeClasses =
    "bg-primary/10 text-primary-foreground/90 text-primary";

  return (
    <nav className="flex flex-col md:h-full md:justify-between">
      {/* Desktop: logo + menú lateral */}
      <div className="hidden md:flex md:flex-col gap-4 p-3">
        {/* Marca */}
        <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">CameYa</span>
            <span className="text-[11px] text-slate-400">
              Para empleadores
            </span>
          </div>
        </div>

        {/* Navegación principal */}
        <ul className="flex flex-col gap-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      baseItemClasses,
                      isActive ? activeClasses : inactiveClasses,
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop: footer */}
      <div className="hidden md:flex flex-col gap-1 border-t border-border px-3 py-3 text-xs text-slate-500">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-slate-800/40 hover:text-slate-100"
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Mobile: barra inferior tipo tabs (DashboardShell ya la coloca abajo) */}
      <div className="flex md:hidden items-center justify-around px-2 py-1.5 text-[11px]">
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-0.5 rounded-full px-2 py-1 transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-slate-400 hover:text-slate-100",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
