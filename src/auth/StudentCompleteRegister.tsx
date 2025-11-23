// src/auth/StudentCompleteRegister.tsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

const StudentCompleteRegister: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [form, setForm] = useState({
    ciudad: "",
    ubicacion: "",
    nivelActual: "",
    disponibilidad: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!token) {
      setLoading(false);
      setError("Token de verificación no encontrado en la URL.");
      return;
    }

    try {
      // Un solo request al endpoint de verificación
      const res = await fetch(`${API_BASE_URL}/verify/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Datos finales que quieras guardar al completar perfil
          ciudad: form.ciudad,
          ubicacion: form.ubicacion,
          nivel_actual: form.nivelActual,
          disponibilidad_de_tiempo: form.disponibilidad,
          // Si decides enviar más campos al final, los agregas aquí
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (data && (data.message as string)) ||
            "No se pudo completar tu registro."
        );
        return;
      }

      setMessage(
        (data && (data.message as string)) ||
          "Registro completado. Ya puedes iniciar sesión."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Completa tu perfil
              </h1>
              <p className="text-sm text-gray-300 text-center mb-6">
                Ya verificamos tu correo. Cuéntanos un poco más sobre ti para
                mostrarte CameYos que encajen contigo.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}
              {message && (
                <p className="mb-4 text-sm text-emerald-400 text-center">
                  {message}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="ubicacion"
                  >
                    Ubicación (sector, referencia)
                  </label>
                  <input
                    id="ubicacion"
                    name="ubicacion"
                    type="text"
                    value={form.ubicacion}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="nivelActual"
                  >
                    Nivel actual (ej. 3er semestre)
                  </label>
                  <input
                    id="nivelActual"
                    name="nivelActual"
                    type="text"
                    value={form.nivelActual}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="disponibilidad"
                  >
                    Disponibilidad de tiempo
                  </label>
                  <select
                    id="disponibilidad"
                    name="disponibilidad"
                    value={form.disponibilidad}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="solo fines de semana">
                      Solo fines de semana
                    </option>
                    <option value="entre semana y fines de semana">
                      Entre semana y fines de semana
                    </option>
                    <option value="turnos flexibles">
                      Turnos flexibles
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar y continuar"}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default StudentCompleteRegister;
