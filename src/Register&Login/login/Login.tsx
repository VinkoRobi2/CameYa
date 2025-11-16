// src/Register&Login/login/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import BackNav from "../../ui/BackNav";
import PageTransition from "../../ui/PageTransition";
import { LOGIN_URL } from "../../global_helpers/api";
import { decodeJWT, isJwtExpired } from "../../global_helpers/jwt";

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

      const data: LoginResponse = await res.json().catch(
        () => ({} as LoginResponse)
      );

      if (!res.ok) {
        const msg = data?.message || "Credenciales inválidas";
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

      // ✅ Guardar token y respaldo de user_data
      localStorage.setItem("auth_token", token);
      if (data?.user_data) {
        localStorage.setItem("auth_user", JSON.stringify(data.user_data));
      }

      // Decodificar claims del JWT
      const claims = decodeJWT(token);

      // Si el token vino expirado, corta
      if (isJwtExpired(claims)) {
        setErrors((p) => ({
          ...p,
          server: "La sesión ha expirado. Intenta nuevamente.",
        }));
        return;
      }

      // Fallback a user_data del backend
      const ud = data?.user_data ?? {};
      const emailVerificado =
        (claims?.email_verificado as boolean | undefined) ??
        (claims as any)?.emailVerified ??
        ud?.email_verificado ??
        false;

      // 👇 Considera también perfil_completo
      const completedOnboarding =
        (claims?.completed_onboarding as boolean | undefined) ??
        (claims as any)?.perfil_completo ??
        ud?.completed_onboarding ??
        (ud as any)?.perfil_completo ??
        false;

      // Tipo de cuenta: usamos también claims.role como fallback
      const tipoCuenta =
        (claims?.tipo_cuenta as string | undefined) ??
        (claims?.role as string | undefined) ??
        (ud?.tipo_cuenta as string | undefined) ??
        "";

      // 🔐 Email no verificado
      if (!emailVerificado) {
        const emailFrom =
          (claims?.email as string) ?? (ud?.email as string) ?? email;
        nav("/check-email", { state: { email: emailFrom } });
        return;
      }

      // 🔄 Onboarding pendiente → depende del tipo de cuenta
      if (!completedOnboarding) {
        if (tipoCuenta === "empleador") {
          nav("/register/employer/post");
        } else {
          // estudiante, worker, etc.
          nav("/register/worker/post");
        }
        return;
      }

      // ✅ Todo listo → dashboard estudiante
      if (tipoCuenta === "empleador") {
        // De momento no tienes dashboard de empleador, los puedes mandar a la misma landing o a donde quieras
        nav("/student/dashboard");
      } else {
        nav("/student/dashboard");
      }
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
