// src/dashboards/students/components/FiltersBar.tsx

interface FiltersBarProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  modeFilter: string | null;
  onModeFilterChange: (value: string | null) => void;
}

const dateOptions = ["Todos", "Hoy", "Este fin de semana"];
const categoryOptions = ["Eventos", "Logística", "Tutorías", "Otros"];
const modeOptions = ["Presencial", "Remoto"];

export const FiltersBar = ({
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  modeFilter,
  onModeFilterChange,
}: FiltersBarProps) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 mr-1">Fecha:</span>
        {dateOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onDateFilterChange(opt)}
            className={`text-xs rounded-full px-3 py-1 border transition ${
              dateFilter === opt
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 mr-1">Categoría:</span>
        {categoryOptions.map((opt) => {
          const isActive = categoryFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onCategoryFilterChange(isActive ? null : opt)}
              className={`text-xs rounded-full px-3 py-1 border transition ${
                isActive
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 mr-1">Modalidad:</span>
        {modeOptions.map((opt) => {
          const isActive = modeFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onModeFilterChange(isActive ? null : opt)}
              className={`text-xs rounded-full px-3 py-1 border transition ${
                isActive
                  ? "bg-violet-500 text-white border-violet-500"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
