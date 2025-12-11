// src/auth/employerDashboard/EmployerSidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import svg_logo from "../../assets/CameYa.Black.SVG.svg";

interface Props {
  mode: "person" | "company";
  onLogout: () => void;
}

const EmployerSidebar: React.FC<Props> = ({ mode, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const baseDashboardPath =
    mode === "company"
      ? "/dashboard/employer/company"
      : "/dashboard/employer/person";

  const profilePath = `${baseDashboardPath}/profile`;

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
    {
      key: "discover",
      path: baseDashboardPath,
      label: mode === "company" ? "Talento" : "Estudiantes",
      icon: "🧭",
    },
    {
      key: "post",
      path: "/dashboard/employer/jobs/new",
      label: "Publicar",
      icon: "➕",
    },
    {
      key: "matches",
      path: `${baseDashboardPath}/matches`,
      label: "Matches",
      icon: "💬",
    },
    {
      key: "profile",
      path: profilePath,
      label: "Perfil",
      icon: "👤",
    },
  ];

  return (
    <>
      {/* HEADER SUPERIOR EMPLOYER */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo + texto */}
          <div className="flex items-center gap-3">
            <img
              src={svg_logo}
              alt="CameYa"
              className="h-7 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[var(--brand-900)]">
                CameYa
              </span>
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                {mode === "company" ? "Empresa" : "Empleador"}
              </span>
            </div>
          </div>

          {/* Botón perfil + logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate(profilePath)}
              className="hidden sm:inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium hover:bg-slate-200"
            >
              Mi perfil
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[var(--brand-900)]"
            >
              <span className="text-base">↪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAV INFERIOR TIPO TAB BAR */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex justify-between px-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={[
                  "flex flex-col items-center justify-center flex-1 py-2 px-2 gap-1 text-[11px] transition-colors",
                  active
                    ? "text-[var(--brand-900)]"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center justify-center h-7 w-7 text-base rounded-full transition-all",
                    active
                      ? "bg-gradient-to-tr from-[var(--brand-900)] via-[var(--brand-600)] to-emerald-500 text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 border border-slate-200",
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

export default EmployerSidebar;
