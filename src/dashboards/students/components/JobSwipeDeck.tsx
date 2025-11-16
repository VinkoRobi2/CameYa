// src/dashboards/students/components/JobSwipeDeck.tsx
import { useState } from "react";
import type { Job } from "../../common/types";
import { JobCard } from "./JobCard";
import { EmptyState } from "../../common/components/EmptyState";

interface JobSwipeDeckProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
  onViewDetails: (job: Job) => void;
}

export const JobSwipeDeck = ({
  jobs,
  onApply,
  onSkip,
  onViewDetails,
}: JobSwipeDeckProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentJob = jobs[currentIndex];

  const handleApply = (job: Job) => {
    onApply(job);
    goNext();
  };

  const handleSkip = (job: Job) => {
    onSkip(job);
    goNext();
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev + 1 < jobs.length ? prev + 1 : prev
    );
  };

  if (!jobs.length) {
    return (
      <EmptyState
        title="No hay trabajos con estos filtros"
        description="Prueba cambiando los filtros o vuelve más tarde. Nuevos empleos se publican con frecuencia."
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <JobCard
        job={currentJob}
        onApply={handleApply}
        onSkip={handleSkip}
        onViewDetails={onViewDetails}
      />
      {jobs.length > 1 && (
        <p className="mt-3 text-xs text-slate-500">
          Trabajo {currentIndex + 1} de {jobs.length}
        </p>
      )}
    </div>
  );
};
