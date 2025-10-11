
export default function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6" aria-label={`Paso ${step} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : "bg-primary/20"}`}
        />
      ))}
    </div>
  );
}
