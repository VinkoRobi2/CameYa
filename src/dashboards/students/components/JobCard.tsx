import type { Job } from "../../common/types";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
  onViewDetails: (job: Job) => void;
}

export const JobCard = ({
  job,
  onApply,
  onSkip,
  onViewDetails,
}: JobCardProps) => {
  const employerInitial = job.employerName.charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg">
      {/* “Hero” de la tarjeta: logo + título sobre gradiente */}
      <div className="relative h-64 bg-slate-900">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 0 0, rgba(10,95,227,0.55), transparent 55%), radial-gradient(circle at 100% 100%, rgba(0,161,77,0.45), transparent 55%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 overflow-hidden text-xs font-semibold text-sky-100">
            {job.employerAvatarUrl ? (
              <img
                src={job.employerAvatarUrl}
                alt={job.employerName}
                className="h-full w-full object-cover"
              />
            ) : (
              employerInitial
            )}
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-100">
            {job.employerName}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 pt-10">
          <h2 className="text-xl md:text-2xl font-semibold text-white leading-tight">
            {job.title}
          </h2>
        </div>
      </div>

      {/* Detalle inferior: chips + botones */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            Pago: {job.paymentLabel}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {job.dateLabel}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {job.locationLabel}
          </span>
        </div>

        {job.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onSkip(job)}
            className="flex-1 h-10 rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600"
          >
            No me interesa
          </button>
          <button
            type="button"
            onClick={() => onApply(job)}
            className="flex-1 h-10 rounded-full bg-primary text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Postular
          </button>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(job)}
          className="text-[11px] font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Ver detalles del trabajo
        </button>
      </div>
    </div>
  );
};
