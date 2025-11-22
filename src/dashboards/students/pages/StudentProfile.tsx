// src/dashboards/students/pages/StudentProfile.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Edit3, Linkedin, Link2 } from "lucide-react";

import type { UserRatingSummary } from "../../common/types";
import { API_BASE } from "../../../global_helpers/api";

const STUDENT_PROFILE_URL = `${API_BASE}/protected/perfil-privado-estudiante`;

// ---- Helpers para mapear el backend a un modelo usable ----

type RawProfile = {
  nombre?: string;
  apellido?: string;
  titulo_perfil?: string;
  bibiografia?: string;
  carrera?: string;
  universidad?: string;
  ciudad?: string;
  disponibilidad_de_tiempo?: string;
  habilidades_basicas?: unknown;
  sectores_preferencias?: unknown;
  links?: unknown;
  trabajos_completados?: number;

  // campos privados
  email?: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string; // ISO string
};

interface StudentProfileViewModel {
  fullName: string;
  profileTitle: string;
  careerAndUniversity: string;
  city?: string;

  // públicos
  availabilityText: string;
  availabilityTags: string[];
  bio: string;
  skills: string[];
  sectors: string[];
  links: { label: string; url: string }[];
  jobsCompleted: number;

  // privados
  email?: string;
  phone?: string;
  idNumber?: string;
  birthdate?: string; // formateado
}

// Limpia campos tipo ["{eventos", "soporte}"] o "{a,b,c}"
const parseTagArray = (raw: unknown): string[] => {
  if (!raw) return [];

  let joined: string;
  if (Array.isArray(raw)) {
    joined = raw.join(",");
  } else if (typeof raw === "string") {
    joined = raw;
  } else {
    return [];
  }

  return joined
    .replace(/[{}"]/g, "") // fuera llaves y comillas
    .split(/[;,]/) // separa por coma o ;
    .map((s) => s.trim())
    .filter(Boolean);
};

const prettifyAvailabilitySlug = (slug: string): string => {
  const map: Record<string, string> = {
    "fines-de-semana": "Solo fines de semana",
    "tardes-lv": "Tardes (L–V)",
    "manana-lv": "Mañanas (L–V)",
    vacaciones: "Vacaciones",
  };

  if (map[slug]) return map[slug];
  return slug.replace(/-/g, " ");
};

const labelFromUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("behance")) return "Behance";
    if (host.includes("github")) return "GitHub";
    return host;
  } catch {
    return url;
  }
};

const parseLinks = (raw: unknown): { label: string; url: string }[] => {
  const urls = parseTagArray(raw);
  return urls.map((u) => ({
    url: u,
    label: labelFromUrl(u),
  }));
};

const formatBirthdate = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const mapApiToViewModel = (api: RawProfile): StudentProfileViewModel => {
  const firstName = api.nombre ?? "";
  const lastName = api.apellido ?? "";
  const fullName =
    `${firstName} ${lastName}`.trim() || firstName || "Estudiante CameYa";

  const availabilityTags: string[] = [];
  if (api.disponibilidad_de_tiempo) {
    availabilityTags.push(
      prettifyAvailabilitySlug(String(api.disponibilidad_de_tiempo))
    );
  }
  const sectorTags = parseTagArray(api.sectores_preferencias);
  const allAvailabilityTags = [...availabilityTags, ...sectorTags];

  const skills = parseTagArray(api.habilidades_basicas);
  const links = parseLinks(api.links);

  const career = api.carrera ?? "";
  const university = api.universidad ?? "";
  const careerAndUniversity =
    career && university ? `${career} en ${university}` : career || university;

  return {
    fullName,
    profileTitle: api.titulo_perfil ?? "",
    careerAndUniversity,
    city: api.ciudad,
    availabilityText: allAvailabilityTags.join(" • "),
    availabilityTags: allAvailabilityTags,
    bio: api.bibiografia ?? "",
    skills,
    sectors: sectorTags,
    links,
    jobsCompleted: api.trabajos_completados ?? 0,

    email: api.email,
    phone: api.telefono,
    idNumber: api.cedula,
    birthdate: formatBirthdate(api.fecha_nacimiento),
  };
};

// ---- Componentes ----

interface StudentProfileProps {
  rating: UserRatingSummary;
}

type ViewMode = "public" | "private";

export const StudentProfile = ({ rating }: StudentProfileProps) => {
  const [profile, setProfile] = useState<StudentProfileViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("public");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");

        const res = await axios.get(STUDENT_PROFILE_URL, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        });

        const raw = res.data as RawProfile;
        const vm = mapApiToViewModel(raw);
        setProfile(vm);
      } catch (err) {
        console.error("Error cargando perfil de estudiante:", err);
        setError("No pudimos cargar tu perfil. Intenta nuevamente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-24 rounded-3xl bg-slate-100" />
          <div className="h-24 rounded-3xl bg-slate-100" />
          <div className="h-24 rounded-3xl bg-slate-100" />
        </div>
        <div className="h-32 rounded-3xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 rounded-3xl bg-slate-100" />
          <div className="h-32 rounded-3xl bg-slate-100" />
        </div>
        <div className="h-28 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "No se encontró información de tu perfil."}
      </div>
    );
  }

  const initial = profile.fullName.charAt(0).toUpperCase() || "?";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toggle de vista pública / privada */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setViewMode("public")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              viewMode === "public"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500"
            }`}
          >
            <Eye className="h-3 w-3" />
            Vista pública
          </button>
          <button
            type="button"
            onClick={() => setViewMode("private")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              viewMode === "private"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500"
            }`}
          >
            <EyeOff className="h-3 w-3" />
            Datos personales
          </button>
        </div>
      </div>

      {viewMode === "public" ? (
        <PublicProfileView
          profile={profile}
          rating={rating}
          initial={initial}
        />
      ) : (
        <PrivateProfileView profile={profile} initial={initial} />
      )}
    </div>
  );
};

