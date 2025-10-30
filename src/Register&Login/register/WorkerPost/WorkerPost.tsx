import { useMemo, useState, useEffect } from "react";
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

  // Token + userId desde el JWT
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
  const claims = decodeJWT(token);
  const idClaim = (claims?.user_id ?? claims?.sub ?? claims?.uid ?? claims?.id);
  const userId = userIdProp ?? (idClaim != null ? String(idClaim) : undefined);

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
   * - Paso 2: sectores + título obligatorios
   * - Paso 3: bio + al menos un link obligatorios
   */
  function validateAndNext(current: number) {
    const err = validate(current === 1); // en el paso 1 validamos foto obligatoria
    if (current === 1 && err.foto_perfil) return;
    if (current === 2 && (err.sector_preferencias || err.titulo_perfil)) return;
    if (current === 3 && (err.biografia || err.links)) return;
    next();
  }

  /**
   * ✅ ÚNICO momento en que se llama a la API.
   * Ejecuta todo al final, en orden:
   *  1) (opcional) Subida de foto
   *  2) Patch de sectores + título
   *  3) Patch de bio + links (+ título por coherencia)
   *  4) Finaliza onboarding
   *
   * Si prefieres un solo endpoint “batch”, marca esto en backend y aquí
   * podemos enviar un solo FormData con todo.
   */
  async function submitAll() {
    if (!userId) return;

    // Validación global antes de enviar
    const err = validate(true);
    if (
      err.foto_perfil ||
      err.sector_preferencias ||
      err.titulo_perfil ||
      err.biografia ||
      err.links
    ) {
      // Si hay errores, regresamos al primer paso con error para que el usuario lo corrija
      if (err.foto_perfil) setStep(1);
      else if (err.sector_preferencias || err.titulo_perfil) setStep(2);
      else if (err.biografia || err.links) setStep(3);
      return;
    }

    try {
      // 1) Foto (si existe)
      if (state.foto_perfil) {
        const fd = new FormData();
        fd.append("foto_perfil", state.foto_perfil);
        await fetch(`${API_BASE}/api/users/${userId}/foto_perfil`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }, // no seteamos Content-Type, el navegador lo hace
          body: fd,
        }).then(handleJson);
      }

      // 2) Sectores + título
      await fetch(`${API_BASE}/api/users/${userId}/sector_preferencias`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sector_preferencias: state.sector_preferencias,
          titulo_perfil: state.titulo_perfil,
        }),
      }).then(handleJson);

      // 3) Bio + links (+ título por coherencia)
      await fetch(`${API_BASE}/api/users/${userId}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          biografia: state.biografia,
          links: state.links,
          titulo_perfil: state.titulo_perfil,
        }),
      }).then(handleJson);

      // 4) Finalizar onboarding
      await fetch(`${API_BASE}/api/users/${userId}/profile-finalize`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed_onboarding: true }),
      }).then(handleJson);

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
            title="Sectores de preferencia y título (obligatorios)"
            description="Elige en qué áreas prefieres trabajar y define un título corto para tu perfil."
            onBack={back}
            onNext={() => validateAndNext(2)}
          >
            <div className="space-y-4">
              <MultiSelectChips
                options={SECTORES}
                value={state.sector_preferencias}
                onChange={(next) => setState((s) => ({ ...s, sector_preferencias: next as any }))}
                error={errors.sector_preferencias}
              />
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
            <ReviewSubmit data={state} />
          </StepShell>
        )}
      </div>
    </section>
  );
}
