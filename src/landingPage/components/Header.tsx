// src/ui/Header.tsx
import { Link, useLocation } from "react-router-dom";
import type { MouseEventHandler } from "react";

import logoLight from "../../assets/CameYa.Black.SVG.svg";
import logoDark from "../../assets/CameYa.White.SVG.svg";

export default function Header() {
  const location = useLocation();

  const handleLogoClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
        </div>
      </div>
    </header>
  );
}
