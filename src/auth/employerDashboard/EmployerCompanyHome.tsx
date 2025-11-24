// src/auth/employerDashboard/EmployerCompanyHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";

import EmployerSidebar from "./EmployerSidebar";
import EmployerProfileHeader from "./EmployerProfileHeader";
import EmployerStatsSection from "./EmployerStatsSection";
import EmployerAboutSection from "./EmployerAboutSection";

const EmployerCompanyHome: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedUserStr = localStorage.getItem("auth_user");
  let extra: any = {};
  if (storedUserStr) {
    try {
      extra = JSON.parse(storedUserStr);
    } catch {
      extra = {};
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/protected/perfil-privado-empleadores`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data && (data.message as string)) ||
              "No se pudo cargar el perfil de la empresa."
          );
          return;
        }

        setProfile(data);

        // opcional: mezclar con auth_user
        try {
          const prevStr = localStorage.getItem("auth_user");
          const prev = prevStr ? JSON.parse(prevStr) : {};
          localStorage.setItem(
            "auth_user",
            JSON.stringify({ ...prev, ...data })
          );
        } catch {
          // ignore
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  const data = profile || extra || {};

  const companyName =
    data.razon_social ||
    data.nombre_comercial ||
    user?.name ||
    "Tu empresa";
  const subtitle =
    data.area_actividad_principal || "Empresa usuaria de CameYa";
  const bio =
    data.descripcion_empresa ||
    data.biografia ||
    "Este es tu panel como empresa. Aquí verás tus CameYos publicados y el desempeño de tus estudiantes.";
  const location = data.ciudad || data.ubicacion || "Guayaquil";

  const prefsRaw = data.preferencias_categorias ?? [];
  const prefs: string[] = Array.isArray(prefsRaw)
    ? prefsRaw
        .map((s: any) => String(s).trim())
        .filter((s: string) => s.length > 0)
    : String(prefsRaw)
        .split(/[,|\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0) || ["Eventos", "Retail", "Logística"];

  const website = data.dominio_corporativo
    ? `https://${data.dominio_corporativo}`
    : "";

  const initials =
    companyName
      .split(" ")
      .filter(Boolean)
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EM";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-600">Cargando perfil de empresa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <EmployerSidebar mode="company" onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <EmployerProfileHeader
          initials={initials}
          title={companyName}
          subtitle={subtitle}
          location={location}
        />

        <EmployerStatsSection />

        <EmployerAboutSection bio={bio} prefs={prefs} website={website} />
      </main>
    </div>
  );
};

export default EmployerCompanyHome;
