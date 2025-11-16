// src/dashboards/students/components/ApplicationsList.tsx
import type { JobApplication } from "../../common/types";
import { StatusBadge } from "../../common/components/StatusBadge";

interface ApplicationsListProps {
  applications: JobApplication[];
  mode: "active" | "completed";
  onMarkCompleted?: (applicationId: string) => void;
  onOpenContact?: (applicationId: string) => void;
}

export const ApplicationsList = ({
  applications,
  mode,
  onMarkCompleted,
  onOpenContact,
}: ApplicationsListProps) => {
  if (!applications.length) {
    const msg =
      mode === "active"
        ? "Todavía no has postulado a ningún trabajo."
        : "Aún no tienes trabajos completados.";
    const hint =
      mode === "active"
        ? "Ve a la pestaña Inicio y explora los trabajos disponibles."
        : "Cuando completes trabajos, aparecerán aquí para que veas tu historial.";
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-slate-200">{msg}</p>
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 md:p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {app.job.employerName}
              </p>
              <p className="text-sm md:text-base font-semibold">
                {app.job.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {app.job.dateLabel} · {app.job.locationLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={app.status} />
            </div>
          </div>

          {mode === "active" && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {app.status === "ACEPTADA" && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenContact?.(app.id)}
                    className="rounded-full px-3 py-1 bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                  >
                    Abrir contacto
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkCompleted?.(app.id)}
                    className="rounded-full px-3 py-1 border border-sky-500 text-sky-300 font-medium hover:bg-sky-500/10"
                  >
                    Marcar como completado
                  </button>
                </>
              )}
              {app.status === "PENDIENTE" && (
                <p className="text-slate-400">
                  El empleador aún no responde tu postulación.
                </p>
              )}
              {app.status === "RECHAZADA" && (
                <p className="text-slate-400">
                  Esta postulación fue rechazada. No te desanimes, sigue
                  aplicando.
                </p>
              )}
            </div>
          )}

          {mode === "completed" && (
            <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-2">
              <span>Completado el: {app.completedAt ?? "Fecha por definir"}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
