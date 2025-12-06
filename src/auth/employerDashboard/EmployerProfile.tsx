// src/auth/employerDashboard/EmployerProfile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployerSidebar from "./EmployerSidebar";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";

interface EmployerProfileData {
  nombre: string;
  apellido: string;
  empresa: string;
  ruc: string;
  cedula: string;
  email: string;
  telefono: string;
  ciudad: string;
  sector_laboral: string[];
  biografia: string;
  links: string[];
  fecha_nacimiento: string;
  preferencias_categorias: string | string[];
  frase_corta: string;
  foto_perfil: string;
  whatsapp: string;
  linkedin: string;
  tipo_identidad: string;
  total_estudiantes_contratados: number;
  rating_promedio: number;
  total_trabajos_publicados: number;
  facebook_ig?: string;
  otros_links?: string;
}

/** Header con degradado tipo Figma */
interface EmployerProfileHeaderProps {
  isCompany: boolean;
  title: string;
  subtitle: string;
  location: string;
  avatarInitials: string;
  avatarUrl?: string | null;
  onEditClick?: () => void;
  onPreviewClick?: () => void;
}

const EmployerProfileHeader: React.FC<EmployerProfileHeaderProps> = ({
  isCompany,
  title,
  subtitle,
  location,
  avatarInitials,
  avatarUrl,
  onEditClick,
  onPreviewClick,
}) => {
  const mainLabel = isCompany ? "Company Profile" : "Employer Profile";
  const accountLabel = isCompany ? "Company Account" : "Employer Account";

  return (
    <section className="mb-10">
      {/* Banda superior con degradado */}
      <div className="relative">
        <div className="h-40 w-full rounded-3xl bg-gradient-to-r from-[#0A5FE3] to-[#00A14D]" />

        {/* Texto centrado en el header */}
        <div className="absolute inset-x-0 top-6 flex flex-col items-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-90">
            {mainLabel}
          </p>
          <p className="text-[11px] opacity-90 mt-1">{accountLabel}</p>
        </div>

        {/* Avatar flotando */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-2xl">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{avatarInitials || "EM"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta principal debajo del degradado */}
      <div className="mt-16 bg-white rounded-3xl shadow-sm border border-slate-200 px-6 py-6 md:px-10 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className="text-xs text-slate-400 mt-1">Ubicación: {location}</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 justify-center md:justify-end">
          <button
            type="button"
            onClick={onEditClick}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0A5FE3] to-[#00A14D] text-white text-sm font-medium shadow-sm hover:opacity-90 transition"
          >
            Editar perfil
          </button>
          <button
            type="button"
            onClick={onPreviewClick}
            className="px-5 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Vista previa
          </button>
        </div>
      </div>
    </section>
  );
};

const EmployerProfile: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Detectar modo (persona / empresa) desde auth_user
  const storedUserStr = localStorage.getItem("auth_user");
  let mode: "person" | "company" = "person";
  if (storedUserStr) {
    try {
      const u = JSON.parse(storedUserStr);
      const tipoIdentidad = u.tipo_identidad || u.TipoIdentidad;
      if (
        typeof tipoIdentidad === "string" &&
        tipoIdentidad.toLowerCase() === "empresa"
      ) {
        mode = "company";
      }
    } catch {
      mode = "person";
    }
  }

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edición
  const [isEditing, setIsEditing] = useState(false);
  const [telefonoInput, setTelefonoInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [fraseCortaInput, setFraseCortaInput] = useState("");
  const [prefsInput, setPrefsInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [facebookInput, setFacebookInput] = useState("");
  const [otrosLinksInput, setOtrosLinksInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // vista previa
  const [showPreview, setShowPreview] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-EC", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/protected/perfil-privado-empleadores`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({} as any));

        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            (data && (data.err as string)) ||
              (data && (data.error as string)) ||
              "Error al cargar el perfil de empleador."
          );
        }

        setProfile(data as EmployerProfileData);
      } catch (err: any) {
        setError(
          err?.message || "Ocurrió un error al cargar tu perfil de empleador."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  // Derivados para header
  const isCompany =
    profile?.tipo_identidad &&
    profile.tipo_identidad.toLowerCase() === "empresa";

  const getInitialsFromText = (text: string) => {
    if (!text) return "EM";
    const parts = text.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const headerTitle = profile
    ? isCompany && profile.empresa
      ? profile.empresa
      : `${profile.nombre || ""} ${profile.apellido || ""}`.trim() ||
        "Empleador CameYa"
    : "Empleador CameYa";

  const headerSubtitle = profile
    ? profile.frase_corta && profile.frase_corta.trim().length > 0
      ? profile.frase_corta
      : isCompany
      ? "Cuenta de empresa en CameYa"
      : "Cuenta de empleador en CameYa"
    : "Cuenta de empleador en CameYa";

  const headerLocation = profile?.ciudad || "Ciudad no especificada";

  const headerInitials = profile
    ? getInitialsFromText(
        isCompany && profile.empresa
          ? profile.empresa
          : `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
      )
    : "EM";

  const ratingText =
    profile && profile.rating_promedio > 0
      ? `${profile.rating_promedio.toFixed(1)} ⭐`
      : "Sin valoraciones aún";

  // Preferencias: JSON string o CSV
  const prefsArray =
    profile && profile.preferencias_categorias
      ? (() => {
          if (Array.isArray(profile.preferencias_categorias)) {
            return profile.preferencias_categorias;
          }
          const raw = String(profile.preferencias_categorias);
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed.map((p) => String(p).trim()).filter((p) => p);
            }
          } catch {
            // ignore
          }
          return raw
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
        })()
      : [];

  // Links: links[], linkedin, facebook_ig, otros_links
  const linkList: string[] = [];
  if (profile?.links && profile.links.length > 0) {
    linkList.push(...profile.links);
  }
  if (profile?.linkedin) {
    linkList.push(profile.linkedin);
  }
  if (profile?.facebook_ig) {
    linkList.push(profile.facebook_ig);
  }
  if (profile?.otros_links) {
    const extras = profile.otros_links
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    linkList.push(...extras);
  }
  const uniqueLinks = Array.from(new Set(linkList));

  // ---- edición ----
  const startEditing = () => {
    if (!profile) return;
    setTelefonoInput(profile.telefono || "");
    setWhatsappInput(profile.whatsapp || "");
    setFraseCortaInput(profile.frase_corta || "");
    setLinkedinInput(profile.linkedin || "");
    setFacebookInput(profile.facebook_ig || "");
    setOtrosLinksInput(profile.otros_links || "");

    const prefsCurrent = prefsArray.join(", ");
    setPrefsInput(prefsCurrent);

    setSaveError(null);
    setSaveSuccess(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const prefsArrayToSend =
      prefsInput.trim().length > 0
        ? prefsInput
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];

    const payload = {
      telefono: telefonoInput,
      whatsapp: whatsappInput,
      frase_corta: fraseCortaInput,
      preferencias_categorias: prefsArrayToSend,
      linkedin: linkedinInput,
      facebook_ig: facebookInput,
      otros_links: otrosLinksInput,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/protected/editar-perfil-empleador`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(
          (data && (data.error as string)) ||
            (data && (data.message as string)) ||
            "No se pudo actualizar la información."
        );
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              telefono: telefonoInput,
              whatsapp: whatsappInput,
              frase_corta: fraseCortaInput,
              preferencias_categorias: prefsArrayToSend,
              linkedin: linkedinInput,
              facebook_ig: facebookInput,
              otros_links: otrosLinksInput,
            }
          : prev
      );

      setSaveSuccess("Información actualizada correctamente.");
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(
        err?.message || "Ocurrió un error al actualizar la información."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 bg-slate-50 px-4 md:px-8 py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-slate-500">
                Cargando tu perfil de empleador...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* HEADER tipo Figma */}
              <EmployerProfileHeader
                isCompany={isCompany}
                title={headerTitle}
                subtitle={headerSubtitle}
                location={headerLocation}
                avatarInitials={headerInitials}
                avatarUrl={profile.foto_perfil}
                onEditClick={startEditing}
                onPreviewClick={() => setShowPreview(true)}
              />

              {/* STATS tipo 3 columnas */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">
                    CameYos publicados
                  </p>
                  <p className="text-2xl font-semibold">
                    {profile.total_trabajos_publicados}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">
                    Estudiantes contratados
                  </p>
                  <p className="text-2xl font-semibold">
                    {profile.total_estudiantes_contratados}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">
                    Valoración promedio
                  </p>
                  <p className="text-2xl font-semibold">{ratingText}</p>
                </div>
              </section>

              {/* Mensajes de update */}
              {saveError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {saveSuccess}
                </div>
              )}

              {/* FORM de edición */}
              {isEditing && (
                <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-8 shadow-sm">
                  <h2 className="text-sm font-semibold mb-3">
                    Editar información de contacto y preferencias
                  </h2>
                  <form className="space-y-4" onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={telefonoInput}
                          onChange={(e) => setTelefonoInput(e.target.value)}
                          placeholder="Número de teléfono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={whatsappInput}
                          onChange={(e) => setWhatsappInput(e.target.value)}
                          placeholder="Número de WhatsApp"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Frase corta
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={fraseCortaInput}
                        onChange={(e) => setFraseCortaInput(e.target.value)}
                        placeholder="Ej: Pequeña empresa local de cafetería"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Preferencias de categorías
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={prefsInput}
                        onChange={(e) => setPrefsInput(e.target.value)}
                        placeholder="Separadas por comas. Ej: Eventos, Retail, Logística"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={linkedinInput}
                          onChange={(e) => setLinkedinInput(e.target.value)}
                          placeholder="URL de tu perfil de LinkedIn"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Facebook / Instagram
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={facebookInput}
                          onChange={(e) => setFacebookInput(e.target.value)}
                          placeholder="Usuario o enlace principal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Otros links
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                        value={otrosLinksInput}
                        onChange={(e) => setOtrosLinksInput(e.target.value)}
                        placeholder="Otros enlaces relevantes (sitio web, portafolio, etc.)"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-60"
                      >
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* SOBRE EMPLEADOR + ÁREAS + LINKS (solo lectura) */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2 shadow-sm">
                  <h2 className="text-sm font-semibold mb-2">
                    Sobre el empleador
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {profile.biografia && profile.biografia.trim().length > 0
                      ? profile.biografia
                      : "Aquí aparecerá una breve descripción sobre ti o tu empresa cuando la completes en tu perfil."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-600">
                        Email:
                      </span>{" "}
                      {profile.email}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">
                        Teléfono:
                      </span>{" "}
                      {profile.telefono || "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">
                        WhatsApp:
                      </span>{" "}
                      {profile.whatsapp || "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">
                        Fecha de nacimiento:
                      </span>{" "}
                      {formatDate(profile.fecha_nacimiento)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-sm font-semibold mb-2">
                      Áreas de actividad
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {prefsArray.length > 0 ? (
                        prefsArray.map((p) => (
                          <span
                            key={p}
                            className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">
                          Aquí aparecerán las áreas en las que sueles publicar
                          CameYos.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold mb-2">
                      Sitio web / enlaces
                    </h2>
                    {uniqueLinks.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {uniqueLinks.map((link) => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-sm hover:underline break-all"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Aquí aparecerán tus enlaces o redes (por ejemplo,
                        LinkedIn) cuando las agregues en tu perfil.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* MODAL de vista previa */}
      {showPreview && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute right-3 top-3 h-7 w-7 rounded-full bg-white/80 border border-slate-200 text-xs flex items-center justify-center hover:bg-slate-100"
            >
              ✕
            </button>

            {/* Header preview */}
            <div className="h-28 bg-gradient-to-r from-[#0A5FE3] to-[#00A14D] relative flex items-center justify-center">
              <div className="absolute -bottom-10">
                <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-xl">
                  {profile.foto_perfil ? (
                    <img
                      src={profile.foto_perfil}
                      alt={headerTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{headerInitials}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-14 px-6 pb-6">
              <div className="text-center mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {headerTitle}
                </h2>
                <p className="text-sm text-slate-500">{headerSubtitle}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Así verán tu perfil los estudiantes.
                </p>
              </div>

              {/* Tarjetas principales tipo mockup: nombre empresa, ubicación, email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500 mb-1">
                    {isCompany ? "Nombre de la empresa" : "Nombre del empleador"}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {isCompany && profile.empresa
                      ? profile.empresa
                      : `${profile.nombre || ""} ${
                          profile.apellido || ""
                        }`.trim() || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500 mb-1">Ubicación</p>
                  <p className="text-sm font-medium text-slate-900">
                    {headerLocation}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 md:col-span-2">
                  <p className="text-[11px] text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-900 break-all">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Breve bio y categorías */}
              <div className="space-y-3 text-sm mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-1">
                    Sobre el empleador
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {profile.biografia && profile.biografia.trim().length > 0
                      ? profile.biografia
                      : "Este empleador aún no ha completado su biografía."}
                  </p>
                </div>
                {prefsArray.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 mb-1">
                      Áreas en las que suele contratar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {prefsArray.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats en preview */}
              <div className="grid grid-cols-3 gap-3 text-center mb-4 text-xs">
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">CameYos</p>
                  <p className="text-base font-semibold">
                    {profile.total_trabajos_publicados}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Estudiantes
                  </p>
                  <p className="text-base font-semibold">
                    {profile.total_estudiantes_contratados}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Rating</p>
                  <p className="text-base font-semibold">{ratingText}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium hover:opacity-90"
                >
                  Cerrar vista previa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerProfile;
