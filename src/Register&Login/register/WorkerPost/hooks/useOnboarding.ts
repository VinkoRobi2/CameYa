import { useState } from "react";
import type { WorkerOnboardingState, WorkerOnboardingErrors, SectorKey } from "../types";
import { IMAGE_MAX_BYTES } from "../utils/constants";

export function useOnboarding(initial?: Partial<WorkerOnboardingState>) {
  const [state, setState] = useState<WorkerOnboardingState>({
    foto_perfil: null,
    sector_preferencias: [],
    biografia: "",
    titulo_perfil: "",
    links: {},
    saving: false,
    ...initial,
  });
  const [errors, setErrors] = useState<WorkerOnboardingErrors>({});

  const setFotoPerfil = (file: File | null) => setState((s) => ({ ...s, foto_perfil: file }));
  const toggleSector = (key: SectorKey) =>
    setState((s) => ({
      ...s,
      sector_preferencias: s.sector_preferencias.includes(key)
        ? s.sector_preferencias.filter((k) => k !== key)
        : [...s.sector_preferencias, key],
    }));

  const setLink = (k: keyof WorkerOnboardingState["links"], v: string) =>
    setState((s) => ({ ...s, links: { ...s.links, [k]: v } }));

  // TODOS OBLIGATORIOS
  const validate = (requirePhoto = true) => {
    const err: WorkerOnboardingErrors = {};

    if (requirePhoto && !state.foto_perfil) err.foto_perfil = "Sube una foto de perfil";
    if (state.foto_perfil && state.foto_perfil.size > IMAGE_MAX_BYTES)
      err.foto_perfil = "La imagen supera 5MB";

    if (!state.sector_preferencias.length) err.sector_preferencias = "Selecciona al menos un sector";

    if (!state.titulo_perfil.trim()) err.titulo_perfil = "Ingresa un título de perfil";
    else if (state.titulo_perfil.length > 80) err.titulo_perfil = "Máximo 80 caracteres";

    if (!state.biografia.trim()) err.biografia = "Ingresa tu biografía";
    else if (state.biografia.length > 500) err.biografia = "Máximo 500 caracteres";

    const hasAnyLink = Object.values(state.links || {}).some((v) => !!v);
    if (!hasAnyLink) err.links = "Añade al menos un enlace (web, LinkedIn, GitHub o Instagram)";

    setErrors(err);
    return err;
  };

  return { state, setState, errors, setErrors, setFotoPerfil, toggleSector, setLink, validate };
}
