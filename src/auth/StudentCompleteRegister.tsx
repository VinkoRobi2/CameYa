// src/auth/StudentCompleteRegister.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

const stepsTotal = 3;

const StudentCompleteRegister: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    ciudad: "",
    sectorPreferencias: "",
    habilidadesBasicas: "",
    tituloPerfil: "",
    biografia: "",
    links: "",
    fotoPerfil: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError(null);
    // Validaciones mínimas por paso (puedes endurecerlas si quieres)

    if (step === 0) {
      if (!form.ciudad.trim()) {
        setError("Indica al menos tu ciudad.");
        return;
      }
    }

    if (step === 1) {
      if (!form.habilidadesBasicas.trim()) {
        setError("Escribe al menos tus habilidades básicas.");
        return;
      }
    }

    if (step < stepsTotal - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/completar-perfil`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ciudad: form.ciudad,
            sector_preferencias: form.sectorPreferencias,
            habilidades_basicas: form.habilidadesBasicas,
            titulo_de_perfil: form.tituloPerfil,
            biografia: form.biografia,
            links: form.links,
            foto_perfil: form.fotoPerfil,
          }),
        }
      );

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
          "Perfil completado. Ya puedes iniciar sesión."
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

  const progress = ((step + 1) / stepsTotal) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
              {/* Header */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">
                  Paso {step + 1} de {stepsTotal}
                </p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Completa tu perfil
              </h1>
              <p className="text-sm text-gray-300 text-center mb-6">
                Ya verificaste tu correo. Ahora termina estos pasos para que
                CameYa pueda recomendarte los mejores CameYos para ti.
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* SLIDE 1: Ciudad + sector preferencias */}
                {step === 0 && (
                  <div className="space-y-4">
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

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="sectorPreferencias"
                      >
                        Sectores o tipos de CameYos que prefieres
                      </label>
                      <input
                        id="sectorPreferencias"
                        name="sectorPreferencias"
                        type="text"
                        value={form.sectorPreferencias}
                        onChange={handleChange}
                        placeholder="Ej. eventos, tecnología, atención al cliente..."
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Puedes escribir palabras clave separadas por comas.
                      </p>
                    </div>
                  </div>
                )}

                {/* SLIDE 2: Habilidades básicas */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="habilidadesBasicas"
                      >
                        Habilidades básicas
                      </label>
                      <textarea
                        id="habilidadesBasicas"
                        name="habilidadesBasicas"
                        value={form.habilidadesBasicas}
                        onChange={handleChange}
                        placeholder="Ej. manejo de Excel, atención al cliente, redes sociales, inglés intermedio..."
                        rows={4}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Piensa en habilidades que realmente podrías usar en un
                        CameYo de fin de semana.
                      </p>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: Título, bio, links y foto */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="tituloPerfil"
                      >
                        Título de perfil
                      </label>
                      <input
                        id="tituloPerfil"
                        name="tituloPerfil"
                        type="text"
                        value={form.tituloPerfil}
                        onChange={handleChange}
                        placeholder="Ej. Estudiante de economía con enfoque en análisis de datos"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="biografia"
                      >
                        Biografía corta
                      </label>
                      <textarea
                        id="biografia"
                        name="biografia"
                        value={form.biografia}
                        onChange={handleChange}
                        placeholder="Cuenta brevemente quién eres, qué estudias y qué tipo de trabajos te interesa hacer."
                        rows={4}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="links"
                      >
                        Links relevantes (opcional)
                      </label>
                      <textarea
                        id="links"
                        name="links"
                        value={form.links}
                        onChange={handleChange}
                        placeholder="Ej. LinkedIn, portafolio, GitHub... separados por salto de línea o comas."
                        rows={2}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="fotoPerfil"
                      >
                        Link a tu foto de perfil (opcional)
                      </label>
                      <input
                        id="fotoPerfil"
                        name="fotoPerfil"
                        type="url"
                        value={form.fotoPerfil}
                        onChange={handleChange}
                        placeholder="Ej. URL de una imagen tuya"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Más adelante podrás subirla directo desde CameYa.
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || loading}
                    className="h-10 px-4 rounded-full border border-white/20 text-xs font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Atrás
                  </button>

                  {step < stepsTotal - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Guardando..." : "Guardar y finalizar"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default StudentCompleteRegister;
