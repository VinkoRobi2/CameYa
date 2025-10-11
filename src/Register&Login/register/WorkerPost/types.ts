export type SectorKey = "general" | "eventos" | "tutorias" | "soporte" | "creativo" | "servicios";

export interface WorkerOnboardingState {
  foto_perfil: File | null;
  sector_preferencias: SectorKey[];
  biografia: string;
  titulo_perfil: string;
  links: { website?: string; linkedin?: string; github?: string; instagram?: string };
  saving: boolean;
}

export interface WorkerOnboardingErrors {
  foto_perfil?: string;
  sector_preferencias?: string;
  biografia?: string;
  titulo_perfil?: string;
  links?: string;
}
