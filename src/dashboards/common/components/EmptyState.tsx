// src/dashboards/common/components/EmptyState.tsx
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-slate-400 max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
