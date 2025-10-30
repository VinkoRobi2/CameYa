import { Link, useLocation } from "react-router-dom";

export default function EmailCheck() {
  const { state } = useLocation() as { state?: { email?: string } };
  return (
    <section className="min-h-[70vh] grid place-items-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Verifica tu correo</h1>
        <p className="mt-2 text-sm text-foreground-light/70">
          Te enviamos un enlace de verificación a {state?.email ?? "tu correo"}.
          Abre el correo y haz clic en el enlace para activar tu cuenta.
        </p>
        <div className="mt-6">
          <Link to="/login" className="inline-block px-5 py-2 rounded-full bg-primary text-white">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
