// src/dashboards/common/components/StatusBadge.tsx
import type { ApplicationStatus } from "../types";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; classes: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    classes: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
  },
  ACEPTADA: {
    label: "Aceptada",
    classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
  },
  RECHAZADA: {
    label: "Rechazada",
    classes: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
  },
  COMPLETADA: {
    label: "Completada",
    classes: "bg-sky-500/10 text-sky-300 border border-sky-500/40",
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const cfg = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
};
