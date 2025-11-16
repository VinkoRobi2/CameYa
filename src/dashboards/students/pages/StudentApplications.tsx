// src/dashboards/students/pages/StudentApplications.tsx
import type { JobApplication } from "../../common/types";
import { ApplicationsList } from "../components/ApplicationsList";

const mockApplications: JobApplication[] = [
  {
    id: "a1",
    status: "PENDIENTE",
    job: {
      id: "1",
      title: "Ayudante en evento universitario",
      employerName: "Club de Emprendimiento ESPOL",
      paymentLabel: "$25 · por día",
      dateLabel: "Sábado · 09:00–15:00",
      locationLabel: "ESPOL, Guayaquil",
      tags: ["Fin de semana", "Principiante OK"],
      mode: "PRESENCIAL",
    },
  },
  {
    id: "a2",
    status: "ACEPTADA",
    job: {
      id: "2",
      title: "Tutor de Matemáticas Básicas",
      employerName: "Familia Ramírez",
      paymentLabel: "$8 · por hora",
      dateLabel: "Viernes tarde",
      locationLabel: "Remoto",
      tags: ["Tutorías", "Remoto"],
      mode: "REMOTO",
    },
    contactWhatsapp: "+593900000000",
    contactEmail: "example@mail.com",
  },
];

export const StudentApplications = () => {
  const handleMarkCompleted = (applicationId: string) => {
    // Aquí luego harás PATCH/PUT a tu API
    console.log("Marcar como completado:", applicationId);
  };

  const handleOpenContact = (applicationId: string) => {
    const app = mockApplications.find((a) => a.id === applicationId);
    if (!app) return;

    if (app.contactWhatsapp) {
      // ejemplo muy simple: abriría WhatsApp web
      const phone = app.contactWhatsapp.replace(/[^\d]/g, "");
      window.open(`https://wa.me/${phone}`, "_blank");
    } else if (app.contactEmail) {
      window.location.href = `mailto:${app.contactEmail}`;
    }
  };

  const activeApplications = mockApplications.filter(
    (a) => a.status !== "COMPLETADA"
  );

  return (
    <div className="max-w-4xl mx-auto">
      <p className="mb-4 text-sm text-slate-300">
        Aquí ves el estado de cada postulación. Cuando un empleador te acepte,
        podrás ver su contacto.
      </p>

      <ApplicationsList
        applications={activeApplications}
        mode="active"
        onMarkCompleted={handleMarkCompleted}
        onOpenContact={handleOpenContact}
      />
    </div>
  );
};
