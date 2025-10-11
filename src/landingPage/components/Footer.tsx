// Footer.tsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-background-light dark:bg-background-dark py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-x-6 text-sm font-semibold">
          <Link to="/terms" className="hover:text-primary">Términos</Link>
          <Link to="/terms#privacidad" className="hover:text-primary">Privacidad</Link>
          <Link to="/contact" className="hover:text-primary">Contacto</Link>
        </div>
        <p className="text-sm text-foreground-light/60 dark:text-foreground-dark/60">
          © {new Date().getFullYear()} CameYa. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
