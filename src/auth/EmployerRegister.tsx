import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

type TipoIdentidad = "Persona" | "Empresa";

const EmployerRegister: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipoIdentidad: "Persona" as TipoIdentidad,
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    cedulaRuc: "",
    telefono: "",
    fechaNacimiento: "",
    ciudad: "",
    razonSocial: "",
    dominioCorporativo: "",
    terminosAceptados: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
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
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        tipo_cuenta: "empleador",

        cedula_ruc: form.cedulaRuc,
        cedula: "",
        telefono: form.telefono,
        fecha_nacimiento: form.fechaNacimiento,
        ciudad: form.ciudad || "Guayaquil",
        ubicacion: "",
        institucion_educativa: "",

        carrera: "",
        universidad: "",
        disponibilidad_de_tiempo: "",

        foto_perfil: "",
        nivel_actual: "",
        terminos_aceptados: form.terminosAceptados,

        tipo_identidad: form.tipoIdentidad,
        preferencias_categorias: null,
        dominio_corporativo:
          form.tipoIdentidad === "Empresa" ? form.dominioCorporativo : "",
        razon_social:
          form.tipoIdentidad === "Empresa" ? form.razonSocial : "",
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

      // pantalla "revisa tu correo" (reutilizamos StudentCheckEmail)
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

  const isEmpresa = form.tipoIdentidad === "Empresa";

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
                {/* Tipo de empleador */}
                <div>
                  <p className="block text-sm font-medium mb-1">
                    Tipo de empleador
                  </p>
                  <div className="flex gap-3 text-xs md:text-sm">
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs md:text-sm cursor-pointer transition-all
                      ${
                        form.tipoIdentidad === "Persona"
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-slate-200 text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Persona"
                        checked={form.tipoIdentidad === "Persona"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      Persona
                    </label>
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs md:text-sm cursor-pointer transition-all
                      ${
                        form.tipoIdentidad === "Empresa"
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-slate-200 text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Empresa"
                        checked={form.tipoIdentidad === "Empresa"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      Empresa
                    </label>
                  </div>
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Elige si publicarás CameYos como persona natural o en nombre
                    de una empresa.
                  </p>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="cedulaRuc"
                    >
                      {isEmpresa ? "RUC" : "Cédula"}
                    </label>
                    <input
                      id="cedulaRuc"
                      name="cedulaRuc"
                      type="text"
                      required
                      value={form.cedulaRuc}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="telefono"
                    >
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="fechaNacimiento"
                    >
                      Fecha de nacimiento / creación
                    </label>
                    <input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="ciudad"
                    >
                      Ciudad
                    </label>
                    <input
                      id="ciudad"
                      name="ciudad"
                      type="text"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ej. Guayaquil"
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {isEmpresa && (
                  <>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="razonSocial"
                      >
                        Razón social
                      </label>
                      <input
                        id="razonSocial"
                        name="razonSocial"
                        type="text"
                        value={form.razonSocial}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="dominioCorporativo"
                      >
                        Dominio corporativo (opcional)
                      </label>
                      <input
                        id="dominioCorporativo"
                        name="dominioCorporativo"
                        type="text"
                        value={form.dominioCorporativo}
                        onChange={handleChange}
                        placeholder="Ej. miempresa.com"
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </>
                )}

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
