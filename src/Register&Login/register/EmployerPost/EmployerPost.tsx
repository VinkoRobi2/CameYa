import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import PageTransition from "../../../ui/PageTransition";
import BackNav from "../../../ui/BackNav";
import { decodeJWT } from "../../../global_helpers/jwt";
import { API_BASE } from "../../../global_helpers/api";

type EmployerType = "persona" | "empresa";

type SimpleStepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

function SimpleStepper({ steps, currentStep, onStepClick }: SimpleStepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6 text-xs md:text-sm">
      {steps.map((label, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick?.(idx)}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] transition-colors ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : isCompleted
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-primary/30 text-foreground-light/70"
              }`}
            >
              {idx + 1}
            </button>
            <span
              className={`${
                isActive
                  ? "font-semibold text-foreground-light"
                  : "text-foreground-light/70"
              }`}
            >
              {label}
            </span>
            {idx !== steps.length - 1 && (
              <span className="w-6 h-px bg-primary/20" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// 🔹 Persona: 5 pasos
const stepsPersona = [
  "Tu perfil",
  "Ubicación",
  "Áreas de interés",
  "Enlaces",
  "Revisión",
];

// 🔹 Empresa: 3 pasos
const stepsEmpresa = ["Datos empresa", "Sobre la empresa", "Revisión"];

const ONBOARDING_URL = `${API_BASE}/protected/completar-perfil-empleador`; // Ajusta al endpoint real

const AREAS_INTERES = [
  "Clases y tutorías",
  "Eventos y logística",
  "Ventas / encuestas",
  "Ayuda en casa",
  "Tecnología / soporte",
  "Oficina / administración",
  "Otros",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EmployerPost() {
  const navigate = useNavigate();

  const [tipoEmpleador, setTipoEmpleador] = useState<EmployerType>("persona");
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Persona
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // Empresa
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [empresaBio, setEmpresaBio] = useState("");

  // Ubicación (compartida)
  const [location, setLocation] = useState("");

  // Áreas de interés (persona)
  const [areasInteres, setAreasInteres] = useState<string[]>([]);

  // Enlaces
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [socialProfile, setSocialProfile] = useState(""); // Facebook o Instagram
  const [otherLink, setOtherLink] = useState("");

  // Foto / logo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Datos privados del user (para vista privada)
  const [privateName, setPrivateName] = useState("");
  const [privateLastName, setPrivateLastName] = useState("");
  const [privateEmail, setPrivateEmail] = useState("");
  const [privateCedulaRuc, setPrivateCedulaRuc] = useState("");
  const [privatePhone, setPrivatePhone] = useState("");

  const steps =
    tipoEmpleador === "persona" ? stepsPersona : stepsEmpresa;

  // Detectar tipo de empleador + proteger ruta + prefill phone/ubicación
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUserRaw = localStorage.getItem("auth_user");
    if (storedUserRaw) {
      try {
        const u = JSON.parse(storedUserRaw);

        if (u.completed_onboarding) {
          navigate("/dashboard");
          return;
        }

        // Tipo de empleador
        const t =
          (u.tipo_empleador as string | undefined) ??
          (u.tipo_identidad as string | undefined);

        if (t) {
          const normalized = t.toLowerCase();
          if (normalized === "persona" || normalized === "empresa") {
            setTipoEmpleador(normalized as EmployerType);
          }
        }

        // Datos privados
        if (typeof u.nombre === "string") setPrivateName(u.nombre);
        if (typeof u.apellido === "string") setPrivateLastName(u.apellido);
        if (typeof u.email === "string") setPrivateEmail(u.email);
        if (typeof u.telefono === "string") {
          setPrivatePhone(u.telefono);
          // Prefill WhatsApp con el teléfono registrado
          setWhatsapp(u.telefono);
        }
        if (typeof u.cedula_ruc === "string") {
          setPrivateCedulaRuc(u.cedula_ruc);
        } else if (typeof u.cedula === "string") {
          setPrivateCedulaRuc(u.cedula);
        } else if (typeof u.ruc === "string") {
          setPrivateCedulaRuc(u.ruc);
        }

        // Prefill ubicación si la tienes
        if (u.ciudad && typeof u.ciudad === "string") {
          setLocation(u.ciudad);
        }
      } catch {
        // ignore
      }
    } else {
      const claims: any = decodeJWT(token);
      if (claims?.completed_onboarding) {
        navigate("/dashboard");
        return;
      }
      const t =
        (claims?.tipo_empleador as string | undefined) ??
        (claims?.tipo_identidad as string | undefined);
      if (t) {
        const normalized = t.toLowerCase();
        if (normalized === "persona" || normalized === "empresa") {
          setTipoEmpleador(normalized as EmployerType);
        }
      }

      if (claims?.nombre && typeof claims.nombre === "string") {
        setPrivateName(claims.nombre);
      }
      if (claims?.apellido && typeof claims.apellido === "string") {
        setPrivateLastName(claims.apellido);
      }
      if (claims?.email && typeof claims.email === "string") {
        setPrivateEmail(claims.email);
      }
      if (claims?.telefono && typeof claims.telefono === "string") {
        setPrivatePhone(claims.telefono);
        setWhatsapp(claims.telefono);
      }
      if (claims?.cedula_ruc && typeof claims.cedula_ruc === "string") {
        setPrivateCedulaRuc(claims.cedula_ruc);
      }
      if (claims?.ciudad && typeof claims.ciudad === "string") {
        setLocation(claims.ciudad);
      }
    }
  }, [navigate]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleArea = (area: string) => {
    setAreasInteres((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const validateStep = (step: number): boolean => {
    const err: Record<string, string> = {};

    if (tipoEmpleador === "persona") {
      // 🔹 persona
      if (step === 0) {
        if (!headline.trim()) {
          err.headline = "Escribe una frase corta sobre ti.";
        }
        if (!bio.trim() || bio.trim().length < 40) {
          err.bio =
            "Cuéntanos un poco más (mínimo 40 caracteres).";
        }
      } else if (step === 1) {
        // Ubicación
        if (!location.trim()) {
          err.location = "Ingresa tu ubicación (ciudad/barrio).";
        }
      } else if (step === 2) {
        // Áreas de interés
        if (!areasInteres.length) {
          err.areasInteres =
            "Escoge al menos un área de interés.";
        }
      } else if (step === 3) {
        // Enlaces
        if (
          !whatsapp.trim() &&
          !linkedin.trim() &&
          !socialProfile.trim() &&
          !otherLink.trim()
        ) {
          err.links =
            "Agrega al menos un medio de contacto (WhatsApp, LinkedIn, redes o enlace).";
        }
      }
    } else {
      // 🔹 empresa
      if (step === 0) {
        if (!companyName.trim()) {
          err.companyName = "Ingresa el nombre de la empresa.";
        }
        if (!website.trim()) {
          err.website = "Ingresa la página web de la empresa.";
        }
        if (!location.trim()) {
          err.location = "Ingresa la ubicación de la empresa.";
        }
      } else if (step === 1) {
        if (!empresaBio.trim() || empresaBio.trim().length < 40) {
          err.empresaBio =
            "Describe brevemente la empresa (mínimo 40 caracteres).";
        }
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Último paso -> enviar
    await handleSubmit();
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      let fotoBase64: string | null = null;
      if (photoFile) {
        fotoBase64 = await fileToBase64(photoFile);
      }

        const payload: any = {
            // estos campos extra los puede ignorar el backend si solo bindea al struct
            tipo_cuenta: "empleador",
            tipo_empleador: tipoEmpleador,
            completed_onboarding: true,
        };

        if (tipoEmpleador === "persona") {
            // 🔹 Mapea EXACTAMENTE a EmployerProfileUpdateRequest (persona)
            payload.foto_perfil = fotoBase64 || ""; // evitar null en string
            payload.frase_corta = headline.trim();
            payload.biografia = bio.trim();
            payload.ubicacion = location.trim();
            payload.preferencias_categorias = areasInteres;
            payload.whatsapp = whatsapp.trim();
            payload.linkedin = linkedin.trim();
            payload.facebook_ig = socialProfile.trim();
            payload.otros_links = otherLink.trim();
        } else {
            // 🔹 Empresa (cuando tengas el struct específico lo ajustas,
            // aquí ya evitamos nulls también)
            payload.foto_perfil = fotoBase64 || "";
            payload.ubicacion = location.trim();
            payload.nombre_empresa = companyName.trim();
            payload.website = website.trim();
            payload.linkedin = linkedin.trim();
            payload.facebook_ig = socialProfile.trim();
            payload.otros_links = otherLink.trim();
            payload.biografia = empresaBio.trim();
        }

      const res = await fetch(ONBOARDING_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error onboarding employer:", text);
        alert(
          "No se pudo guardar la configuración del perfil. Revisa los datos o intenta más tarde."
        );
        return;
      }

      // Actualizar flag en localStorage
      const userRaw = localStorage.getItem("auth_user");
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          u.completed_onboarding = true;
          localStorage.setItem("auth_user", JSON.stringify(u));
        } catch {
          // ignore
        }
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(
        "Ocurrió un error al guardar la configuración. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // DERIVADOS PARA LA VISTA PREVIA
  // ─────────────────────────────────────────
  const fullPrivateName = [privateName, privateLastName]
    .filter(Boolean)
    .join(" ");

  const publicPersonaName =
    fullPrivateName ||
    (privateName ? privateName : "Tu nombre");

  const publicPersonaNameShort = `${publicPersonaName} ${
    privateLastName ? `${privateLastName.charAt(0).toUpperCase()}.` : ""
  }`.trim();

  const empresaPublicName = companyName || "Nombre de la empresa";

  const renderStepContent = () => {
    if (tipoEmpleador === "persona") {
      // 🔹 FLUJO PERSONA
      if (currentStep === 0) {
        // Tu perfil
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Foto de perfil (opcional)
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border border-dashed border-primary/40 flex items-center justify-center text-xs text-foreground-light/60">
                    {publicPersonaNameShort.charAt(0) || "?"}
                  </div>
                )}
                <label className="text-xs font-medium text-primary cursor-pointer">
                  <span className="underline">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
            </div>

            <Input
              label="Frase corta sobre ti"
              placeholder='Ej: "Busco estudiantes responsables para ayuda de tareas"'
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              error={errors.headline}
              required
            />

            <div className="flex flex-col gap-1 text-sm">
              <label className="font-medium">Descripción</label>
              <textarea
                className="min-h-[120px] rounded-lg border border-primary/30 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Cuenta quién eres, qué tipo de trabajos sueles ofrecer y qué esperas de los estudiantes."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              {errors.bio && (
                <p className="text-xs text-red-600">{errors.bio}</p>
              )}
            </div>
          </div>
        );
      }

      if (currentStep === 1) {
        // Ubicación
        return (
          <div className="space-y-4">
            <Input
              label="Ubicación"
              placeholder="Ej: Guayaquil, sector Urdesa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
              required
            />
            <p className="text-xs text-foreground-light/70">
              Esta ubicación ayuda a que los estudiantes sepan en qué zona se realizarían
              los trabajos presenciales.
            </p>
          </div>
        );
      }

      if (currentStep === 2) {
        // Áreas de interés
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground-light/80">
              Escoge las áreas de trabajo principales para las que sueles buscar estudiantes.
            </p>
            <div className="flex flex-wrap gap-2">
              {AREAS_INTERES.map((area) => {
                const active = areasInteres.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "border-primary/30 text-foreground-light/80 hover:border-primary/60"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
            {errors.areasInteres && (
              <p className="text-xs text-red-600">
                {errors.areasInteres}
              </p>
            )}
          </div>
        );
      }

      if (currentStep === 3) {
        // Enlaces
        return (
          <div className="space-y-4">
            <Input
              label="WhatsApp (usaremos tu número registrado, puedes ajustarlo si quieres)"
              placeholder="+593 99 123 4567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <Input
              label="Perfil de LinkedIn (opcional)"
              placeholder="https://www.linkedin.com/in/usuario"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <Input
              label="Facebook o Instagram (opcional)"
              placeholder="https://www.instagram.com/usuario"
              value={socialProfile}
              onChange={(e) => setSocialProfile(e.target.value)}
            />

            <Input
              label="Otro enlace (opcional)"
              placeholder="Ej: enlace a otra red, formulario, etc."
              value={otherLink}
              onChange={(e) => setOtherLink(e.target.value)}
            />

            {errors.links && (
              <p className="text-xs text-red-600">{errors.links}</p>
            )}
          </div>
        );
      }
    } else {
      // 🔹 FLUJO EMPRESA
      if (currentStep === 0) {
        // Datos empresa
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Logo de la empresa (opcional)
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Logo"
                    className="w-16 h-16 rounded-lg object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-primary/40 flex items-center justify-center text-xs text-foreground-light/60">
                    {empresaPublicName.charAt(0) || "?"}
                  </div>
                )}
                <label className="text-xs font-medium text-primary cursor-pointer">
                  <span className="underline">Subir logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
            </div>

            <Input
              label="Nombre de la empresa"
              placeholder="Ej: Panadería Buen Pan"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={errors.companyName}
              required
            />

            <Input
              label="Página web"
              placeholder="https://tusitio.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              error={errors.website}
              required
            />

            <Input
              label="Ubicación"
              placeholder="Ej: Guayaquil, sector Urdesa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
              required
            />
          </div>
        );
      }

      if (currentStep === 1) {
        // Sobre la empresa + enlaces
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1 text-sm">
              <label className="font-medium">
                Descripción de la empresa
              </label>
              <textarea
                className="min-h-[120px] rounded-lg border border-primary/30 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Cuenta brevemente a qué se dedica la empresa y qué tipo de trabajos suele ofrecer a estudiantes."
                value={empresaBio}
                onChange={(e) => setEmpresaBio(e.target.value)}
              />
              {errors.empresaBio && (
                <p className="text-xs text-red-600">
                  {errors.empresaBio}
                </p>
              )}
            </div>

            <Input
              label="LinkedIn de la empresa (opcional)"
              placeholder="https://www.linkedin.com/company/tu-empresa"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <Input
              label="Facebook o Instagram (opcional)"
              placeholder="https://www.instagram.com/tuempresa"
              value={socialProfile}
              onChange={(e) => setSocialProfile(e.target.value)}
            />

            <Input
              label="Otro enlace (opcional)"
              placeholder="Ej: Instagram alterno, formulario, etc."
              value={otherLink}
              onChange={(e) => setOtherLink(e.target.value)}
            />
          </div>
        );
      }
    }

    // ───────────────────────────────────────
    // PASO FINAL: VISTA PREVIA (AMBOS TIPOS)
    // ───────────────────────────────────────
    const isPersona = tipoEmpleador === "persona";

    return (
      <div className="space-y-6 text-sm">
        <div>
          <h2 className="text-base font-semibold mb-1">
            Vista previa de tu perfil
          </h2>
          <p className="text-xs text-foreground-light/70">
            Esto es un aproximado de cómo se verá tu perfil público para los estudiantes
            y cómo verás tú tus datos internos no públicos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* PERFIL PÚBLICO */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Avatar"
                  className={isPersona
                    ? "w-12 h-12 rounded-full object-cover border border-primary/40"
                    : "w-12 h-12 rounded-lg object-cover border border-primary/40"}
                />
              ) : (
                <div
                  className={
                    isPersona
                      ? "w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-sm font-semibold"
                      : "w-12 h-12 rounded-lg border border-primary/30 flex items-center justify-center text-sm font-semibold"
                  }
                >
                  {isPersona
                    ? publicPersonaNameShort.charAt(0) || "?"
                    : empresaPublicName.charAt(0) || "?"}
                </div>
              )}

              <div>
                <p className="font-semibold text-sm">
                  {isPersona ? publicPersonaNameShort : empresaPublicName}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                    {isPersona ? "Persona" : "Empresa"}
                  </span>
                  {location && (
                    <span className="inline-flex items-center gap-1 text-foreground-light/70">
                      <span>📍</span>
                      <span>{location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isPersona ? (
              <>
                {headline && (
                  <p className="text-sm font-medium">{headline}</p>
                )}
                {bio && (
                  <p className="text-xs text-foreground-light/80 line-clamp-4">
                    {bio}
                  </p>
                )}
                {areasInteres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {areasInteres.map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-primary"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {empresaBio && (
                  <p className="text-xs text-foreground-light/80 line-clamp-4">
                    {empresaBio}
                  </p>
                )}
              </>
            )}

            {/* Contacto visible */}
            <div className="mt-1 border-t border-primary/10 pt-2">
            <p className="text-xs font-semibold mb-1">
                Los medios de contacto y verificación pública que posees.
            </p>

            {whatsapp || linkedin || socialProfile || otherLink ? (
                <ul className="space-y-1 text-[11px] text-foreground-light/80">
                {whatsapp && <li>• WhatsApp conectado</li>}
                {linkedin && <li>• LinkedIn añadido</li>}
                {socialProfile && <li>• Facebook / Instagram añadido</li>}
                {otherLink && <li>• Otro enlace añadido</li>}
                </ul>
            ) : (
                <ul className="space-y-1 text-[11px] text-foreground-light/80">
                <li>• Aún no has añadido enlaces visibles.</li>
                </ul>
            )}
            </div>

            <p className="mt-1 text-[10px] text-foreground-light/60">
              Esta tarjeta representa lo que verán los estudiantes al entrar a tu
              perfil (sin mostrar datos sensibles como cédula, correo o dirección
              exacta).
            </p>
          </div>

          {/* PERFIL PRIVADO */}
          <div className="rounded-2xl border border-dashed border-primary/30 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm font-semibold">Datos internos</p>
                <p className="text-[11px] text-foreground-light/70">
                  Solo tú ves esta información dentro de tu cuenta.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-foreground-light/85">
              <div>
                <p className="font-semibold">
                  {isPersona ? "Nombre completo" : "Persona de contacto"}
                </p>
                <p>{fullPrivateName || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">
                  Correo con el que inicias sesión
                </p>
                <p>{privateEmail || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">Teléfono principal</p>
                <p>{privatePhone || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">Cédula / RUC</p>
                <p>{privateCedulaRuc || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">Ubicación guardada</p>
                <p>{location || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">
                  WhatsApp configurado como contacto
                </p>
                <p>{whatsapp || privatePhone || "—"}</p>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-foreground-light/60">
              Estos datos se usan para verificar tu identidad y ayudarte a gestionar
              tus publicaciones, pero no se exponen en el perfil público tal cual.
              CameYa puede usar parte de esta información para mantener segura la
              comunidad (por ejemplo, verificaciones internas o soporte).
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <section className="min-h-[80vh] flex items-center justify-center py-16">
        <div className="w-full max-w-2xl px-6">
          <BackNav className="mb-6" homeTo="/" />

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Configura tu perfil de empleador
            </h1>
            <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
              Completa estos pasos para que los estudiantes sepan con quién
              van a trabajar.
            </p>
          </div>

          {/* Tipo de empleador (solo display) */}
          <div className="mb-4 text-xs rounded-full bg-primary/5 inline-flex px-3 py-1 items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="capitalize">
              Modo: {tipoEmpleador === "persona" ? "Persona" : "Empresa"}
            </span>
          </div>

          <SimpleStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(idx) => {
              // Permitimos ir hacia atrás; hacia adelante solo si ya pasó por ese paso
              if (idx <= currentStep) setCurrentStep(idx);
            }}
          />

          <form onSubmit={handleNext} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-10 px-4 rounded-full border border-primary/30 text-sm font-medium text-foreground-light/80 disabled:opacity-40"
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {currentStep === steps.length - 1
                  ? saving
                    ? "Guardando..."
                    : "Finalizar configuración"
                  : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </PageTransition>
  );
}
