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
    fotoPerfil: "", // URL opcional que ya tenías
    fotoPerfilBase64: "", // NUEVO: base64 real que se envía al backend
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

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

  // Manejar selección de archivo (cámara/galería o file picker)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor sube un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) return;

      // result viene como "data:image/png;base64,AAAA..."
      const base64 = result.split(",")[1] || "";
      setFotoPreview(result);
      setForm((prev) => ({
        ...prev,
        fotoPerfilBase64: base64,
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Se llama SOLO desde el botón "Guardar y finalizar"
  const handleSubmit = async () => {
    if (step < stepsTotal - 1) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("No se encontró tu sesión. Vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }

      // ---- Adaptar datos al formato que espera el backend ----
      const parseList = (raw: string): string[] =>
        raw
          .split(/[,|\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

      const sectorArray = parseList(form.sectorPreferencias); // []string
      const habilidadesArray = parseList(form.habilidadesBasicas); // []string
      const linksArray = parseList(form.links); // []string

      const payload = {
        titulo_perfil: form.tituloPerfil, // string
        sector_preferencias: sectorArray, // []string
        habilidades: habilidadesArray, // []string
        foto_perfil_base64: form.fotoPerfilBase64 || "", // NUEVO → backend ProfileUpdateRequest.FotoPerfilBase64
        disponibilidad: "no_especificado", // string requerido por backend
        biografia: form.biografia, // string
        links: linksArray, // []string
        perfil_completo: true, // bool (el backend calcula su propio profileComplete igualmente)
      };

      const res = await fetch(`${API_BASE_URL}/protected/completar-perfil`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
          "Perfil completado correctamente."
      );

      setTimeout(() => {
        navigate("/", { replace: true });
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl">
              {/* Header */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1">
                  Paso {step + 1} de {stepsTotal}
                </p>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2 text-slate-900">
                Completa tu perfil
              </h1>
              <p className="text-sm text-slate-600 text-center mb-6">
                Ya verificaste tu correo. Ahora termina estos pasos para que
                CameYa pueda recomendarte los mejores CameYos para ti.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-500 text-center">
                  {error}
                </p>
              )}
              {message && (
                <p className="mb-4 text-sm text-emerald-600 text-center">
                  {message}
                </p>
              )}

              {/* Sin onSubmit: solo contenedor visual */}
              <form className="space-y-6">
                {/* SLIDE 1: Ciudad + sector preferencias */}
                {step === 0 && (
                  <div className="space-y-4">
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
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
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
                        placeholder="Ej. eventos, tecnología, atención al cliente... (separa por comas)"
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Escribe palabras clave separadas por comas.
                      </p>
                    </div>
                  </div>
                )}

                {/* SLIDE 2: Habilidades básicas */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
                        htmlFor="habilidadesBasicas"
                      >
                        Habilidades básicas
                      </label>
                      <textarea
                        id="habilidadesBasicas"
                        name="habilidadesBasicas"
                        value={form.habilidadesBasicas}
                        onChange={handleChange}
                        placeholder="Ej. manejo de Excel, atención al cliente, redes sociales, inglés intermedio... (separa por comas o saltos de línea)"
                        rows={4}
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Usa comas o saltos de línea para separar habilidades.
                      </p>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: Título, bio, links y foto */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
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
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
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
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
                        htmlFor="links"
                      >
                        Links relevantes (opcional)
                      </label>
                      <textarea
                        id="links"
                        name="links"
                        value={form.links}
                        onChange={handleChange}
                        placeholder="Ej. LinkedIn, portafolio, GitHub... (separa por comas o saltos de línea)"
                        rows={2}
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                      />
                    </div>

                    {/* FOTO DE PERFIL: archivo / cámara + preview */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-800">
                        Foto de perfil (opcional)
                      </label>

                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs text-slate-500">
                          {fotoPreview || form.fotoPerfil ? (
                            <img
                              src={fotoPreview || form.fotoPerfil}
                              alt="Foto de perfil"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>Sin foto</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <input
                            type="file"
                            accept="image/*"
                            // En mobile abre cámara/galería
                            capture="environment"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
                          />
                          <p className="text-[11px] text-slate-500">
                            Puedes tomar una foto con la cámara (en móvil) o
                            subir una desde tus archivos.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-xs font-medium mb-1 text-slate-600"
                          htmlFor="fotoPerfil"
                        >
                          O pega un link a tu foto (opcional)
                        </label>
                        <input
                          id="fotoPerfil"
                          name="fotoPerfil"
                          type="url"
                          value={form.fotoPerfil}
                          onChange={handleChange}
                          placeholder="Ej. URL de una imagen tuya"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Si también subes una imagen, se usará la foto
                          subida para tu perfil (base64 → servidor).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || loading}
                    className="h-10 px-4 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Atrás
                  </button>

                  {step < stepsTotal - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
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
