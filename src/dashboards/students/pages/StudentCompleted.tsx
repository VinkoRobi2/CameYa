// src/dashboards/students/pages/StudentCompleted.tsx
import type { JobApplication } from "../../common/types";
import { ApplicationsList } from "../components/ApplicationsList";

const mockCompleted: JobApplication[] = [
  {
    id: "c1",
    status: "COMPLETADA",
    completedAt: "12 octubre 2025",
    job: {
      id: "3",
      title: "Apoyo en feria de orientación",
      employerName: "Facultad de Ingeniería",
      paymentLabel: "$30 · por día",
      dateLabel: "12 octubre",
      locationLabel: "ESPOL, Campus Prosperina",
      tags: ["Eventos", "Fin de semana"],
      mode: "PRESENCIAL",
    },
  },
];

export const StudentCompleted = () => {
  const totalEarned = 30; // cuando conectes, calcularás la suma real

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Historial de trabajos completados
          </p>
          <p className="text-xs text-slate-400">
            Usa esto como referencia de experiencia e ingresos.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs">
          <p className="text-slate-400">Ingresos aproximados</p>
          <p className="text-sm font-semibold text-emerald-300">
            ${totalEarned.toFixed(2)}
          </p>
        </div>
      </div>

      <ApplicationsList applications={mockCompleted} mode="completed" />
    </div>
  );
};
