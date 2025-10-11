import type { SectorKey } from "../types";

export const SECTORES: { key: SectorKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "eventos", label: "Eventos" },
  { key: "tutorias", label: "Tutorías" },
  { key: "soporte", label: "Soporte / IT" },
  { key: "creativo", label: "Contenido / Creativo" },
  { key: "servicios", label: "Servicios varios" },
];

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
