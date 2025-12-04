// src/auth/EmployerRegister.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

const EmployerRegister: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "", // WhatsApp
    terminosAceptados: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.terminosAceptados) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        // Datos que el usuario llena
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        tipo_cuenta: "empleador",

        // Usamos teléfono como WhatsApp
        telefono: form.telefono,

        // Valores por defecto / mínimos para no romper el backend
        cedula_ruc: "",
        ciudad: "Guayaquil",
        foto_perfil: "",
        terminos_aceptados: form.terminosAceptados,

        // Identidad por defecto: persona natural
        tipo_identidad: "",
        dominio_corporativo: "",
        razon_social: "",

        // Otros campos que el backend podría ignorar o tener opcionales
        disponibilidad_de_tiempo: "",
        carrera: "",
        universidad: "",
      };

      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (data && (data.message as string)) ||
            "No se pudo completar el registro."
        );
        return;
      }

      // Pantalla "revisa tu correo"
      navigate("/register/employer/check-email", {
        state: { email: form.email },
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-white/95 dark:bg-background-dark/95 border border-primary/10 rounded-2xl p-6 shadow-xl">
              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Crea tu cuenta empleador
              </h1>
              <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70 text-center mb-6">
                Publica CameYos y conecta con estudiantes verificados en minutos.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-500 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="nombre"
                    >
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="apellido"
                    >
                      Apellido
                    </label>
                    <input
                      id="apellido"
                      name="apellido"
                      type="text"
                      required
                      value={form.apellido}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

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
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Te enviaremos un correo para verificar tu cuenta.
                  </p>
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
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="telefono"
                  >
                    WhatsApp
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 0991234567"
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-foreground-light/80 dark:text-foreground-dark/80">
                  <input
                    id="terminosAceptados"
                    name="terminosAceptados"
                    type="checkbox"
                    checked={form.terminosAceptados}
                    onChange={handleChange}
                    className="mt-1 accent-primary"
                  />
                  <label htmlFor="terminosAceptados">
                    He leído y acepto los términos, condiciones y el uso de mis
                    datos personales en CameYa.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-white text-sm font-semibold hover:brightness-110 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? "Registrando..." : "Registrarme"}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default EmployerRegister;
