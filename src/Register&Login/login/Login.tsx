import { useState } from "react";
import Input from "../components/Input";
import { isInstitutionalEmail } from "./lib/validators";
import BackNav from "../../ui/BackNav";
import PageTransition from "../../ui/PageTransition";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pwd?: string }>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!email) err.email = "Ingresa tu correo institucional";
    else if (!isInstitutionalEmail(email))
      err.email = "Debe ser correo institucional .edu.ec";
    if (!pwd) err.pwd = "Ingresa tu contraseña";

    setErrors(err);
    if (Object.keys(err).length) return;

    // TODO: reemplazar con tu llamada al backend
    console.log("LOGIN", { email, pwd });
    alert("Login enviado (demo).");
  };

  return (
    <PageTransition>
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-md px-6"> 
        <BackNav className="mb-6" homeTo="/" />

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Ingresar a CameYa
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Usa tu correo institucional <strong>.edu.ec</strong>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Correo institucional (.edu.ec)"
            type="email"
            placeholder="tusuario@universidad.edu.ec"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={errors.pwd}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a
            className="text-primary font-semibold hover:underline"
            href="/register"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </section>
    </PageTransition>
  );
}
