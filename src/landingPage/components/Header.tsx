import { Link, useLocation } from "react-router-dom";
import logoLight from "../../assets/CameYa.Black.SVG.svg";
import logoDark from "../../assets/CameYa.White.SVG.svg";

export default function Header() {
  const location = useLocation();

  const handleLogoClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // Si ya estoy en "/", evitar navegación y solo hacer scroll suave.
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Si estoy en otra ruta, no hago nada: el Link navega a "/"
    // y ScrollToTop se encargará del scroll al entrar.
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Link to="/" onClick={handleLogoClick} aria-label="Ir al inicio">
            <img src={logoLight} className="h-14 w-auto block dark:hidden" alt="CameYa" />
            <img src={logoDark}  className="h-14 w-auto hidden dark:block" alt="CameYa" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-semibold hover:text-primary" href="#gigs">Buscar CameYo</a>
          <a className="text-sm font-semibold hover:text-primary" href="#post">Publicar CameYo</a>
          <a className="text-sm font-semibold hover:text-primary" href="#about">Acerca</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="h-10 min-w-[84px] rounded-full px-4 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center">
            Ingresar
          </Link>
          <Link to="/register" className="h-10 min-w-[84px] rounded-full px-4 text-sm font-semibold bg-primary text-white hover:opacity-90 flex items-center justify-center">
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
