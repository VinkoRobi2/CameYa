// src/dashboards/common/components/DashboardShell.tsx
import type { ReactNode } from "react";

interface DashboardShellProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export const DashboardShell = ({
  sidebar,
  header,
  children,
}: DashboardShellProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 border-r border-slate-800 bg-slate-900/70">
        {sidebar}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/70 px-4 py-3 flex items-center">
          {header}
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
