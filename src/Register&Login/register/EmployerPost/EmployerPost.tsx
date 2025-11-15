// src/Register&Login/employer/post/EmployerPost.tsx
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

const stepsPersona = ["Tu perfil", "Enlaces", "Revisión"];
const stepsEmpresa = ["Datos empresa", "Sobre la empresa", "Revisión"];

const ONBOARDING_URL = `${API_BASE}/onboarding/employer`; // 🔁 Ajusta si tu back usa otra ruta

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

  // Campos compartidos / persona
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // Campos empresa
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [empresaBio, setEmpresaBio] = useState("");

  // Enlaces
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [otherLink, setOtherLink] = useState("");

  // Foto / logo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const steps =
    tipoEmpleador === "persona" ? stepsPersona : stepsEmpresa;

  // Detectar tipo de empleador + proteger ruta
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Si ya completó onboarding, lo mandamos al dashboard
    const storedUserRaw = localStorage.getItem("auth_user");
    if (storedUserRaw) {
      try {
        const u = JSON.parse(storedUserRaw);
        if (u.completed_onboarding) {
          navigate("/dashboard");
          return;
        }

        // Intentar leer tipo desde user_data
        const t =
          (u.tipo_empleador as string | undefined) ??
          (u.tipo_identidad as string | undefined);

        if (t) {
          const normalized = t.toLowerCase();
          if (normalized === "persona" || normalized === "empresa") {
            setTipoEmpleador(normalized as EmployerType);
          }
        }

        // Prefill WhatsApp si lo tienes guardado
        if (u.telefono && typeof u.telefono === "string") {
          setWhatsapp(u.telefono);
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
    }
  }, [navigate]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateStep = (step: number): boolean => {
    const err: Record<string, string> = {};

    if (tipoEmpleador === "persona") {
      if (step === 0) {
        if (!headline.trim()) {
          err.headline = "Escribe una frase corta sobre ti.";
        }
        if (!bio.trim() || bio.trim().length < 40) {
          err.bio =
            "Cuéntanos un poco más (mínimo 40 caracteres).";
        }
      } else if (step === 1) {
        if (
          !whatsapp.trim() &&
          !linkedin.trim() &&
          !otherLink.trim()
        ) {
          err.links =
            "Agrega al menos un medio de contacto (WhatsApp, LinkedIn u otro).";
        }
      }
    } else {
      // empresa
      if (step === 0) {
        if (!companyName.trim()) {
          err.companyName = "Ingresa el nombre de la empresa.";
        }
        if (!website.trim()) {
          err.website = "Ingresa la página web de la empresa.";
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
        tipo_cuenta: "empleador",
        tipo_empleador: tipoEmpleador,
        foto_perfil: fotoBase64,
        completed_onboarding: true,
      };

      if (tipoEmpleador === "persona") {
        payload.headline = headline.trim();
        payload.descripcion = bio.trim();
        payload.whatsapp = whatsapp.trim() || null;
        payload.linkedin = linkedin.trim() || null;
        payload.otro_link = otherLink.trim() || null;
      } else {
        payload.nombre_empresa = companyName.trim();
        payload.website = website.trim();
        payload.linkedin = linkedin.trim() || null;
        payload.otro_link = otherLink.trim() || null;
        payload.descripcion = empresaBio.trim();
      }

      const res = await fetch(ONBOARDING_URL, {
        method: "POST",
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

  const renderStepContent = () => {
    if (tipoEmpleador === "persona") {
      // 🔹 FLUJO PERSONA
      if (currentStep === 0) {
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
                    Sin foto
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
        return (
          <div className="space-y-4">
            <Input
              label="WhatsApp (recomendado)"
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
              label="Otro enlace (opcional)"
              placeholder="Ej: enlace a red social o formulario"
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
                    Sin logo
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
              label="LinkedIn de la empresa (opcional)"
              placeholder="https://www.linkedin.com/company/tu-empresa"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>
        );
      }

      if (currentStep === 1) {
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
              label="Otro enlace (opcional)"
              placeholder="Ej: Instagram, formulario, etc."
              value={otherLink}
              onChange={(e) => setOtherLink(e.target.value)}
            />
          </div>
        );
      }
    }

    // 🔹 Paso de revisión (común)
    return (
      <div className="space-y-4 text-sm">
        <p className="text-foreground-light/80">
          Revisa que la información esté correcta antes de guardar tu
          perfil.
        </p>

        <div className="rounded-xl border border-primary/20 p-4 space-y-3 text-xs md:text-sm">
          <div>
            <h3 className="font-semibold mb-1">
              Tipo de empleador
            </h3>
            <p className="text-foreground-light/80 capitalize">
              {tipoEmpleador}
            </p>
          </div>

          {tipoEmpleador === "persona" ? (
            <>
              <div>
                <h3 className="font-semibold mb-1">Frase corta</h3>
                <p className="text-foreground-light/80">
                  {headline || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Descripción</h3>
                <p className="text-foreground-light/80 whitespace-pre-line">
                  {bio || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enlaces</h3>
                <ul className="list-disc ml-4 text-foreground-light/80">
                  <li>WhatsApp: {whatsapp || "—"}</li>
                  <li>LinkedIn: {linkedin || "—"}</li>
                  <li>Otro: {otherLink || "—"}</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold mb-1">
                  Nombre de la empresa
                </h3>
                <p className="text-foreground-light/80">
                  {companyName || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Página web</h3>
                <p className="text-foreground-light/80">
                  {website || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">LinkedIn</h3>
                <p className="text-foreground-light/80">
                  {linkedin || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Descripción de la empresa
                </h3>
                <p className="text-foreground-light/80 whitespace-pre-line">
                  {empresaBio || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Otro enlace</h3>
                <p className="text-foreground-light/80">
                  {otherLink || "—"}
                </p>
              </div>
            </>
          )}
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

          {/* Tipo de empleador (solo display, no editable aquí) */}
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
