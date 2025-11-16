// src/dashboards/students/components/JobCard.tsx
import type { Job } from "../../common/types";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
  onViewDetails: (job: Job) => void;
}

export const JobCard = ({ job, onApply, onSkip, onViewDetails }: JobCardProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md p-4 md:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
          {job.employerAvatarUrl ? (
            <img
              src={job.employerAvatarUrl}
              alt={job.employerName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-sky-300">
              {job.employerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {job.employerName}
          </p>
          <h2 className="text-base md:text-lg font-semibold">{job.title}</h2>
        </div>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <p className="text-sky-300 font-medium">{job.paymentLabel}</p>
        <p className="text-slate-300">{job.dateLabel}</p>
        <p className="text-slate-400 text-xs">{job.locationLabel}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] rounded-full bg-slate-800 px-2.5 py-1 text-slate-300 border border-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSkip(job)}
          className="flex-1 h-9 rounded-full border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          No me interesa
        </button>
        <button
          type="button"
          onClick={() => onViewDetails(job)}
          className="flex-1 h-9 rounded-full border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          Ver más info
        </button>
        <button
          type="button"
          onClick={() => onApply(job)}
          className="flex-1 h-9 rounded-full bg-sky-500 text-xs font-semibold text-white hover:bg-sky-600"
        >
          Postular
        </button>
      </div>
    </div>
  );
};
