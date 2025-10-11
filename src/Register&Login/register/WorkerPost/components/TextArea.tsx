interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  error?: string;
}
export default function TextArea({ label, value, onChange, rows = 4, maxLength, placeholder, error }: Props) {
  return (
    <label className="block w-full">
      <span className="block mb-1 text-sm font-semibold">{label}</span>
      <textarea
        className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1 flex justify-between text-[11px] text-foreground-light/70">
        <span />
        {maxLength && <span>{value.length}/{maxLength}</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </label>
  );
}
