// src/auth/EmployerCompleteRegister.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../ui/Reveal";
import API_BASE_URL from "../global/ApiBase";

type TipoIdentidad = "persona" | "empresa";

const EmployerCompleteRegister: React.FC = () => {
  const navigate = useNavigate();

  const [tipoIdentidad, setTipoIdentidad] = useState<TipoIdentidad | null>(
    null
  );
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fotoPerfil: "",
    logoEmpresa: "",
    fraseCorta: "",
    biografia: "",
    ubicacion: "",
    preferenciasCategorias: "",
    whatsapp: "",
    linkedin: "",
    facebookIG: "",
    otrosLinks: "",
    dominioCorporativo: "",
    razonSocial: "",
    areaActividadPrincipal: "",
    descripcionEmpresa: "",
    nombreComercial: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipo_identidad desde auth_user
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      const raw = (parsed.tipo_identidad || parsed.TipoIdentidad || "").toString().toLowerCase();
      if (raw === "empresa") {
        setTipoIdentidad("empresa");
      } else {
        setTipoIdentidad("persona");
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const stepsTotal = tipoIdentidad === "empresa" ? 3 : 2;

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
      if (
        !form.fotoPerfil.trim() ||
        !form.fraseCorta.trim() ||
        !form.biografia.trim() ||
        !form.ubicacion.trim() ||
        !form.preferenciasCategorias.trim()
      ) {
        setError(
          "Completa foto, frase corta, biografía, ubicación y categorías preferidas."
        );
        return;
      }
    }

    if (tipoIdentidad === "empresa" && step === 2) {
      if (
        !form.dominioCorporativo.trim() ||
        !form.razonSocial.trim() ||
        !form.areaActividadPrincipal.trim() ||
        !form.descripcionEmpresa.trim() ||
        !form.nombreComercial.trim()
      ) {
        setError(
          "Completa los datos principales de tu empresa antes de continuar."
        );
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

  const handleSubmit = async () => {
    if (step < stepsTotal - 1 || !tipoIdentidad) return;

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

      const parseList = (raw: string): string[] =>
        raw
          .split(/[,|\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

      const prefsArray = parseList(form.preferenciasCategorias);

      const payload = {
        foto_perfil: form.fotoPerfil,
        logo_empresa: form.logoEmpresa,
        frase_corta: form.fraseCorta,
        biografia: form.biografia,
        ubicacion: form.ubicacion,
        preferencias_categorias: prefsArray,
        whatsapp: form.whatsapp,
        linkedin: form.linkedin,
        facebook_ig: form.facebookIG,
        otros_links: form.otrosLinks,
        dominio_corporativo:
          tipoIdentidad === "empresa" ? form.dominioCorporativo : "",
        razon_social: tipoIdentidad === "empresa" ? form.razonSocial : "",
        area_actividad_principal:
          tipoIdentidad === "empresa" ? form.areaActividadPrincipal : "",
        descripcion_empresa:
          tipoIdentidad === "empresa" ? form.descripcionEmpresa : "",
        nombre_comercial:
          tipoIdentidad === "empresa" ? form.nombreComercial : "",
      };

      const res = await fetch(
        `${API_BASE_URL}/protected/completar-perfil-empleador`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (data && (data.message as string)) ||
            "No se pudo completar tu perfil de empleador."
        );
        return;
      }

      setMessage(
        (data && (data.message as string)) ||
          "Perfil de empleador completado correctamente."
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

  if (!tipoIdentidad) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm text-gray-300">
          Cargando tu perfil de empleador...
        </p>
      </div>
    );
  }

  const progress = ((step + 1) / stepsTotal) * 100;
  const esEmpresa = tipoIdentidad === "empresa";

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
                Completa tu perfil de empleador
              </h1>
              <p className="text-sm text-gray-300 text-center mb-6">
                Define cómo se verá tu perfil ante los estudiantes de CameYa.
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

              <form className="space-y-6">
                {/* STEP 0: básicos para ambos */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="fotoPerfil"
                      >
                        Foto de perfil
                      </label>
                      <input
                        id="fotoPerfil"
                        name="fotoPerfil"
                        type="url"
                        value={form.fotoPerfil}
                        onChange={handleChange}
                        placeholder="URL de tu foto o logo principal"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="fraseCorta"
                      >
                        Frase corta
                      </label>
                      <input
                        id="fraseCorta"
                        name="fraseCorta"
                        type="text"
                        value={form.fraseCorta}
                        onChange={handleChange}
                        placeholder={
                          esEmpresa
                            ? "Ej. Empresa de eventos deportivos"
                            : "Ej. Emprendedor de logística de eventos"
                        }
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="biografia"
                      >
                        Biografía
                      </label>
                      <textarea
                        id="biografia"
                        name="biografia"
                        value={form.biografia}
                        onChange={handleChange}
                        rows={4}
                        placeholder={
                          esEmpresa
                            ? "Cuenta brevemente a qué se dedica tu empresa y qué tipo de trabajos publicas."
                            : "Cuenta quién eres, qué haces y qué tipo de trabajos sueles publicar."
                        }
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="ubicacion"
                      >
                        Ciudad / ubicación principal
                      </label>
                      <input
                        id="ubicacion"
                        name="ubicacion"
                        type="text"
                        value={form.ubicacion}
                        onChange={handleChange}
                        placeholder="Ej. Guayaquil"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="preferenciasCategorias"
                      >
                        Categorías de CameYos que publicas
                      </label>
                      <input
                        id="preferenciasCategorias"
                        name="preferenciasCategorias"
                        type="text"
                        value={form.preferenciasCategorias}
                        onChange={handleChange}
                        placeholder="Ej. eventos, atención al cliente, almacenes... (separa por comas)"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 1: contacto / redes (ambos tipos) */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="whatsapp"
                      >
                        WhatsApp de contacto
                      </label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="text"
                        value={form.whatsapp}
                        onChange={handleChange}
                        placeholder="Ej. +593 99 999 9999"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="linkedin"
                      >
                        LinkedIn (opcional)
                      </label>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="URL de tu perfil o empresa"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="facebookIG"
                      >
                        Facebook / Instagram (opcional)
                      </label>
                      <input
                        id="facebookIG"
                        name="facebookIG"
                        type="url"
                        value={form.facebookIG}
                        onChange={handleChange}
                        placeholder="URL de Fanpage o perfil"
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="otrosLinks"
                      >
                        Otros links (opcional)
                      </label>
                      <input
                        id="otrosLinks"
                        name="otrosLinks"
                        type="text"
                        value={form.otrosLinks}
                        onChange={handleChange}
                        placeholder="Web propia, portafolio, etc."
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: solo empresa */}
                {esEmpresa && step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="nombreComercial"
                      >
                        Nombre comercial
                      </label>
                      <input
                        id="nombreComercial"
                        name="nombreComercial"
                        type="text"
                        value={form.nombreComercial}
                        onChange={handleChange}
                        placeholder="Ej. CameYa Events S.A."
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

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
                        Dominio corporativo
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

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="areaActividadPrincipal"
                      >
                        Área de actividad principal
                      </label>
                      <input
                        id="areaActividadPrincipal"
                        name="areaActividadPrincipal"
                        type="text"
                        value={form.areaActividadPrincipal}
                        onChange={handleChange}
                        placeholder="Ej. organización de eventos, retail, logística..."
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="descripcionEmpresa"
                      >
                        Descripción de la empresa
                      </label>
                      <textarea
                        id="descripcionEmpresa"
                        name="descripcionEmpresa"
                        value={form.descripcionEmpresa}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Botones */}
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
                      type="button"
                      onClick={handleSubmit}
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

export default EmployerCompleteRegister;
