/* === WorkerPost.tsx (versión base64: foto embebida en JSON a /protected/completar-perfil) === */
import { useMemo, useState, useEffect, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "./components/Stepper";
import StepShell from "./components/StepShell";
import ImageUploader from "./components/ImageUploader";
import MultiSelectChips from "./components/MultiSelectChips";
import TextArea from "./components/TextArea";
import LinkFields from "./components/LinkFields";
import ReviewSubmit from "./components/ReviewSubmit";
import { useOnboarding } from "./hooks/useOnboarding";
import { SECTORES } from "./utils/constants";
import { decodeJWT } from "../../../global_helpers/jwt";
import { API_BASE } from "../../../global_helpers/api";
import type { AvailabilityKey } from "./types";

// Disponibilidad mostrada en UI  ->  Valor que espera el backend (ejemplo tuyo)
const AVAILABILITY_OPTIONS: { value: AvailabilityKey; label: string }[] = [
  { value: "part-time", label: "Parcial (tardes/noches)" },
  { value: "weekends", label: "Fines de semana" },
  { value: "fulltime-short", label: "Tiempo completo (corto)" },
];
const AVAILABILITY_MAP: Record<AvailabilityKey, string> = {
  "part-time": "medio-tiempo",
  "weekends": "fines-de-semana",
  "fulltime-short": "tiempo-completo-corto",
};
function isAvailabilityKey(v: string): v is AvailabilityKey {
  return v === "part-time" || v === "weekends" || v === "fulltime-short";
}

// Lee user_id de localStorage.auth_user (fallback a claims)
function getUserIdFromLocalStorage(): string | undefined {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const id = parsed?.user_data?.user_id ?? parsed?.user_id ?? parsed?.id ?? parsed?.uid;
    return id != null ? String(id) : undefined;
  } catch {
    return undefined;
  }
}

// Obtén token normalizado (por si lo guardaron con 'Bearer ')
function getAuthToken(): string {
  const raw = localStorage.getItem("auth_token") || "";
  return raw.replace(/^Bearer\s+/i, "").trim();
}

