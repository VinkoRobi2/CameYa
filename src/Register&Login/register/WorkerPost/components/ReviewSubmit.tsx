import type { WorkerOnboardingState } from "../types";
import { SECTORES } from "../utils/constants";

export default function ReviewSubmit({ data }: { data: WorkerOnboardingState }) {
  const sectorLabels = data.sector_preferencias
    .map((k) => SECTORES.find((s) => s.key === k)?.label || k)
    .join(", ");

  return (
    <div className="text-sm">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl overflow-hidden border border-primary/20 bg-primary/5">
          {data.foto_perfil ? (
            <img src={URL.createObjectURL(data.foto_perfil)} alt="pfp" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-foreground-light/70">Sin foto</div>
          )}
        </div>
        <div>
          <div><span className="font-semibold">Título:</span> {data.titulo_perfil || "—"}</div>
          <div><span className="font-semibold">Sectores:</span> {sectorLabels || "—"}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-semibold">Biografía</div>
        <p className="mt-1 whitespace-pre-wrap text-foreground-light/80">{data.biografia || "—"}</p>
      </div>

      <div className="mt-4">
        <div className="font-semibold">Links</div>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          {Object.entries(data.links).map(([k, v]) => v && (
            <li key={k}><span className="capitalize">{k}:</span> {v}</li>
          ))}
          {!Object.values(data.links).some(Boolean) && <li>—</li>}
        </ul>
      </div>
    </div>
  );
}
