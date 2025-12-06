import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";
import StudentProfileHeader from "./StudentProfileHeader";

const StudentProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edición
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [editBio, setEditBio] = useState("");
  const [editAvailability, setEditAvailability] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editLinks, setEditLinks] = useState("");
  const [editPhotoBase64, setEditPhotoBase64] = useState<string | null>(null);

  // 👇 nuevo: control de vista previa
  const [showPreview, setShowPreview] = useState(false);

  const storedUserStr =
    typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;

  let localExtra: any = {};
  if (storedUserStr) {
    try {
      localExtra = JSON.parse(storedUserStr);
    } catch {
      localExtra = {};
    }
  }

  const cleanItem = (raw: string): string =>
    raw.replace(/^[{\s"]+/, "").replace(/[}"\s]+$/, "");

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingProfile(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/protected/perfil-privado-estudiante`,
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
            "No se pudo cargar tu perfil."
        );
        return;
      }

      setProfile(data);

      try {
        const prevStr = localStorage.getItem("auth_user");
        const prev = prevStr ? JSON.parse(prevStr) : {};
        localStorage.setItem("auth_user", JSON.stringify({ ...prev, ...data }));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoadingProfile(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const data = profile || localExtra || {};

  const displayName =
    (data.nombre || data.apellido
      ? `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim()
      : "") ||
    user?.name ||
    "Estudiante CameYa";

  let subtitle = "";
  if (data.carrera && data.universidad) {
    subtitle = `${data.carrera} en ${data.universidad}`;
  } else if (data.carrera) {
    subtitle = data.carrera;
  } else if (data.universidad) {
    subtitle = String(data.universidad);
  } else {
    subtitle = "Estudiante universitario CameYa";
  }

  const bio =
    data.biografia ||
    data.bibiografia ||
    "Aquí irá tu biografía completa. En cuanto se vaya enriqueciendo tu perfil, se mostrará aquí.";

  const availability =
    data.disponibilidad_de_tiempo ||
    data.disponibilidad ||
    "Solo fines de semana";

  const habilidadesRaw = data.habilidades_basicas ?? data.habilidades ?? [];
  const habilidadesList: string[] = Array.isArray(habilidadesRaw)
    ? habilidadesRaw
        .flatMap((item: any) =>
          String(item)
            .split(/[,|\n]/)
            .map((s) => cleanItem(s))
        )
        .filter((s: string) => s.length > 0)
    : String(habilidadesRaw)
        .split(/[,|\n]/)
        .map((s: string) => cleanItem(s))
        .filter((s: string) => s.length > 0);

  const linksRaw = data.links ?? data.enlaces;
  const links: string[] = Array.isArray(linksRaw)
    ? linksRaw
        .map((l: any) => cleanItem(String(l)))
        .filter((s: string) => s.length > 0)
    : linksRaw
    ? String(linksRaw)
        .split(/[,|\n]/)
        .map((s: string) => cleanItem(s))
        .filter((s: string) => s.length > 0)
    : [];

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const photoUrl: string | null =
    (typeof data.foto_perfil === "string" && data.foto_perfil.length > 0
      ? data.foto_perfil
      : null) || null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleOpenEdit = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setEditBio(bio || "");
    setEditAvailability(availability || "");
    setEditSkills(habilidadesList.join(", "));
    setEditLinks(links.join(", "));
    setEditPhotoBase64(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      setEditPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const habilidadesArray = editSkills
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const body: any = {
        biografia: editBio,
        disponibilidad: editAvailability,
        habilidades: habilidadesArray,
        enlaces: editLinks,
      };

      if (editPhotoBase64) {
        body.fotoPerfilBase64 = editPhotoBase64;
      }

      const res = await fetch(
        `${API_BASE_URL}/protected/editar-perfil-estudiante`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const dataRes = await res.json().catch(() => ({}));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(
          (dataRes && (dataRes.error || dataRes.message)) ||
            "No se pudo guardar tu perfil."
        );
      }

      setSaveSuccess("Perfil actualizado correctamente.");
      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
      console.error(err);
      setSaveError(
        err?.message || "Error al guardar tu perfil. Intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-600">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 bg-slate-50 px-4 md:px-8 py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {saveSuccess && !isEditing && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-700">
              {saveSuccess}
            </div>
          )}

          {/* Header con botón de vista previa */}
          <StudentProfileHeader
            initials={initials}
            displayName={displayName}
            subtitle={subtitle}
            photoUrl={photoUrl}
            onEditClick={handleOpenEdit}
            onPreviewClick={() => setShowPreview(true)} // 👈 aquí se abre
          />

          {/* Form de edición */}
          {isEditing && (
            <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-8 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Editar perfil</h2>

              {saveError && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Biografía
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 resize-none"
                    placeholder="Cuenta quién eres, qué estudias y qué tipo de trabajos te interesan."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Disponibilidad
                  </label>
                  <input
                    type="text"
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                    placeholder="Ej: Fines de semana / Tardes entre semana"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Esta información se mostrará a los empleadores para saber
                    cuándo puedes trabajar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Habilidades
                  </label>
                  <textarea
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 resize-none"
                    placeholder="Ej: atención al cliente, caja, inventario, redes sociales"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sepáralas por coma o por salto de línea.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Enlaces profesionales
                  </label>
                  <textarea
                    value={editLinks}
                    onChange={(e) => setEditLinks(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 resize-none"
                    placeholder="Ej: https://www.linkedin.com/..., https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Foto de perfil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:opacity-90"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Tarjetas de métricas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Valoración general</p>
              <p className="text-2xl font-semibold">4.8 ⭐</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 mb-1">
                Trabajos completados
              </p>
              <p className="text-2xl font-semibold">0</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Estado</p>
              <p className="text-sm font-medium text-emerald-600">
                {data.email_verificado
                  ? "Perfil verificado"
                  : "Pendiente de verificación"}
              </p>
            </div>
          </section>

          {/* Sobre mí + disponibilidad */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Sobre mí</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {bio}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {data.ciudad && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    📍 {data.ciudad}
                  </span>
                )}
                {data.universidad && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    🎓 {data.universidad}
                  </span>
                )}
                {data.carrera && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    📚 {data.carrera}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Disponibilidad</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {availability}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Esta información se muestra a los empleadores para que sepan
                cuándo puedes trabajar.
              </p>
            </div>
          </section>

          {/* Habilidades + links */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Habilidades</h2>
              <div className="flex flex-wrap gap-2 mb-1">
                {habilidadesList.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {habilidadesList.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Aquí aparecerán tus habilidades básicas.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">
                Enlaces profesionales
              </h2>
              <div className="space-y-1 text-sm">
                {links.length === 0 && (
                  <p className="text-slate-500 text-xs">
                    Aquí aparecerán tus enlaces (LinkedIn, portafolio, GitHub,
                    etc.).
                  </p>
                )}
                {links.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-primary hover:underline break-all"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 👇 Modal de vista previa (solo UI, no cambia campos) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute right-3 top-3 h-7 w-7 rounded-full bg-white/80 border border-slate-200 text-xs flex items-center justify-center hover:bg-slate-100"
            >
              ✕
            </button>

            {/* Header tipo empleador */}
            <div className="h-28 bg-gradient-to-r from-[#0A5FE3] to-[#00A14D] relative flex items-center justify-center">
              <div className="absolute -bottom-10">
                <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-semibold text-xl">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-14 px-6 pb-6">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {displayName}
                </h2>
                <p className="text-sm text-slate-500">{subtitle}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Así verán tu perfil los empleadores.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-1">
                    Sobre mí
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{bio}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.ciudad && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
                      📍 {data.ciudad}
                    </span>
                  )}
                  {data.universidad && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
                      🎓 {data.universidad}
                    </span>
                  )}
                  {data.carrera && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
                      📚 {data.carrera}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-1">
                    Disponibilidad
                  </h3>
                  <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {availability}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-1">
                    Habilidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {habilidadesList.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {habilidadesList.length === 0 && (
                      <p className="text-xs text-slate-500">
                        Sin habilidades registradas aún.
                      </p>
                    )}
                  </div>
                </div>

                {links.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 mb-1">
                      Enlaces
                    </h3>
                    <div className="space-y-1">
                      {links.map((link) => (
                        <span
                          key={link}
                          className="block text-xs text-primary break-all"
                        >
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
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

export default StudentProfile;
