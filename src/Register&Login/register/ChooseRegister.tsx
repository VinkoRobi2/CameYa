import { Link } from "react-router-dom";
import BackNav from "../../ui/BackNav";

export default function ChooseRegister() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-2xl px-6">
        <BackNav className="mb-6" homeTo="/" />
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Elige cómo quieres usar CameYa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/register/worker"
            className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <h3 className="font-display font-semibold">Buscar trabajo</h3>
                <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
                  Postula a CameYos rápidos y flexibles.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/register/employer"
            className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-accent text-white flex items-center justify-center">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <div>
                <h3 className="font-display font-semibold">Buscar trabajadores</h3>
                <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
                  Publica CameYos y recibe postulaciones verificadas.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-xs mt-5 text-center text-foreground-light/60 dark:text-foreground-dark/60">
          Registro habilitado únicamente con correo institucional <strong>.edu.ec</strong> para estudiantes.
          
        </p>
      </div>
    </section>
  );
}
