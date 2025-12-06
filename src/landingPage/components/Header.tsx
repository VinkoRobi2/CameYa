// src/ui/Header.tsx
import { Link, useLocation } from "react-router-dom";
import type { MouseEventHandler } from "react";

import logoLight from "../../assets/CameYa.Black.SVG.svg";
import logoDark from "../../assets/CameYa.White.SVG.svg";

import { useAuth } from "../../global/AuthContext";

export default function Header() {
  const location = useLocation();
  const { user, role } = useAuth();

  const handleLogoClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 🔍 Determinar a dónde debe ir "Ir a mi app"
  let appHomePath: string | null = null;

  if (typeof window !== "undefined" && (user || role)) {
    const storedUserStr = localStorage.getItem("auth_user");
    let finalUser: any = null;

    if (storedUserStr) {
      try {
        finalUser = JSON.parse(storedUserStr);
      } catch {
        finalUser = null;
      }
    }

    if (finalUser) {
      const tipoCuenta = finalUser.tipo_cuenta || finalUser.role;
      const tipoIdentidad =
        finalUser.tipo_identidad || finalUser.TipoIdentidad;

      const perfilCompletoRaw =
        finalUser.perfil_completo ??
        finalUser.perfilCompleto ??
        finalUser.profile_complete;
      const perfilCompleto = Boolean(perfilCompletoRaw);

      const esEstudiante =
        tipoCuenta === "estudiante" || tipoCuenta === "student";
      const esEmpleador =
        tipoCuenta === "empleador" || tipoCuenta === "employer";

      if (esEstudiante) {
        appHomePath = perfilCompleto
          ? "/dashboard/student"
          : "/register/student/complete";
      } else if (esEmpleador) {
        if (!perfilCompleto) {
          appHomePath = "/register/employer/complete";
        } else {
          const isCompany =
            typeof tipoIdentidad === "string" &&
            tipoIdentidad.toLowerCase() === "empresa";
          appHomePath = isCompany
            ? "/dashboard/employer/company"
            : "/dashboard/employer/person";
        }
      }
    }

    // Fallback por si no hay info suficiente pero sí tenemos role en contexto
    if (!appHomePath && role) {
      if (role === "student") {
        appHomePath = "/dashboard/student";
      } else if (role === "employer") {
        appHomePath = "/dashboard/employer/person";
      }
    }
  }

  const isLoggedIn = !!appHomePath;

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={handleLogoClick}
            aria-label="Ir al inicio"
            className="group inline-flex items-center"
          >
            <img
              src={logoLight}
              className="h-14 w-auto block dark:hidden transition-transform duration-200 ease-out group-hover:scale-105"
              alt="CameYa"
            />
            <img
              src={logoDark}
              className="h-14 w-auto hidden dark:block transition-transform duration-200 ease-out group-hover:scale-105"
              alt="CameYa"
            />
          </Link>
        </div>

        {/* Navegación interna */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            className="text-sm font-semibold hover:text-primary transition-colors"
            to="/register/student"
          >
            Buscar CameYo
          </Link>
          <Link
            className="text-sm font-semibold hover:text-primary transition-colors"
            to="/register/employer"
          >
            Publicar CameYo
          </Link>
          <Link
            className="text-sm font-semibold hover:text-primary transition-colors"
            to="/about"
          >
            Acerca
          </Link>
        </nav>

        {/* Acciones Auth */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              to={appHomePath!}
              className="h-10 min-w-[120px] rounded-full px-4 text-sm font-semibold bg-primary text-white hover:opacity-90 flex items-center justify-center transition-opacity"
            >
              Ir a mi app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="h-10 min-w-[84px] rounded-full px-4 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="h-10 min-w-[84px] rounded-full px-4 text-sm font-semibold bg-primary text-white hover:opacity-90 flex items-center justify-center transition-opacity"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
