// src/dashboards/common/types.ts

export type ApplicationStatus =
  | "PENDIENTE"
  | "ACEPTADA"
  | "RECHAZADA"
  | "COMPLETADA";

export interface Job {
  id: string;
  title: string;
  employerName: string;
  employerAvatarUrl?: string;
  paymentLabel: string;   // ej: "$25 por día"
  dateLabel: string;      // ej: "Sábado 23 · 08:00–13:00"
  locationLabel: string;  // ej: "ESPOL, Guayaquil"
  tags: string[];         // ej: ["Fin de semana", "Principiante OK"]
  mode?: "PRESENCIAL" | "REMOTO" | "MIXTO";
}

export interface JobApplication {
  id: string;
  job: Job;
  status: ApplicationStatus;
  scheduledAt?: string;       // texto legible o ISO
  contactWhatsapp?: string;
  contactEmail?: string;
  completedAt?: string;
}

export interface UserRatingSummary {
  average: number;      // 0–5
  totalRatings: number;
}
