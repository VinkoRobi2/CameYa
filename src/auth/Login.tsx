import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";
import { useAuth } from "../global/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (data && (data.message as string)) ||
            "No se pudo iniciar sesión. Revisa tus datos."
        );
        return;
      }

      const tokenFromResponse =
        (data as any).token ||
        (data as any).access_token ||
        (data as any).auth_token;

      const userFromResponse =
        (data as any).user_data ||
        (data as any).user ||
        (data as any).data;

      if (tokenFromResponse) {
        localStorage.setItem("auth_token", tokenFromResponse);
      }

      if (userFromResponse) {
        localStorage.setItem("auth_user", JSON.stringify(userFromResponse));
      }

      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      let finalUser: any = null;
      const storedUserStr = localStorage.getItem("auth_user");
      if (storedUserStr) {
        try {
          finalUser = JSON.parse(storedUserStr);
        } catch {
          finalUser = userFromResponse ?? null;
        }
      } else if (userFromResponse) {
        finalUser = userFromResponse;
      }

      if (finalUser) {
        const tipoCuenta = finalUser.tipo_cuenta || finalUser.role;

        const normalizedUser = {
          id: String(finalUser.user_id ?? finalUser.id ?? ""),
          name:
            finalUser.nombre || finalUser.apellido
              ? `${finalUser.nombre ?? ""} ${finalUser.apellido ?? ""}`.trim()
              : finalUser.name ?? "",
          email: finalUser.email,
          role:
            tipoCuenta === "estudiante"
              ? ("student" as const)
              : tipoCuenta === "empleador"
              ? ("employer" as const)
              : null,
        };

        login(normalizedUser);
      }

      // 🔁 Redirección sólo a los "home" de cada dashboard
      let redirectTo = "/";

      if (finalUser) {
        const tipoCuenta = finalUser.tipo_cuenta || finalUser.role;
        const tipoIdentidad =
          finalUser.tipo_identidad || finalUser.TipoIdentidad;

        const esEstudiante =
          tipoCuenta === "estudiante" || tipoCuenta === "student";
        const esEmpleador =
          tipoCuenta === "empleador" || tipoCuenta === "employer";

        if (esEstudiante) {
          redirectTo = "/dashboard/student";
        } else if (esEmpleador) {
          const isCompany =
            typeof tipoIdentidad === "string" &&
            tipoIdentidad.toLowerCase() === "empresa";
          redirectTo = isCompany
            ? "/dashboard/employer/company"
            : "/dashboard/employer/person";
        }
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="relative flex-1 flex items-center justify-center px-4 py-10">
        {/* Botón volver al inicio */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          ← Volver al inicio
        </button>

        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Iniciar sesión
              </h1>
              <p className="text-sm text-gray-300 text-center mb-6">
                Usa el correo y contraseña que registraste en CameYa.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Ingresando..." : "Entrar"}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default Login;
