import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import BackNav from "../../ui/BackNav";
import PageTransition from "../../ui/PageTransition";
import { LOGIN_URL } from "../../global_helpers/api";
import { decodeJWT, isJwtExpired } from "../../global_helpers/jwt";
import { useAuth } from "../../auth/AuthContext";

type LoginResponse = {
  token?: string;
  user_data?: {
    nombre?: string;
    foto_perfil?: string;
    tipo_cuenta?: string;
    user_id?: number | string;
    email?: string;
    email_verificado?: boolean;
    completed_onboarding?: boolean;
    perfil_completo?: boolean;
  };
  message?: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    pwd?: string;
    server?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err: typeof errors = {};
    if (!email.trim()) err.email = "Ingresa tu correo";
    if (!pwd.trim()) err.pwd = "Ingresa tu contraseña";
    setErrors(err);
    if (Object.keys(err).length) return;

    try {
      setLoading(true);

      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      const text = await res.text();
      let data: LoginResponse = {};
      try {
        data = JSON.parse(text) as LoginResponse;
      } catch {
        // respuesta no JSON
      }

      if (!res.ok) {
        const msg =
          (data && data.message) || "Credenciales inválidas o error del servidor.";
        setErrors((p) => ({ ...p, server: msg }));
        return;
      }

      const token = data?.token;
      if (!token) {
        setErrors((p) => ({
          ...p,
          server: "No se recibió token del servidor.",
        }));
        return;
      }

      // Opcional: validamos expiración del token antes de guardar nada
      const claims = decodeJWT(token);
      if (isJwtExpired(claims)) {
        setErrors((p) => ({
          ...p,
          server: "La sesión ha expirado. Intenta nuevamente.",
        }));
        return;
      }

      // ✅ Delegamos toda la persistencia + navegación al AuthContext
      // Pasamos el user_data que venga del back (o en su defecto las claims)
      const userPayload = data.user_data ?? claims ?? {};
      login(token, userPayload);
    } catch (e: any) {
      console.error(e);
      setErrors((p) => ({
        ...p,
        server:
          "Error al iniciar sesión. Verifica tu conexión o el servidor.",
      }));
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

            {errors.server && (
              <p className="text-xs text-red-600">{errors.server}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => nav("/register")}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
