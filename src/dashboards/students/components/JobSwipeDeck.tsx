import { useState, useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import type { Job } from "../../common/types";
import { JobCard } from "./JobCard";
import { EmptyState } from "../../common/components/EmptyState";

interface JobSwipeDeckProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
  onViewDetails: (job: Job) => void;
}

type SwipeDirection = "left" | "right";

export const JobSwipeDeck = ({
  jobs,
  onApply,
  onSkip,
  onViewDetails,
}: JobSwipeDeckProps) => {
  const [deckJobs, setDeckJobs] = useState<Job[]>(jobs);

  // Si cambia la lista de trabajos (por filtros o API),
  // reseteamos el deck.
  useEffect(() => {
    setDeckJobs(jobs);
  }, [jobs]);

  const handleDecision = (job: Job, direction: SwipeDirection) => {
    if (direction === "right") {
      onApply(job);
    } else {
      onSkip(job);
    }
    setDeckJobs((prev) => prev.filter((j) => j.id !== job.id));
  };

  if (!deckJobs.length) {
    return (
      <EmptyState
        title="No hay trabajos con estos filtros"
        description="Prueba cambiando los filtros o vuelve más tarde. Nuevos empleos se publican con frecuencia."
      />
    );
  }

  // Mostramos como stack: solo las últimas 2 tarjetas para performance
  const visibleJobs = deckJobs.slice(-2);
  const total = jobs.length;
  const currentNumber = total - deckJobs.length + 1;

  return (
    <div className="relative flex w-full max-w-xl items-center justify-center min-h-[380px]">
      <AnimatePresence>
        {visibleJobs.map((job, index) => (
          <SwipeCard
            key={job.id}
            job={job}
            index={index}
            total={visibleJobs.length}
            onDecision={handleDecision}
            onViewDetails={onViewDetails}
          />
        ))}
      </AnimatePresence>

      {total > 1 && (
        <p className="absolute -bottom-6 text-xs text-slate-500">
          Trabajo {Math.min(currentNumber, total)} de {total}
        </p>
      )}
    </div>
  );
};

interface SwipeCardProps {
  job: Job;
  index: number;
  total: number;
  onDecision: (job: Job, direction: SwipeDirection) => void;
  onViewDetails: (job: Job) => void;
}

const SwipeCard = ({
  job,
  index,
  total,
  onDecision,
  onViewDetails,
}: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-16, 16]);
  const opacity = useTransform(x, [-260, 0, 260], [0, 1, 0]);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(
    null
  );

  const isTop = index === total - 1;

  const triggerSwipe = (direction: SwipeDirection) => {
    setSwipeDirection(direction);
    onDecision(job, direction);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      triggerSwipe("right");
    } else if (info.offset.x < -threshold) {
      triggerSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-xl"
      style={{
        x,
        rotate,
        opacity,
        zIndex: index + 1,
        scale: isTop ? 1 : 0.96,
        y: isTop ? 0 : 10,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: 0.9, opacity: 0, y: 40 }}
      animate={{ scale: isTop ? 1 : 0.97, opacity: 1, y: isTop ? 0 : 12 }}
      exit={{
        x:
          swipeDirection === "left"
            ? -500
            : swipeDirection === "right"
            ? 500
            : 0,
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
    >
      <JobCard
        job={job}
        onApply={() => triggerSwipe("right")}
        onSkip={() => triggerSwipe("left")}
        onViewDetails={onViewDetails}
      />
    </motion.div>
  );
};
