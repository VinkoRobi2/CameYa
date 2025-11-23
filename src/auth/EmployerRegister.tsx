// src/auth/EmployerRegister.tsx
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Crea tu cuenta empleador
              </h1>
              <p className="text-sm text-gray-300 text-center mb-6">
                Publica trabajos flash y conecta con estudiantes verificados en
                minutos.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de empleador */}
                <div>
                  <p className="block text-sm font-medium mb-1">
                    Tipo de empleador
                  </p>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Persona"
                        checked={form.tipoIdentidad === "Persona"}
                        onChange={handleChange}
                      />
                      Persona
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Empresa"
                        checked={form.tipoIdentidad === "Empresa"}
                        onChange={handleChange}
                      />
                      Empresa
                    </label>
                  </div>
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-start gap-2 text-xs text-gray-300">
                  <input
                    id="terminosAceptados"
                    name="terminosAceptados"
                    type="checkbox"
                    checked={form.terminosAceptados}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <label htmlFor="terminosAceptados">
                    He leído y acepto los términos, condiciones y el uso de mis
                    datos personales en CameYa.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
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
