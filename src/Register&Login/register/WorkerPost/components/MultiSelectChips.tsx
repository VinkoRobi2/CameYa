interface Props {
  options: { key: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}
export default function MultiSelectChips({ options, value, onChange, error }: Props) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((op) => (
          <button
            key={op.key}
            type="button"
            onClick={() => toggle(op.key)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
              value.includes(op.key) ? "border-primary bg-primary text-white" : "border-primary/30 hover:bg-primary/5"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
