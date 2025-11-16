// src/dashboards/students/common/components/DashboardShell.tsx
import type { ReactNode } from "react";

type DashboardShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      {/* Layout centrado como el resto de CameYa */}
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 md:px-6 py-10">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="h-full rounded-2xl border border-border bg-background-light/80 dark:bg-background-dark/80 shadow-sm">
            {sidebar}
          </div>
        </aside>

        {/* Columna principal */}
        <div className="flex-1 flex flex-col gap-4">
          <header className="rounded-2xl border border-border bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 md:px-6 md:py-4 shadow-sm">
            {header}
          </header>

          <main className="rounded-2xl border border-border bg-background-light/80 dark:bg-background-dark/80 px-4 py-4 md:px-6 md:py-6 shadow-sm flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile: el sidebar se usa como barra inferior */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background-light/95 dark:bg-background-dark/95 backdrop-blur md:hidden">
        {sidebar}
      </div>
    </div>
  );
}
