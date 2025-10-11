import { useRef } from "react";
import { IMAGE_ACCEPT } from "../utils/constants";

interface Props {
  label: string;
  previewUrl: string | null;
  onFile: (file: File | null) => void;
  error?: string;
}

export default function ImageUploader({ label, previewUrl, onFile, error }: Props) {
  const ref = useRef<HTMLInputElement | null>(null);

  return (
    <div className="w-full">
      <span className="block mb-1 text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-xl border border-primary/20 overflow-hidden bg-primary/5 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-foreground-light/70">Sin imagen</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={ref}
            type="file"
            accept={IMAGE_ACCEPT}
            className="block w-full text-sm"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => {
              if (ref.current) ref.current.value = "";
              onFile(null);
            }}
            className="self-start text-xs underline text-foreground-light/70"
          >
            Quitar
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <p className="mt-1 text-[11px] text-foreground-light/70">JPG, PNG o WEBP. Máx. 5MB.</p>
    </div>
  );
}
