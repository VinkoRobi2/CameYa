import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Users2,
  UserCircle2,
} from "lucide-react";
import { DashboardShell } from "../common/components/DashboardShell";

export type EmployerTab = "publicar" | "mis-trabajos" | "postulaciones" | "perfil";

const TABS: { id: EmployerTab; label: string }[] = [
  { id: "publicar", label: "Publicar trabajos" },
  { id: "mis-trabajos", label: "Mis publicaciones" },
  { id: "postulaciones", label: "Postulaciones recibidas" },
  { id: "perfil", label: "Mi perfil" },
];

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState<EmployerTab>("publicar");
  const navigate = useNavigate();

  return (
    <DashboardShell
      sidebar={
        <EmployerSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      }
      header={<Header activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {/* CONTENIDO PRINCIPAL SEGÚN TAB */}
      {activeTab === "publicar" && <PublishTab navigate={navigate} />}
      {activeTab === "mis-trabajos" && <MyJobsTab />}
      {activeTab === "postulaciones" && <ApplicationsTab />}
      {activeTab === "perfil" && <EmployerProfileTab />}
    </DashboardShell>
  );
}

/* ================= SIDEBAR ================= */

type SidebarProps = {
  activeTab: EmployerTab;
  onTabChange: (tab: EmployerTab) => void;
};

const EmployerSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="flex h-full flex-col justify-between border-r border-slate-200 bg-slate-50/60 px-4 py-6">
      <div className="space-y-6">
        {/* Logo / título mini */}
        <div className="space-y-1 px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            CameYa
          </p>
          <p className="text-sm font-semibold text-slate-900">
            Para empleadores
          </p>
        </div>

        {/* Navegación */}
        <nav className="space-y-1 text-sm">
          <SidebarItem
            icon={Briefcase}
            label="Publicar trabajos"
            active={activeTab === "publicar"}
            onClick={() => onTabChange("publicar")}
          />
          <SidebarItem
            icon={FileText}
            label="Mis publicaciones"
            active={activeTab === "mis-trabajos"}
            onClick={() => onTabChange("mis-trabajos")}
          />
          <SidebarItem
            icon={Users2}
            label="Postulaciones recibidas"
            active={activeTab === "postulaciones"}
            onClick={() => onTabChange("postulaciones")}
          />
          <SidebarItem
            icon={UserCircle2}
            label="Mi perfil"
            active={activeTab === "perfil"}
            onClick={() => onTabChange("perfil")}
          />
        </nav>
      </div>

      <div className="px-1">
        <p className="text-[10px] text-slate-400">
          CameYa · conecta talento universitario con tus proyectos.
        </p>
      </div>
    </aside>
  );
};

type SidebarItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-xs font-medium transition",
        active
          ? "bg-primary text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

/* ================= HEADER ================= */

type HeaderProps = {
  activeTab: EmployerTab;
  onTabChange: (tab: EmployerTab) => void;
};

const Header = ({ activeTab }: HeaderProps) => {
  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-display text-lg md:text-xl font-semibold tracking-tight">
          Hola, empleador 👋
        </h1>
        <p className="text-xs md:text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Publica trabajos flash, revisa postulaciones y gestiona tu reputación en CameYa.
        </p>
      </div>

      <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500">
        Sección actual:{" "}
        <span className="font-semibold text-slate-800">
          {currentTab?.label ?? "Publicar trabajos"}
        </span>
      </div>
    </div>
  );
};

/* ================= TABS CONTENT ================= */

type PublishTabProps = {
  navigate: ReturnType<typeof useNavigate>;
};

const PublishTab = ({ navigate }: PublishTabProps) => {
  const goToPostJob = () => {
    // Ruta donde tengas el formulario EmployerPost (ajústala si es distinta)
    navigate("/register/employer/post");
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Publica tu próximo trabajo flash
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Crea una vacante corta y clara. Los estudiantes verán tu publicación
          en la vista tipo “Tinder” de CameYa y podrán postular en pocos segundos.
        </p>
        <button
          type="button"
          onClick={goToPostJob}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          Publicar nuevo trabajo
        </button>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-xs text-slate-500">
        Más adelante aquí podrás ver un resumen rápido de tus últimos trabajos
        publicados, postulaciones recientes y métricas básicas.
      </div>
    </section>
  );
};

const MyJobsTab = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Mis publicaciones
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Aquí verás el listado de trabajos que has publicado en CameYa.
          Podrás pausar, editar o cerrar cada uno.
        </p>
      </div>
    </section>
  );
};

const ApplicationsTab = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Postulaciones recibidas
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Cuando los estudiantes postulen a tus trabajos, aquí podrás revisar
          sus perfiles, filtrar y elegir quién realiza cada tarea.
        </p>
      </div>
    </section>
  );
};

const EmployerProfileTab = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Mi perfil</h2>
        <p className="mt-2 text-sm text-slate-600">
          Esta sección será tu perfil público como empleador: nombre de empresa,
          logo, sector, reseñas de trabajos anteriores y datos de contacto.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Por ahora es un placeholder. Cuando definamos el modelo de datos de
          empleador le conectamos el backend igual que al perfil de estudiante.
        </p>
      </div>
    </section>
  );
};
