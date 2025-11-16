// src/dashboards/students/index.tsx
import { useState } from "react";
import { DashboardShell } from "../common/components/DashboardShell";
import { StudentSidebar, type StudentTab } from "./components/StudentSidebar";
import StudentHome from "./pages/StudentHome";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<StudentTab>("explorar");

  return (
    <DashboardShell
      sidebar={<StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      header={<Header activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {activeTab === "explorar" && <StudentHome />}
      {activeTab === "postulaciones" && (
        <div className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Aquí irán tus postulaciones.
        </div>
      )}
      {activeTab === "completados" && (
        <div className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Aquí verás tus trabajos completados.
        </div>
      )}
      {activeTab === "perfil" && (
        <div className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Aquí podrás ver y editar tu perfil público.
        </div>
      )}
    </DashboardShell>
  );
}

type HeaderProps = {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
};

const TABS: { id: StudentTab; label: string }[] = [
  { id: "explorar", label: "Explorar" },
  { id: "postulaciones", label: "Postulaciones" },
  { id: "completados", label: "Completados" },
  { id: "perfil", label: "Perfil" },
];

function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-display text-lg md:text-xl font-semibold tracking-tight">
          Hola, estudiante 👋
        </h1>
        <p className="text-xs md:text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Explora trabajos flash, revisa tus postulaciones y cuida tu reputación en CameYa.
        </p>
      </div>

      {/* Tabs solo en mobile / tablet; en desktop manda el sidebar */}
      <div className="mt-1 flex gap-2 md:hidden">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-transparent text-foreground-light/80 dark:text-foreground-dark/80 border-border hover:bg-primary/5",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
