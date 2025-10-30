export type SectorKey =
  | "general"
  | "eventos"
  | "tutorias"
  | "soporte"
  | "creativo"
  | "servicios"
  | "otros";

/** Disponibilidad seleccionable en WorkerPost */
export type AvailabilityKey = "part-time" | "weekends" | "fulltime-short";

export interface WorkerOnboardingState {
  /** Paso 1 */
  foto_perfil: File | null;

  /** Paso 2 */
  sector_preferencias: SectorKey[];
  titulo_perfil: string;

  /** NUEVO en onboarding (antes estaba en register) */
  habilidades?: string[];                // e.g. ["Excel", "Figma"]
  disponibilidad?: AvailabilityKey | ""; // "" mientras no haya selección

  /** Paso 3 */
  biografia: string;
  links: {
    website?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };

  /** Meta */
  saving: boolean;
}

export interface WorkerOnboardingErrors {
  foto_perfil?: string;
  sector_preferencias?: string;
  biografia?: string;
  titulo_perfil?: string;
  links?: string;
  // Nota: habilidades/disponibilidad se validan localmente en WorkerPost
}
