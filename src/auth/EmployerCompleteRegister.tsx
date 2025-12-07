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
    ciudad: "",
    biografia: "",
    areaActividadPrincipal: "",
    fotoPerfil: "", // DataURL (base64) o URL
    logoEmpresa: "", // DataURL (base64) o URL
    whatsapp: "",
    linkedin: "",
    facebookIG: "",
    otrosLinks: "",
    dominioCorporativo: "",
    razonSocial: "",
    descripcionEmpresa: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [employerBase, setEmployerBase] = useState<{
    nombre?: string;
    apellido?: string;
    tipo_identidad?: string;
  }>({});

    // Convierte un DataURL (data:image/png;base64,AAA...) a solo la parte base64
  const dataUrlToBase64 = (value: string): string => {
    if (!value) return "";
    if (!value.startsWith("data:")) return value; // si ya es solo base64 o una URL, se devuelve tal cual
    const parts = value.split(",", 2);
    return parts.length === 2 ? parts[1] : value;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      const raw = (parsed.tipo_identidad || parsed.TipoIdentidad || "")
        .toString()
        .toLowerCase();

      setEmployerBase({
        nombre: parsed.nombre,
        apellido: parsed.apellido,
        tipo_identidad: raw,
      });

      if (raw === "empresa") {
        setTipoIdentidad("empresa");
      } else if (raw === "persona") {
        setTipoIdentidad("persona");
      } else {
        setTipoIdentidad(null);
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const esEmpresa = tipoIdentidad === "empresa";
  const stepsTotal = esEmpresa ? 3 : 2;
  const progress = ((step + 1) / stepsTotal) * 100;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (value: TipoIdentidad) => {
    setTipoIdentidad(value);
    setError(null);
    setStep(0);
  };

  const handleImageFile =
    (field: "fotoPerfil" | "logoEmpresa") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string; // DataURL
        setForm((prev) => ({ ...prev, [field]: result }));

        if (field === "fotoPerfil") {
          setFotoPreview(result);
        } else {
          setLogoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    };

  const handleNext = () => {
    setError(null);

    if (step === 0 && !tipoIdentidad) {
      setError("Selecciona si te registras como persona o empresa.");
      return;
    }

    if (step === 0) {
      if (!form.ciudad.trim() || !form.biografia.trim()) {
        setError("Completa al menos ciudad y biografía.");
        return;
      }
      if (esEmpresa && !form.areaActividadPrincipal.trim()) {
        setError("Para empresas, indica el área de actividad principal.");
        return;
      }
    }

    if (step === 1) {
      if (!form.whatsapp.trim()) {
        setError("Indica un WhatsApp de contacto.");
        return;
      }
    }

    if (esEmpresa && step === 2) {
      if (
        !form.dominioCorporativo.trim() ||
        !form.razonSocial.trim() ||
        !form.descripcionEmpresa.trim()
      ) {
        setError(
          "Completa dominio corporativo, razón social y descripción de la empresa."
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

      const payload = {
        // 🔥 IMPORTANTE: enviar tipo_identidad al backend
        tipo_identidad: tipoIdentidad,

        // Enviamos solo la parte base64 si viene como DataURL
        foto_perfil_base64: dataUrlToBase64(form.fotoPerfil),
        logo_empresa: dataUrlToBase64(form.logoEmpresa),

        frase_corta: "",
        biografia: form.biografia,
        ubicacion: form.ciudad,
        preferencias_categorias: [] as string[],
        whatsapp: form.whatsapp,
        linkedin: form.linkedin,
        facebook_ig: form.facebookIG,
        otros_links: form.otrosLinks,
        dominio_corporativo: esEmpresa ? form.dominioCorporativo : "",
        razon_social: esEmpresa ? form.razonSocial : "",
        area_actividad_principal: form.areaActividadPrincipal,
        descripcion_empresa: esEmpresa ? form.descripcionEmpresa : "",
        nombre_comercial: esEmpresa ? form.razonSocial : "",
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

  const nombreBase =
    (employerBase.nombre || "") +
    (employerBase.apellido ? ` ${employerBase.apellido}` : "");
  const displayName =
    esEmpresa && form.razonSocial.trim().length > 0
      ? form.razonSocial
      : nombreBase || "Empleador CameYa";

  const displaySub =
    form.areaActividadPrincipal.trim().length > 0
      ? form.areaActividadPrincipal
      : esEmpresa
      ? "Empresa"
      : "Persona natural";

  const ciudad = form.ciudad || "Ciudad";
  const bioPreview =
    form.biografia ||
    "Aquí aparecerá la descripción de quién eres y qué tipo de CameYos publicas.";

  const logoForPreview = logoPreview || form.logoEmpresa || form.fotoPerfil || null;

  const linksPreview = [
    form.whatsapp && `WhatsApp: ${form.whatsapp}`,
    form.linkedin && "LinkedIn",
    form.facebookIG && "Facebook / Instagram",
    form.otrosLinks && "Otros links",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Reveal>
            <div className="bg-white/95 dark:bg-background-dark/95 border border-primary/10 rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <p className="text-xs text-foreground-light/60 dark:text-foreground-dark/60 mb-1">
                  Paso {step + 1} de {stepsTotal}
                </p>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
                Completa tu perfil de empleador
              </h1>
              <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70 text-center mb-6">
                Define cómo se verá tu perfil ante los estudiantes de CameYa.
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

              <form className="space-y-6">
                {/* STEP 0 */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <p className="block text-sm font-medium mb-2">
                        ¿Te registras como persona o empresa?
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handleTipoChange("persona")}
                          className={[
                            "border rounded-xl px-3 py-2 text-left transition",
                            tipoIdentidad === "persona"
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
                          ].join(" ")}
                        >
                          <span className="block text-sm">Persona</span>
                          <span className="block text-[11px] text-slate-500">
                            Empleador independiente / negocio pequeño.
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTipoChange("empresa")}
                          className={[
                            "border rounded-xl px-3 py-2 text-left transition",
                            tipoIdentidad === "empresa"
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
                          ].join(" ")}
                        >
                          <span className="block text-sm">Empresa</span>
                          <span className="block text-[11px] text-slate-500">
                            Marca formal o empresa constituida.
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="ciudad">
                        Ciudad principal
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
                        placeholder={
                          esEmpresa
                            ? "Ej. organización de eventos, retail, logística..."
                            : "Ej. organización de eventos, logística de ferias..."
                        }
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="biografia">
                        Biografía / descripción
                      </label>
                      <textarea
                        id="biografia"
                        name="biografia"
                        value={form.biografia}
                        onChange={handleChange}
                        rows={4}
                        placeholder={
                          esEmpresa
                            ? "Cuenta brevemente a qué se dedica tu empresa y qué tipo de CameYos publicas."
                            : "Cuenta quién eres, qué haces y qué tipo de CameYos sueles publicar."
                        }
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Foto o imagen de perfil
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-semibold">
                          {fotoPreview || form.fotoPerfil ? (
                            <img
                              src={fotoPreview || form.fotoPerfil}
                              alt="Foto de perfil"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>Foto</span>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFile("fotoPerfil")}
                            className="block w-full text-xs text-slate-500 file:text-xs file:px-3 file:py-1.5 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:brightness-110"
                          />
                          <input
                            id="fotoPerfil"
                            name="fotoPerfil"
                            type="url"
                            value={form.fotoPerfil}
                            onChange={handleChange}
                            placeholder="O pega aquí un enlace a tu foto"
                            className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {esEmpresa && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Logo de empresa (opcional)
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold">
                            {logoPreview || form.logoEmpresa ? (
                              <img
                                src={logoPreview || form.logoEmpresa}
                                alt="Logo empresa"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>Logo</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFile("logoEmpresa")}
                              className="block w-full text-xs text-slate-500 file:text-xs file:px-3 file:py-1.5 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:brightness-110"
                            />
                            <input
                              id="logoEmpresa"
                              name="logoEmpresa"
                              type="url"
                              value={form.logoEmpresa}
                              onChange={handleChange}
                              placeholder="O pega aquí un enlace al logo"
                              className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="whatsapp">
                        WhatsApp de contacto
                      </label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="text"
                        value={form.whatsapp}
                        onChange={handleChange}
                        placeholder="Ej. +593 99 999 9999"
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="linkedin">
                        LinkedIn (opcional)
                      </label>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="URL de tu perfil o empresa"
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="facebookIG">
                        Facebook / Instagram (opcional)
                      </label>
                      <input
                        id="facebookIG"
                        name="facebookIG"
                        type="url"
                        value={form.facebookIG}
                        onChange={handleChange}
                        placeholder="URL de Fanpage o perfil"
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="otrosLinks">
                        Otros links (opcional)
                      </label>
                      <input
                        id="otrosLinks"
                        name="otrosLinks"
                        type="text"
                        value={form.otrosLinks}
                        onChange={handleChange}
                        placeholder="Web propia, portafolio, etc."
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 (solo empresa) */}
                {esEmpresa && step === 2 && (
                  <div className="space-y-4">
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
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="razonSocial">
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
                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || loading}
                    className="h-10 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Atrás
                  </button>

                  {step < stepsTotal - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="h-10 px-6 rounded-full bg-primary text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      {loading ? "Guardando..." : "Guardar y finalizar"}
                    </button>
                  )}
                </div>
              </form>

              {step === stepsTotal - 1 && (
                <div className="mt-8">
                  <p className="text-xs font-medium text-slate-500 mb-2 text-center">
                    Vista previa de cómo te verán los estudiantes
                  </p>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute -top-4 -left-3 h-6 w-10 rounded-full bg-slate-200 blur-xl opacity-60" />
                      <div className="absolute -bottom-5 -right-4 h-10 w-14 rounded-full bg-primary/30 blur-xl opacity-80" />

                      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-2xl max-w-sm mx-auto transform rotate-[-2deg]">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center text-sm font-semibold">
                              {logoForPreview ? (
                                <img
                                  src={logoForPreview}
                                  alt={displayName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {displayName
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
                                {displayName}
                              </h2>
                              <p className="text-[11px] text-slate-200/80 line-clamp-1">
                                {displaySub}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-[10px]">
                            {ciudad}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-100/90 mb-3 line-clamp-3">
                          {bioPreview}
                        </p>

                        {linksPreview.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                              Contacto / redes
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {linksPreview.map((l) => (
                                <span
                                  key={l}
                                  className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[9px]"
                                >
                                  {l}
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
                            ✔
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

export default EmployerCompleteRegister;
