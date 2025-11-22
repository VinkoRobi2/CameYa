// src/dashboards/employers/pages/EmployerDashboard.tsx
import { useAuth } from "../../../auth/AuthContext";

export default function EmployerDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Cargando tu sesión...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Dashboard empleador
      </h1>
      <p className="mt-2">Bienvenido, {user?.nombre}</p>

      <p className="mt-4 text-sm text-gray-500">
        Perfil completo: {user?.perfil_completo ? "Sí" : "No"}
      </p>

      {/* Aquí va todo tu contenido real del dashboard */}
    </div>
  );
}
