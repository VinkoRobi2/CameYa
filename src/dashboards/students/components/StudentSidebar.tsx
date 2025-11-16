// src/dashboards/students/components/StudentSidebar.tsx
import {
  Home,
  ListChecks,
  CheckCircle2,
  User,
} from "lucide-react";

export type StudentTab = "explorar" | "postulaciones" | "completados" | "perfil";

type Props = {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
};

const TABS: { id: StudentTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "explorar", label: "Explorar trabajos", icon: Home },
  { id: "postulaciones", label: "Mis postulaciones", icon: ListChecks },
  { id: "completados", label: "Trabajos completados", icon: CheckCircle2 },
  { id: "perfil", label: "Mi perfil", icon: User },
];

export function StudentSidebar({ activeTab, onTabChange }: Props) {
  return (
    <>
      {/* Desktop: sidebar vertical */}
      <nav className="hidden md:flex h-full flex-col justify-between p-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-foreground-light/60 dark:text-foreground-dark/60">
              Navegación
            </p>
          </div>

          <ul className="space-y-2">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(id)}
                    className={[
                      "flex w-full items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-transparent text-foreground-light/80 dark:text-foreground-dark/80 border-border hover:bg-primary/5",
                    ].join(" ")}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background-light/80 dark:bg-background-dark/80">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-left">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
          <p>CameYa · el trabajo que llega ya.</p>
        </div>
      </nav>

      {/* Mobile: barra inferior */}
      <nav className="flex md:hidden items-center justify-around px-2 py-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-1 px-2 py-1"
            >
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs transition",
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background-light dark:bg-background-dark border-border text-foreground-light/70 dark:text-foreground-dark/70",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] leading-tight text-foreground-light/70 dark:text-foreground-dark/70">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