// File → dataURL (e.g., "data:image/png;base64,AAAA...")
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function WorkerPost({
  userId: userIdProp,
  onFinish,
}: {
  userId?: string;
  onFinish?: () => void;
}) {
  const nav = useNavigate();
  const { state, errors, setFotoPerfil, setState, setLink, validate } = useOnboarding();
  const [step, setStep] = useState(1);
  const total = 4;

  // 🔹 Estado local para habilidades & disponibilidad
  const [skillsInput, setSkillsInput] = useState("");
  const [skillsTags, setSkillsTags] = useState<string[]>(() => state?.habilidades ?? []);
  const [availability, setAvailability] = useState<AvailabilityKey | "">(
    state?.disponibilidad ?? ""
  );

  const [localErr, setLocalErr] = useState<{ habilidades?: string; disponibilidad?: string }>({});

  // Token + userId
  const token = typeof window !== "undefined" ? getAuthToken() : "";
  const claims = decodeJWT(token);
  const userIdLS = typeof window !== "undefined" ? getUserIdFromLocalStorage() : undefined;
  const idClaim = claims?.user_id ?? claims?.sub ?? claims?.uid ?? claims?.id;
  const userId = userIdProp ?? userIdLS ?? (idClaim != null ? String(idClaim) : undefined);

  // Si no hay token o no hay userId, manda a login
  useEffect(() => {
    if (!token || !userId) {
      nav("/login");
    }
  }, [token, userId, nav]);

  const fotoPreview = useMemo(
    () => (state.foto_perfil ? URL.createObjectURL(state.foto_perfil) : null),
    [state.foto_perfil]
  );

  const next = () => setStep((s) => Math.min(s + 1, total));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Helpers de habilidades
  const addSkillFromInput = () => {
    const cleaned = skillsInput.trim().replace(/,+$/, "");
    if (!cleaned) return;
    const parts = cleaned
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const nextTags = Array.from(new Set([...skillsTags, ...parts])).slice(0, 15);
    setSkillsTags(nextTags);
    setState((s) => ({ ...s, habilidades: nextTags })); // guarda en store
    setSkillsInput("");
  };
  const onSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillFromInput();
    }
  };
  const removeSkill = (s: string) => {
    const nextTags = skillsTags.filter((x) => x !== s);
    setSkillsTags(nextTags);
    setState((st) => ({ ...st, habilidades: nextTags }));
  };

  // Handler genérico de respuestas del backend
  async function handleJson(res: Response) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      // sin cuerpo JSON
    }
    if (!res.ok) {
      const msg = payload?.message || `Error ${res.status}`;
      alert(msg);
      throw new Error(msg);
    }
    return payload;
  }

  /**
   * 🔒 Solo valida y avanza. NO llama a la API.
   * - Paso 1: foto obligatoria
   * - Paso 2: sectores + título + habilidades + disponibilidad
   * - Paso 3: bio + al menos un link obligatorios
   */
  function validateAndNext(current: number) {
    const err = validate(current === 1); // en el paso 1 validamos foto obligatoria
    const nextLocalErr: typeof localErr = {};

    if (current === 1 && err.foto_perfil) return;

    if (current === 2) {
      if (err.sector_preferencias || err.titulo_perfil) {
        return;
      }
      if (skillsTags.length === 0) {
        nextLocalErr.habilidades = "Añade al menos una habilidad";
      }
      if (!availability) {
        nextLocalErr.disponibilidad = "Selecciona tu disponibilidad";
      }
      setLocalErr(nextLocalErr);
      if (nextLocalErr.habilidades || nextLocalErr.disponibilidad) return;

      setState((s) => ({ ...s, habilidades: skillsTags, disponibilidad: availability }));
    }

    if (current === 3 && (err.biografia || err.links)) return;

    next();
  }

  /**
   * ✅ ÚNICO momento en que se llama a la API.
   * Base64: empaquetamos la foto dentro del JSON para /protected/completar-perfil (Content-Type: application/json)
   * 1) Convertir foto a base64 (dataURL) si existe
   * 2) Construir payload JSON con TODOS los campos y la foto base64
   * 3) PATCH a /protected/completar-perfil
   * 4) (opcional) Finalizar onboarding
   */
  async function submitAll() {
    if (!userId) return;

    // Validación global antes de enviar
    const err = validate(true);
    const blockBecauseLocal =
      (skillsTags.length === 0 ? "habilidades" : "") || (!availability ? "disponibilidad" : "");

    if (
      err.foto_perfil ||
      err.sector_preferencias ||
      err.titulo_perfil ||
      err.biografia ||
      err.links ||
      blockBecauseLocal
    ) {
      if (err.foto_perfil) setStep(1);
      else if (err.sector_preferencias || err.titulo_perfil || blockBecauseLocal) setStep(2);
      else if (err.biografia || err.links) setStep(3);

      setLocalErr({
        habilidades: skillsTags.length === 0 ? "Añade al menos una habilidad" : undefined,
        disponibilidad: !availability ? "Selecciona tu disponibilidad" : undefined,
      });
      return;
    }

    try {
      // 1) Foto a base64 (si existe)
      let foto_data_url: string | undefined;
      let foto_base64: string | undefined;
      let foto_mime: string | undefined;

      if (state.foto_perfil) {
        foto_mime = state.foto_perfil.type || "application/octet-stream";
        const dataURL = await fileToDataURL(state.foto_perfil); // "data:image/png;base64,AAAA..."
        foto_data_url = dataURL;
        const commaIdx = dataURL.indexOf(",");
        foto_base64 = commaIdx >= 0 ? dataURL.slice(commaIdx + 1) : dataURL;
      }

      // 2) Perfil completo en un solo PATCH JSON (Content-Type: application/json)
      const linksArray = Object.values(state.links || {})
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .map((v) => v.trim());

      const payload = {
        // Campos esperados por tu handler
        titulo_perfil: state.titulo_perfil,
        sector_preferencias: state.sector_preferencias, // []string
        habilidades: skillsTags, // []string
        disponibilidad: availability ? AVAILABILITY_MAP[availability] : "", // string esperado por el back
        biografia: state.biografia,
        links: linksArray, // []string
        perfil_completo:
          !!state.titulo_perfil &&
          (state.sector_preferencias?.length ?? 0) > 0 &&
          skillsTags.length > 0 &&
          !!availability &&
          !!state.biografia &&
          linksArray.length > 0,

        // 📸 Extras para la foto (el back los puede leer opcionalmente)
        // Si el back aún no soporta estos campos, los ignorará sin romper el bind.
        foto_perfil_base64: foto_base64, // solo la parte base64 (sin el prefijo data:)
        foto_perfil_mime: foto_mime,     // ej. "image/png"
        foto_perfil_data_url: foto_data_url, // opcional: dataURL completa por si la quieres usar
      };

      await fetch(`${API_BASE}/protected/completar-perfil`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).then(handleJson);

      // 3) Finalizar onboarding (si tu back lo requiere)
      
      if (onFinish) onFinish();
      else nav("/dashboard");
    } catch (e) {
      console.error(e);
      // El alert ya se muestra en handleJson cuando hay status no-OK
    }
  }

  if (!token || !userId) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold">Sesión requerida</h2>
        <p className="mt-2 text-sm text-foreground-light/70">
            Inicia sesión para configurar tu perfil.
          </p>
          <button
            onClick={() => nav("/login")}
            className="mt-4 px-5 h-10 rounded-full bg-primary text-white font-semibold hover:opacity-90"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-14">
      <div className="w-full max-w-3xl px-6">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Configura tu perfil
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Este paso mejora tu visibilidad en CameYa. Puedes editarlo luego.
          </p>
        </div>

        <Stepper step={step} total={total} />

        {step === 1 && (
          <StepShell
            title="Foto de perfil"
            description="Añade una imagen clara de tu rostro para generar confianza. (Obligatorio)"
            onNext={() => validateAndNext(1)}
            disableNext={false}
          >
            <ImageUploader
              label="Imagen"
              previewUrl={fotoPreview}
              onFile={(f: File | null) => setFotoPerfil(f)}
              error={errors.foto_perfil}
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="Perfil profesional (obligatorio)"
            description="Completa tu título, sectores, habilidades y disponibilidad."
            onBack={back}
            onNext={() => validateAndNext(2)}
          >
            <div className="space-y-6">
              {/* Sectores */}
              <div className="space-y-2">
                <span className="block text-sm font-semibold">Sectores de preferencia</span>
                <MultiSelectChips
                  options={SECTORES}
                  value={state.sector_preferencias}
                  onChange={(next) =>
                    setState((s) => ({ ...s, sector_preferencias: next as any }))
                  }
                  error={errors.sector_preferencias}
                />
              </div>

              {/* Título */}
              <label className="block w-full">
                <span className="block mb-1 text-sm font-semibold">Título de perfil</span>
                <input
                  className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Ej.: Estudiante de Sistemas | Frontend Jr."
                  value={state.titulo_perfil}
                  onChange={(e) => setState((s) => ({ ...s, titulo_perfil: e.target.value }))}
                />
                {errors.titulo_perfil && (
                  <p className="text-xs text-red-600 mt-1">{errors.titulo_perfil}</p>
                )}
              </label>

              {/* Habilidades */}
              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold">Habilidades (tags)</label>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Escribe una habilidad y presiona Enter (ej: Excel)"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={onSkillKeyDown}
                  />
                  <button
                    type="button"
                    onClick={addSkillFromInput}
                    className="px-3 h-10 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors text-sm"
                  >
                    Añadir
                  </button>
                </div>
                {localErr.habilidades && (
                  <p className="text-xs text-red-600 mt-1">{localErr.habilidades}</p>
                )}
                {skillsTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillsTags.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-sm"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          aria-label={`Eliminar ${s}`}
                          className="rounded-full px-1.5 hover:bg-primary/10"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">
                  Máximo 15 habilidades.
                </p>
              </div>

              {/* Disponibilidad */}
              <label className="block text-left w-full">
                <span className="block mb-1 text-sm font-semibold">Disponibilidad</span>
                <select
                  className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                  value={availability}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAvailability(isAvailabilityKey(v) ? v : "");
                  }}
                >
                  <option value="">Selecciona una opción</option>
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {localErr.disponibilidad && (
                  <p className="text-xs text-red-600 mt-1">{localErr.disponibilidad}</p>
                )}
              </label>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="Biografía y enlaces (obligatorios)"
            description="Cuéntales a los contratantes sobre ti y comparte enlaces relevantes."
            onBack={back}
            onNext={() => validateAndNext(3)}
          >
            <div className="space-y-4">
              <TextArea
                label="Biografía"
                value={state.biografia}
                onChange={(v: string) => setState((s) => ({ ...s, biografia: v }))}
                maxLength={500}
                rows={5}
                placeholder="Ej.: Soy estudiante de 6to semestre en ESPOL, con experiencia en Excel avanzado…"
                error={errors.biografia}
              />
              <LinkFields values={state.links} setValue={setLink} />
              {errors.links && <p className="text-xs text-red-600">{errors.links}</p>}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Revisión final"
            description="Verifica tu información. Podrás editarla después desde tu perfil."
            onBack={back}
            onNext={submitAll}
            nextLabel="Finalizar"
          >
            <ReviewSubmit
              data={{ ...state, habilidades: skillsTags, disponibilidad: availability }}
            />
          </StepShell>
        )}
      </div>
    </section>
  );
}
