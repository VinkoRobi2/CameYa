type Role = "worker" | "employer";

type Props = {
  role: Role;
  selected: boolean;
  onSelect: (r: Role) => void;
  title: string;
  desc: string;
  icon: string; // material symbol name
};

export default function RoleCard({ role, selected, onSelect, title, desc, icon }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`text-left w-full rounded-xl p-5 transition-colors border ${
        selected
          ? "bg-primary/10 border-primary"
          : "bg-primary/5 dark:bg-primary/10 border-primary/20 hover:border-primary/40"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selected ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <div className="font-display font-semibold">{title}</div>
          <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">{desc}</p>
        </div>
      </div>
    </button>
  );
}
