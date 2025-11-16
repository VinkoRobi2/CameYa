// src/dashboards/students/index.tsx
import { useState } from "react";
import { DashboardShell } from "../common/components/DashboardShell";
import type { UserRatingSummary } from "../common/types";
import { RatingStars } from "../common/components/RatingStars";
import { StudentSidebar } from "./components/StudentSidebar";
import { StudentHome } from "./pages/StudentHome";
import { StudentApplications } from "./pages/StudentApplications";
import { StudentProfile } from "./pages/StudentProfile";
import { StudentCompleted } from "./pages/StudentCompleted";

export type StudentTab = "home" | "applications" | "completed" | "profile";

const mockRating: UserRatingSummary = {
  average: 4.8,
  totalRatings: 15,
};

const getTabTitle = (tab: StudentTab): string => {
  switch (tab) {
    case "home":
      return "Explorar trabajos";
    case "applications":
      return "Mis postulaciones";
    case "completed":
      return "Trabajos completados";
    case "profile":
      return "Mi perfil";
    default:
      return "";
  }
};

const getTabSubtitle = (tab: StudentTab): string => {
  switch (tab) {
    case "home":
      return "Encuentra trabajos rápidos y postula en minutos.";
    case "applications":
      return "Revisa el estado de cada postulación fácilmente.";
    case "completed":
      return "Lleva el registro de los trabajos que ya realizaste.";
    case "profile":
      return "Ajusta la información que verán los empleadores.";
    default:
      return "";
  }
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<StudentTab>("home");

  const header = (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            {getTabSubtitle(activeTab)}
          </p>
        </div>
        <div className="hidden sm:block">
          <RatingStars rating={mockRating} size="sm" />
        </div>
      </div>

      {/* Navegación móvil (tabs simples) */}
      <div className="mt-2 flex gap-2 md:hidden overflow-x-auto">
        {[
          { id: "home", label: "Inicio" },
          { id: "applications", label: "Postulaciones" },
          { id: "completed", label: "Completados" },
          { id: "profile", label: "Perfil" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id as StudentTab)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium border ${
              activeTab === item.id
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <StudentHome />;
      case "applications":
        return <StudentApplications />;
      case "completed":
        return <StudentCompleted />;
      case "profile":
        return <StudentProfile rating={mockRating} />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell
      sidebar={<StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      header={header}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default StudentDashboard;
