import { useNavigate, Link } from "react-router-dom";

type Props = {
  homeTo?: string; // ruta a la que consideras "Landing", por defecto "/"
  className?: string;
};

export default function BackNav({ homeTo = "/", className = "" }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-full px-4 h-10 bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
        aria-label="Retroceder"
      >
        <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
        Atrás
      </button>

      <Link
        to={homeTo}
        className="inline-flex items-center gap-2 rounded-full px-4 h-10 bg-background-light text-foreground-light ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-background-dark dark:text-foreground-dark font-semibold"
        aria-label="Ir a inicio"
      >
        <span className="material-symbols-outlined" aria-hidden>home</span>
        Inicio
      </Link>
    </div>
  );
}
