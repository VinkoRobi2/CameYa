import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface FiltersBarProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  modeFilter: string | null;
  onModeFilterChange: (value: string | null) => void;
}

const dateOptions = ["Hoy", "Este fin de semana", "Todos"];
const quickCategoryOptions = ["Eventos", "Tutorías"];
const modeOptions = ["Presencial", "Remoto"];

const basePill =
  "inline-flex items-center gap-1 rounded-full border text-xs px-3 py-1 transition";

export const FiltersBar = ({
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  modeFilter,
  onModeFilterChange,
}: FiltersBarProps) => {
  const handleDateClick = (opt: string) => {
    onDateFilterChange(opt);
  };

  const handleCategoryQuick = (opt: string) => {
    const isActive = categoryFilter === opt;
    onCategoryFilterChange(isActive ? null : opt);
  };

  const handleModeClick = (opt: string) => {
    const isActive = modeFilter === opt;
    onModeFilterChange(isActive ? null : opt);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Fecha */}
        {dateOptions.map((opt) => {
          const isActive = dateFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleDateClick(opt)}
              className={`${basePill} ${
                isActive
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}

        <span className="hidden h-5 w-px bg-slate-200 sm:block" />

        {/* Categorías: pill general + atajos */}
        <button
          type="button"
          onClick={() => onCategoryFilterChange(null)}
          className={`${basePill} bg-white border-slate-200 text-slate-600 hover:bg-slate-50`}
        >
          <span>Categorías</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {quickCategoryOptions.map((opt) => {
          const isActive = categoryFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleCategoryQuick(opt)}
              className={`${basePill} ${
                isActive
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}

        {/* Modalidad */}
        <button
          type="button"
          onClick={() => onModeFilterChange(null)}
          className={`${basePill} bg-white border-slate-200 text-slate-600 hover:bg-slate-50`}
        >
          <span>Modalidad</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {modeOptions.map((opt) => {
          const isActive = modeFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleModeClick(opt)}
              className={`${basePill} ${
                isActive
                  ? "bg-violet-500 text-white border-violet-500 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Botón "Todos los filtros" con ícono */}
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Todos los filtros</span>
      </button>
    </div>
  );
};
