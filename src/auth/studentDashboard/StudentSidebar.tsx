// src/auth/studentDashboard/StudentSidebar.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import svg_logo from "../../assets/CameYa.Black.SVG.svg";

interface StudentSidebarProps {
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const navItems = [
    { path: "/dashboard/student", label: "CameYos", icon: "💼" },
    { path: "/dashboard/student/matches", label: "Matches", icon: "💬" },
    { path: "/dashboard/student/browse-employers", label: "Historial", icon: "🕒" },
    { path: "/dashboard/student/profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <>
      {/* HEADER SUPERIOR ESTUDIANTE */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Solo logo + texto sin fondo */}
          <div className="flex items-center gap-3">
            <img
              src={svg_logo}
              alt="CameYa"
              className="h-7 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                CameYa
              </span>
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                Estudiante
              </span>
            </div>
          </div>

          {/* Chip de rol + logout */}
          <div className="flex items-center gap-4">
            <span className="hidden xs:inline-flex items-center rounded-full bg-fuchsia-50 text-fuchsia-600 px-3 py-1 text-xs font-semibold">
              Buscar CameYo
            </span>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              <span className="text-base">↪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAV INFERIOR TIPO TAB BAR */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="max-w-5xl mx-auto flex justify-between px-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={[
                  "flex flex-col items-center justify-center flex-1 py-2 px-2 gap-1 text-[11px] transition-colors",
                  active ? "text-fuchsia-600" : "text-slate-500",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center justify-center h-7 w-7 text-base rounded-full",
                    active
                      ? "bg-gradient-to-tr from-fuchsia-500 to-purple-600 text-white shadow-sm"
                      : "",
                  ].join(" ")}
                >
                  <span>{item.icon}</span>
                </div>
                <span className={active ? "font-medium" : "font-normal"}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default StudentSidebar;
