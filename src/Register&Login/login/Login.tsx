import { useState } from "react";
import Input from "../components/Input";
import BackNav from "../../ui/BackNav";
import PageTransition from "../../ui/PageTransition";
import { LOGIN_URL, ME_URL } from "../../global_helpers/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pwd?: string }>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!email) err.email = "Ingresa tu correo";
    if (!pwd) err.pwd = "Ingresa tu contraseña";
    setErrors(err);
    if (Object.keys(err).length) return;

    try {
      setLoading(true);
      // 1) Login
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Credenciales inválidas");
        return;
      }

      // 2) Guardar token
      const token = data?.token;
      localStorage.setItem("auth_token", token);

      // 3) Cargar perfil
      const meRes = await fetch(ME_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = await meRes.json();
      if (!meRes.ok) {
        alert("No se pudo cargar el perfil");
        return;
      }

      // 4) Redirecciones
      if (!me.email_verificado) {
        alert("Debes verificar tu correo para continuar.");
        nav("/check-email", { state: { email: me.email } });
        return;
      }

      if (!me.completed_onboarding) {
        nav("/onboarding");
        return;
      }

      nav("/dashboard");
    } catch (e: any) {
      alert(e?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
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
              placeholder="usuario@universidad.edu.ec"
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
              disabled={loading}
              className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a className="text-primary font-semibold hover:underline" href="/register">
              Crear cuenta
            </a>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
