import { DashboardShell } from "../../common/components/DashboardShell";
import { EmployerSidebar } from "../components/EmployerSidebar";
import { EmployerDashboardHeader } from "../components/EmployerDashboardHeader";
import {
  EmployerProfileOverview,
} from "../components/EmployerProfileOverview";
import type {
  UserRatingSummary,
} from "../../common/types";

const mockRating: UserRatingSummary = {
  average: 4.9,
  totalRatings: 15,
};

const mockProfile = {
  name: "Café del Barrio",
  sector: "Restaurantes",
  location: "Buenos Aires, Argentina",
  description:
    "Somos un café de especialidad ubicado en el corazón de Palermo. Buscamos estudiantes enérgicos y apasionados por el buen servicio para unirse a nuestro equipo. Ofrecemos un ambiente de trabajo dinámico y oportunidades de crecimiento.",
  rating: mockRating,
};

const mockPosts = [
  {
    id: 1,
    title: "Barista para fines de semana",
    publishedAgoLabel: "Publicado hace 2 meses",
    status: "FINALIZADO" as const,
  },
  {
    id: 2,
    title: "Ayudante de cocina (turno tarde)",
    publishedAgoLabel: "Publicado hace 4 meses",
    status: "FINALIZADO" as const,
  },
  {
    id: 3,
    title: "Personal para evento especial",
    publishedAgoLabel: "Publicado hace 6 meses",
    status: "FINALIZADO" as const,
  },
];

const EmployerProfilePage = () => {
  // Aquí después puedes traer los datos reales con fetch/React Query/etc.
  const handleEditProfile = () => {
    // TODO: navegar al formulario de edición de perfil
  };

  const handleOpenPost = (postId: number | string) => {
    // TODO: navegar al detalle de la publicación
    console.log("Abrir publicación", postId);
  };

  return (
    <DashboardShell
      sidebar={<EmployerSidebar />}
      header={<EmployerDashboardHeader />}
    >
      <EmployerProfileOverview
        profile={mockProfile}
        posts={mockPosts}
        onEditProfile={handleEditProfile}
        onOpenPost={handleOpenPost}
      />
    </DashboardShell>
  );
};

export default EmployerProfilePage;
