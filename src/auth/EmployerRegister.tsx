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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl">
              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2 text-slate-900">
                Crea tu cuenta empleador
              </h1>
              <p className="text-sm text-slate-600 text-center mb-6">
                Publica trabajos flash y conecta con estudiantes verificados en
                minutos.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-500 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de empleador */}
                <div>
                  <p className="block text-sm font-medium mb-1 text-slate-800">
                    Tipo de empleador
                  </p>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Persona"
                        checked={form.tipoIdentidad === "Persona"}
                        onChange={handleChange}
                        className="accent-[#0A5FE3]"
                      />
                      Persona
                    </label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input
                        type="radio"
                        name="tipoIdentidad"
                        value="Empresa"
                        checked={form.tipoIdentidad === "Empresa"}
                        onChange={handleChange}
                        className="accent-[#0A5FE3]"
                      />
                      Empresa
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-slate-800"
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
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-slate-800"
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
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-slate-800"
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
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                    />
                  </div>
                </div>

                {isEmpresa && (
                  <>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
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
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
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
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0A5FE3] focus:ring-2 focus:ring-[#0A5FE3]/15"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <input
                    id="terminosAceptados"
                    name="terminosAceptados"
                    type="checkbox"
                    checked={form.terminosAceptados}
                    onChange={handleChange}
                    className="mt-1 accent-[#00A14D]"
                  />
                  <label htmlFor="terminosAceptados">
                    He leído y acepto los términos, condiciones y el uso de mis
                    datos personales en CameYa.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-[#0A5FE3] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
