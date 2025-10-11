
interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  disableNext?: boolean;
}
export default function StepShell({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Siguiente",
  backLabel = "Volver",
  disableNext,
}: Props) {
  return (
    <div className="rounded-2xl border border-primary/20 p-6 shadow-sm bg-background-light dark:bg-background-dark">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-foreground-light/70 dark:text-foreground-dark/70">{description}</p>
      )}
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={`px-4 h-10 rounded-full border border-primary/30 ${onBack ? "opacity-100" : "opacity-50 cursor-default"}`}
          disabled={!onBack}
        >
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 h-10 rounded-full bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
          disabled={disableNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
