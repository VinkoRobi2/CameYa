// components/SimpleStepper.tsx

type SimpleStepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

export default function SimpleStepper({
  steps,
  currentStep,
  onStepClick,
}: SimpleStepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6 text-xs md:text-sm">
      {steps.map((label, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick?.(idx)}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] transition-colors ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : isCompleted
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-primary/30 text-foreground-light/70"
              }`}
            >
              {idx + 1}
            </button>
            <span
              className={`${
                isActive
                  ? "font-semibold text-foreground-light"
                  : "text-foreground-light/70"
              }`}
            >
              {label}
            </span>
            {idx !== steps.length - 1 && (
              <span className="w-6 h-px bg-primary/20" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