// ---- VISTA PÚBLICA ----

interface PublicViewProps {
  profile: StudentProfileViewModel;
  rating: UserRatingSummary;
  initial: string;
}

const PublicProfileView = ({ profile, rating, initial }: PublicViewProps) => {
  return (
    <>
      {/* Hero card */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center text-lg font-semibold text-sky-700 md:h-20 md:w-20">
            {/* Aquí luego puedes usar foto_perfil */}
            <span>{initial}</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              {profile.fullName}
            </h2>
            {profile.careerAndUniversity && (
              <p className="text-sm text-slate-600">
                {profile.careerAndUniversity}
              </p>
            )}
            {profile.city && (
              <p className="text-xs text-slate-400 mt-0.5">{profile.city}</p>
            )}
            {profile.profileTitle && (
              <p className="mt-1 text-xs text-slate-500">
                {profile.profileTitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Editar perfil
        </button>
      </section>

      {/* Rating / trabajos completados / info */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs font-medium text-slate-500">
            Valoración general
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              {rating.average.toFixed(1)}
            </span>
            <span className="text-lg text-amber-400">★</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {rating.totalRatings} valoraciones
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs font-medium text-slate-500">
            Trabajos completados
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {profile.jobsCompleted}
          </p>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-sky-50 px-5 py-4 flex items-start gap-2">
          <div className="mt-0.5 rounded-full bg-sky-100 p-1.5">
            <Eye className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <p className="text-[11px] text-slate-700">
            Esta es la info que verán los empleadores cuando revisen tu perfil.
          </p>
        </div>
      </section>

      {/* Sobre mí */}
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-900">Sobre mí</h3>
        <p className="mt-2 text-sm text-slate-700">
          {profile.bio || "Aún no has escrito una biografía."}
        </p>
      </section>

      {/* Habilidades + Disponibilidad */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-900">Habilidades</h3>
          {profile.skills.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Aún no has agregado habilidades básicas.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Disponibilidad
          </h3>
          {profile.availabilityTags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.availabilityTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Aún no has configurado tu disponibilidad.
            </p>
          )}
        </div>
      </section>

      {/* Enlaces profesionales */}
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Enlaces profesionales
        </h3>

        {profile.links.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {profile.links.map((link) => (
              <li key={link.url} className="flex items-center gap-2">
                {link.label.toLowerCase().includes("linkedin") ? (
                  <Linkedin className="h-4 w-4 text-sky-600" />
                ) : (
                  <Link2 className="h-4 w-4 text-slate-500" />
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 hover:text-primary hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Aún no has agregado links. Puedes incluir tu LinkedIn, portafolio o
            redes profesionales.
          </p>
        )}
      </section>
    </>
  );
};

// ---- VISTA PRIVADA ----

interface PrivateViewProps {
  profile: StudentProfileViewModel;
  initial: string;
}

const PrivateProfileView = ({ profile, initial }: PrivateViewProps) => {
  return (
    <>
      {/* Hero + nota de privacidad */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700 md:h-20 md:w-20">
            <span>{initial}</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Datos personales
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Esta información es solo para ti y para la administración de
              CameYa. No se muestra a los empleadores.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de datos personales */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Información de contacto
          </h3>
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-semibold">Nombre completo: </span>
              {profile.fullName}
            </p>
            {profile.email && (
              <p>
                <span className="font-semibold">Correo: </span>
                {profile.email}
              </p>
            )}
            {profile.phone && (
              <p>
                <span className="font-semibold">Teléfono: </span>
                {profile.phone}
              </p>
            )}
            {profile.city && (
              <p>
                <span className="font-semibold">Ciudad: </span>
                {profile.city}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Información académica
          </h3>
          <div className="space-y-1 text-xs text-slate-600">
            {profile.careerAndUniversity && (
              <p>
                <span className="font-semibold">Carrera / Universidad: </span>
                {profile.careerAndUniversity}
              </p>
            )}
            {profile.idNumber && (
              <p>
                <span className="font-semibold">Cédula: </span>
                {profile.idNumber}
              </p>
            )}
            {profile.birthdate && (
              <p>
                <span className="font-semibold">Fecha de nacimiento: </span>
                {profile.birthdate}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// Wrapper para usarlo como default export en el router
const StudentProfilePage = () => {
  const fallbackRating: UserRatingSummary = {
    average: 0,
    totalRatings: 0,
  };

  return <StudentProfile rating={fallbackRating} />;
};

export default StudentProfilePage;
