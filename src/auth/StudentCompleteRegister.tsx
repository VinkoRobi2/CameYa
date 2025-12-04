// src/auth/StudentCompleteRegister.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

const stepsTotal = 3;

type StoredUserData = {
  nombre?: string;
  apellido?: string;
  email?: string;
  ciudad?: string;
  carrera?: string;
  universidad?: string;
  foto_perfil?: string;
};

const StudentCompleteRegister: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    ciudad: "",
    telefono: "",
    carrera: "",
    universidad: "",
    disponibilidad: "", // disponibilidad_de_tiempo
    habilidadesBasicas: "",
    biografia: "",
    links: "",
    fotoPerfil: "", // URL opcional
    fotoPerfilBase64: "", // imagen real que se envía al backend
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [userData, setUserData] = useState<StoredUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos básicos guardados en localStorage para mostrar en la card
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_data");
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      setUserData(parsed);
    } catch (e) {
      console.error("No se pudo leer user_data de localStorage", e);
    }
  }, []);

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
      if (!form.universidad.trim()) {
        setError("Indica tu universidad.");
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

  const parseList = (raw: string): string[] =>
    raw
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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

      const habilidadesArray = parseList(form.habilidadesBasicas); // []string
      const linksArray = parseList(form.links); // []string

      const payload = {
        ciudad: form.ciudad,
        telefono: form.telefono,
        carrera: form.carrera,
        universidad: form.universidad,
        habilidades: habilidadesArray,
        foto_perfil_base64: form.fotoPerfilBase64 || "",
        disponibilidad:
          form.disponibilidad && form.disponibilidad.length > 0
            ? form.disponibilidad
            : "no_especificado",
        biografia: form.biografia,
        links: linksArray,
        perfil_completo: true,
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

  // Datos para la card de vista previa
  const previewNombre =
    (userData?.nombre || "Tu nombre") +
    (userData?.apellido ? ` ${userData.apellido}` : "");

  const previewCiudad =
    form.ciudad.trim().length > 0
      ? form.ciudad
      : userData?.ciudad || "Ciudad";

  const previewUniversidad =
    form.universidad.trim().length > 0
      ? form.universidad
      : userData?.universidad || "Universidad";

  const previewCarrera =
    form.carrera.trim().length > 0
      ? form.carrera
      : userData?.carrera || "";

  const skills = parseList(form.habilidadesBasicas).slice(0, 6);
  const linksPreview = parseList(form.links);
  const fotoCard =
    fotoPreview || form.fotoPerfil || userData?.foto_perfil || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
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
                Ya verificaste tu correo. Completa estos pasos para que tu
                perfil se vea atractivo para los empleadores y podamos
                recomendarte los mejores CameYos.
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

              {/* FORMULARIO MULTIPASO */}
              <form className="space-y-6">
                {/* SLIDE 1: Datos básicos académicos + disponibilidad */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          htmlFor="telefono"
                        >
                          Teléfono (opcional)
                        </label>
                        <input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={form.telefono}
                          onChange={handleChange}
                          placeholder="Ej. 0991234567"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-slate-800"
                          htmlFor="universidad"
                        >
                          Universidad
                        </label>
                        <input
                          id="universidad"
                          name="universidad"
                          type="text"
                          value={form.universidad}
                          onChange={handleChange}
                          placeholder="Ej. ESPOL"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-slate-800"
                          htmlFor="carrera"
                        >
                          Carrera (opcional)
                        </label>
                        <input
                          id="carrera"
                          name="carrera"
                          type="text"
                          value={form.carrera}
                          onChange={handleChange}
                          placeholder="Ej. Economía"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-slate-800"
                        htmlFor="disponibilidad"
                      >
                        Disponibilidad de tiempo
                      </label>
                      <select
                        id="disponibilidad"
                        name="disponibilidad"
                        value={form.disponibilidad}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="fines_de_semana">
                          Solo fines de semana
                        </option>
                        <option value="tardes">Tardes entre semana</option>
                        <option value="mañanas">Mañanas entre semana</option>
                        <option value="flexible">Horario flexible</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Esto ayuda a los empleadores a saber en qué momentos
                        puedes trabajar.
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
                        Estas aparecerán como tags en tu card.
                      </p>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: Bio, links y foto */}
                {step === 2 && (
                  <div className="space-y-4">
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

                    {/* FOTO DE PERFIL */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-800">
                        Foto de perfil (opcional)
                      </label>

                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs text-slate-500">
                          {fotoCard ? (
                            <img
                              src={fotoCard}
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
                          Si también subes una imagen, se usará la foto subida
                          para tu perfil (base64 → servidor).
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

              {/* VISTA PREVIA - TINDER STYLE CARD AL FINAL (solo paso 3) */}
              {step === 2 && (
                <div className="mt-8">
                  <p className="text-xs font-medium text-slate-500 mb-2 text-center">
                    Vista previa de cómo verán tu perfil los empleadores
                  </p>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute -top-4 -left-3 h-6 w-10 rounded-full bg-slate-200 blur-xl opacity-60" />
                      <div className="absolute -bottom-5 -right-4 h-10 w-14 rounded-full bg-primary/30 blur-xl opacity-80" />

                      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-2xl max-w-sm mx-auto transform rotate-[-2deg]">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center text-sm font-semibold">
                              {fotoCard ? (
                                <img
                                  src={fotoCard}
                                  alt="Foto perfil preview"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {previewNombre
                                    .split(" ")
                                    .map((p) => p[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <h2 className="text-base font-semibold leading-tight">
                                {previewNombre}
                              </h2>
                              <p className="text-[11px] text-slate-200/80 line-clamp-1">
                                {previewCarrera
                                  ? previewCarrera
                                  : "Estudiante universitario"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end text-[10px] text-slate-300">
                            <span className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                              {previewCiudad}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700 line-clamp-1 max-w-[8rem]">
                              {previewUniversidad}
                            </span>
                          </div>
                        </div>

                        {form.biografia.trim().length > 0 && (
                          <p className="text-[11px] text-slate-100/90 mb-3 line-clamp-3">
                            {form.biografia}
                          </p>
                        )}

                        {skills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                              Habilidades
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[10px]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {linksPreview.length > 0 && (
                          <div className="mt-1">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                              Links
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {linksPreview.slice(0, 3).map((link) => (
                                <span
                                  key={link}
                                  className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[9px] max-w-[10rem] truncate"
                                >
                                  {link.replace(/^https?:\/\//, "")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-center gap-6">
                          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 text-xs">
                            ✕
                          </div>
                          <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center shadow-lg text-sm">
                            ♥
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default StudentCompleteRegister;
