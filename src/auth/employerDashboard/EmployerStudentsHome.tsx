// src/auth/employerDashboard/EmployerStudentsHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";
import EmployerSidebar from "./EmployerSidebar";

interface PublicStudent {
  id?: number;
  nombre?: string;
  apellido?: string;
  ciudad?: string;
  carrera?: string;
  universidad?: string;
  habilidades_basicas: string[];
  foto_perfil: string;
  disponibilidad_de_tiempo: string;
  biografia: string;
  links?: string;
  job_id?: number; // job al que le dio like
  valoracion?: number | null;
}

interface ApiResponsePublic {
  page: number;
  limit: number;
  data: PublicStudent[];
  count: number;
}

interface JobCreated {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  requisitos: string;
  salario: string;
  negociable: boolean;
  ciudad: string;
  modalidad: string;
  fecha_creacion: string;
  estado: string;
  postulacion_contratada_id: number | null;
}

interface JobsResponse {
  jobs: JobCreated[];
  page?: number;
  total_jobs?: number;
  total_pages?: number;
}

// Respuesta cruda de /protected/ver-likes-empleador
interface LikeStudentRaw {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil: string;
  habilidades_basicas: string[] | null;
  biografia: string;
  disponibilidad_de_tiempo: string;
  links: string;
  universidad: string;
  ciudad: string;
  job_id: number;
  valoracion: number | null;
}

interface LikesResponse {
  total: number;
  intereses: LikeStudentRaw[];
}

const STUDENTS_ENDPOINT = `${API_BASE_URL}/protected/perfiles-publicos-estudiantes`;
const JOBS_CREATED_ENDPOINT = `${API_BASE_URL}/protected/trabajos_creados`;
const LIKES_ENDPOINT = `${API_BASE_URL}/protected/ver-likes-empleador`;

// Endpoint para responder y generar match cuando el empleador da like
const EMPLOYER_MATCH_ENDPOINT = `${API_BASE_URL}/protected/matches/responder`;

const EmployerStudentsHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasJobs, setHasJobs] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<PublicStudent | null>(null);

  const [lastDirection, setLastDirection] = useState<"left" | "right">("right");
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const [showMatch, setShowMatch] = useState(false);
  const [matchStudent, setMatchStudent] = useState<PublicStudent | null>(null);

  // Filtros (solo con el botón Filters)
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [filterMinRating, setFilterMinRating] = useState<string>("");

  // persona / empresa para sidebar
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

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const normalizeList = (arr?: string[] | null) =>
    (arr || [])
      .map((s) => s.replace(/[{}"]/g, "").trim())
      .filter((s) => s.length > 0);

  const formatRating = (val?: number | null) => {
    if (val === null || val === undefined) return "0.0 / 5";
    return `${val.toFixed(1)} / 5`;
  };

  const parseLinks = (links?: string) =>
    (links || "")
      .split(/\s*\n\s*/g)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  // función de filtro (solo se ve afectada por los filtros del botón)
  const filterFn = (s: PublicStudent) => {
    const ciudad = (s.ciudad || "").toLowerCase();
    const universidad = (s.universidad || "").toLowerCase();
    const disponibilidad = (s.disponibilidad_de_tiempo || "").toLowerCase();
    const rating = s.valoracion ?? 0;

    if (filterCity.trim()) {
      if (!ciudad.includes(filterCity.trim().toLowerCase())) return false;
    }

    if (filterUniversity.trim()) {
      if (!universidad.includes(filterUniversity.trim().toLowerCase()))
        return false;
    }

    if (filterAvailability.trim()) {
      if (!disponibilidad.includes(filterAvailability.trim().toLowerCase()))
        return false;
    }

    if (filterMinRating.trim()) {
      const min = Number(filterMinRating);
      if (!Number.isNaN(min) && rating < min) return false;
    }

    return true;
  };

  const filteredStudents = students.filter(filterFn);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Ver si el empleador tiene trabajos creados
        const resJobs = await fetch(JOBS_CREATED_ENDPOINT, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resJobs.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        const jobsData: JobsResponse = await resJobs
          .json()
          .catch(() => ({ jobs: [] } as JobsResponse));

        if (!resJobs.ok) {
          console.error("Error al obtener trabajos creados:", jobsData);
        }

        const hasJobsFromBackend =
          Array.isArray(jobsData.jobs) && jobsData.jobs.length > 0;
        setHasJobs(hasJobsFromBackend);

        // 2) Si tiene CameYos, mostramos los "likes",
        //    si no, los perfiles públicos
        if (hasJobsFromBackend) {
          const resLikes = await fetch(LIKES_ENDPOINT, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (resLikes.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }

          const likesData: LikesResponse = await resLikes
            .json()
            .catch(() => ({ total: 0, intereses: [] } as LikesResponse));

          if (!resLikes.ok) {
            setError(
              (likesData as any).err ||
                (likesData as any).error ||
                "No se pudieron cargar los estudiantes interesados en tus CameYos."
            );
            return;
          }

          const mapped: PublicStudent[] = (likesData.intereses || []).map(
            (m) => ({
              id: m.id,
              nombre: m.nombre,
              apellido: m.apellido,
              ciudad: m.ciudad,
              carrera: "",
              universidad: m.universidad,
              habilidades_basicas: m.habilidades_basicas || [],
              foto_perfil: m.foto_perfil,
              disponibilidad_de_tiempo: m.disponibilidad_de_tiempo,
              biografia: m.biografia,
              links: m.links,
              job_id: m.job_id,
              valoracion: m.valoracion,
            })
          );

          setStudents(mapped);
          setTotalStudents(
            typeof likesData.total === "number"
              ? likesData.total
              : mapped.length
          );
        } else {
          const resStudents = await fetch(
            `${STUDENTS_ENDPOINT}?page=${page}&limit=${limit}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (resStudents.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }

          const studentsData: ApiResponsePublic = await resStudents
            .json()
            .catch(() => ({ data: [], count: 0 } as any));

          if (!resStudents.ok) {
            setError(
              (studentsData as any).err ||
                (studentsData as any).error ||
                "No se pudieron cargar los estudiantes."
            );
            return;
          }

          const list = studentsData.data || [];
          setStudents(list);
          setTotalStudents(
            typeof studentsData.count === "number"
              ? studentsData.count
              : list.length
          );
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, logout, navigate]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [students, filterCity, filterUniversity, filterAvailability, filterMinRating]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 900);
    return () => clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    if (!showMatch) return;
    const t = setTimeout(() => setShowMatch(false), 1700);
    return () => clearTimeout(t);
  }, [showMatch]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  const openStudentModal = (st: PublicStudent) => {
    setSelectedStudent(st);
    setShowModal(true);
  };

  const closeStudentModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const goPrevStudent = () => {
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };

  const goNextStudent = () => {
    setCurrentIndex((idx) =>
      idx < filteredStudents.length - 1 ? idx + 1 : idx
    );
  };

  const sendEmployerMatch = async (
    student: PublicStudent
  ): Promise<boolean> => {
    const token = localStorage.getItem("auth_token");
    if (!token || !student.id || !student.job_id) return false;

    try {
      const res = await fetch(EMPLOYER_MATCH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estudiante_id: student.id,
          job_id: student.job_id,
          like: true, // puedes cambiar a la clave que espere tu backend
        }),
      });

      if (!res.ok) {
        console.error("Error respuesta matches/responder:", await res.text());
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error al registrar el match del empleador:", err);
      return false;
    }
  };

  const handleSwipe = async (action: "like" | "dislike") => {
    if (!filteredStudents.length) return;

    const current = filteredStudents[currentIndex];

    setLastDirection(action === "like" ? "right" : "left");
    setFeedback(action);

    let matchOk = false;

    // Si hay CameYos creados, la lista son los que dieron like.
    // Cuando el empleador da ♥ → se intenta crear el match.
    if (action === "like" && hasJobs) {
      const ok = await sendEmployerMatch(current);
      matchOk = ok;
      if (!ok) {
        setError(
          "No se pudo registrar el match con este estudiante. Intenta de nuevo."
        );
      }
    }

    if (action === "like" && hasJobs && matchOk) {
      setMatchStudent(current);
      setShowMatch(true);
    }

    // Eliminamos del arreglo base por id
    const updatedBase = students.filter((s) => s.id !== current.id);
    setStudents(updatedBase);

    const newFiltered = updatedBase.filter(filterFn);

    if (newFiltered.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= newFiltered.length) {
      setCurrentIndex(newFiltered.length - 1);
    } else {
      setCurrentIndex(currentIndex);
    }
  };

  const studentActual = filteredStudents[currentIndex] || null;

  const getFullName = (st: PublicStudent | null) => {
    if (!st) return "";
    const full = `${st.nombre ?? ""} ${st.apellido ?? ""}`.trim();
    return full || "Perfil CameYa";
  };

  const getUnivCiudad = (st: PublicStudent | null) => {
    if (!st) return "";
    const parts: string[] = [];
    if (st.universidad) parts.push(st.universidad);
    if (st.ciudad) parts.push(st.ciudad);
    return parts.join(" • ");
  };

  const habilidadesActuales = normalizeList(
    studentActual?.habilidades_basicas
  );
  const habilidadesChips = habilidadesActuales.slice(0, 4);

  const disponibilidad =
    studentActual?.disponibilidad_de_tiempo || "No especificado";
  const bioActual =
    studentActual?.biografia?.trim().length
      ? studentActual.biografia
      : "Este perfil aún no tiene una biografía detallada.";

  const viewingInterested = hasJobs;

  const mainTitle = viewingInterested
    ? "Estudiantes interesados"
    : "Discover Talent";

  const subtitleHeader =
    viewingInterested && totalStudents > 0
      ? `${totalStudents} estudiantes han mostrado interés en tus CameYos.`
      : viewingInterested && totalStudents === 0
      ? ""
      : totalStudents > 0
      ? `${totalStudents} students available`
      : "Explora perfiles públicos de estudiantes para tus CameYos.";

  const helperText = viewingInterested ? (
    <p className="mt-2 text-[11px] text-slate-500">
    </p>
  ) : (
    <p className="mt-2 text-[11px] text-slate-500">
      Aún no has creado ningún CameYo. Crea tu primer trabajo desde{" "}
      <span className="font-semibold">“Publicar CameYo”</span> en el menú lateral
      para empezar a matchear. Mientras tanto, puedes ir conociendo perfiles
      públicos de estudiantes.
    </p>
  );

  const baseEmpty = students.length === 0;
  const filteredEmpty = !filteredStudents.length;

  const clearFilters = () => {
    setFilterCity("");
    setFilterUniversity("");
    setFilterAvailability("");
    setFilterMinRating("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 flex">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto flex flex-col items-center">
        {/* Header estilo Discover Talent + botón Filters (con panel de filtros) */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full max-w-5xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {mainTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{subtitleHeader}</p>
            {helperText}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px]">
                ☰
              </span>
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 p-4 text-xs z-20">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Filtrar estudiantes
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-700 mb-1">
                      Ciudad
                    </p>
                    <input
                      type="text"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      placeholder="Ej. Guayaquil"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-200 focus:border-pink-300"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-700 mb-1">
                      Universidad
                    </p>
                    <input
                      type="text"
                      value={filterUniversity}
                      onChange={(e) => setFilterUniversity(e.target.value)}
                      placeholder="Ej. ESPOL"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-200 focus:border-pink-300"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-700 mb-1">
                      Disponibilidad
                    </p>
                    <input
                      type="text"
                      value={filterAvailability}
                      onChange={(e) => setFilterAvailability(e.target.value)}
                      placeholder="Ej. flexible, fines de semana..."
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-200 focus:border-pink-300"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-700 mb-1">
                      Rating mínimo
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.5}
                      value={filterMinRating}
                      onChange={(e) => setFilterMinRating(e.target.value)}
                      placeholder="Ej. 3.5"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-200 focus:border-pink-300"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando perfiles...</p>
        ) : baseEmpty ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
            {viewingInterested ? (
              <>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Aún no has recibido interés en tus CameYos.
                </p>
                <p className="text-xs text-slate-500">
                  Cuando los estudiantes marquen ♥ en tus CameYos, aparecerán
                  aquí para que puedas decidir con quién hacer match.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Aún no hay estudiantes con perfil público completo.
                </p>
                <p className="text-xs text-slate-500">
                  Cuando los estudiantes completen su perfil, aparecerán aquí.
                </p>
              </>
            )}
          </div>
        ) : filteredEmpty ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-1">
              No hay estudiantes que coincidan con tus filtros.
            </p>
            <p className="text-xs text-slate-500">
              Ajusta los filtros para ver otros perfiles disponibles.
            </p>
          </div>
        ) : (
          <>
            {/* Card principal estilo Discover Talent + swipe */}
            <section className="mb-10 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
                {/* Flecha izquierda */}
                <button
                  type="button"
                  onClick={goPrevStudent}
                  disabled={currentIndex === 0}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>

                <AnimatePresence mode="popLayout">
                  {studentActual && (
                    <motion.article
                      key={getFullName(studentActual) + currentIndex}
                      className="relative bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-2xl hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-200 flex flex-col md:flex-row w-full cursor-pointer"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        const threshold = 120;
                        if (info.offset.x > threshold || info.velocity.x > 500) {
                          void handleSwipe("like");
                        } else if (
                          info.offset.x < -threshold ||
                          info.velocity.x < -500
                        ) {
                          void handleSwipe("dislike");
                        }
                      }}
                      initial={{ opacity: 0, x: 40, rotate: 3 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{
                        opacity: 0,
                        x: lastDirection === "right" ? 200 : -200,
                        rotate: lastDirection === "right" ? 10 : -10,
                      }}
                      transition={{ duration: 0.25 }}
                      whileDrag={{ scale: 1.02, rotate: 2 }}
                      onClick={() => openStudentModal(studentActual)}
                    >
                      {/* Overlay grande de like/dislike */}
                      <AnimatePresence>
                        {feedback === "like" && (
                          <motion.div
                            key="like-overlay"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.25 }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <div className="rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500/90 px-6 py-4 shadow-2xl border-2 border-white">
                              <span className="text-3xl md:text-4xl text-white">
                                ♥
                              </span>
                            </div>
                          </motion.div>
                        )}
                        {feedback === "dislike" && (
                          <motion.div
                            key="dislike-overlay"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.25 }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <div className="rounded-full bg-white/95 px-6 py-4 shadow-2xl border-2 border-red-400">
                              <span className="text-3xl md:text-4xl text-red-500">
                                ✕
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Imagen izquierda */}
                      <div className="relative w-full md:w-1/2 h-64 md:h-[380px]">
                        {studentActual.foto_perfil ? (
                          <img
                            src={studentActual.foto_perfil}
                            alt={getFullName(studentActual)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center">
                            <span className="text-4xl font-semibold text-white">
                              {getFullName(studentActual)
                                .split(" ")
                                .filter(Boolean)
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Badge superior */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500" />
                            Perfil público
                          </span>
                        </div>
                      </div>

                      {/* Detalles derecha */}
                      <div className="flex-1 px-6 md:px-8 py-6 flex flex-col gap-4 justify-between">
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                              {getFullName(studentActual)}
                            </h2>
                            {studentActual.carrera && (
                              <p className="text-sm text-slate-500">
                                {studentActual.carrera}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">
                              {getUnivCiudad(studentActual)}
                            </p>

                            {/* Valoración */}
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 text-xs">
                                ★
                              </span>
                              <span className="font-medium">
                                {formatRating(studentActual.valoracion)}
                              </span>
                            </div>
                          </div>

                          {/* Disponibilidad */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700">
                              {disponibilidad}
                            </span>
                          </div>

                          {/* Bio */}
                          <div className="mt-2">
                            <h3 className="text-xs font-semibold text-slate-700 mb-1">
                              Bio
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                              {bioActual}
                            </p>
                          </div>

                          {/* Skills */}
                          <div className="mt-1">
                            <h3 className="text-xs font-semibold text-slate-700 mb-1">
                              Skills
                            </h3>
                            {habilidadesChips.length === 0 ? (
                              <p className="text-[11px] text-slate-400">
                                Este estudiante aún no ha añadido habilidades
                                específicas.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {habilidadesChips.map((hab) => (
                                  <span
                                    key={hab}
                                    className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium"
                                  >
                                    {hab}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ver detalles */}
                        <div className="flex items-center justify-between gap-3 mt-4">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStudentModal(studentActual);
                            }}
                          >
                            View full profile
                          </button>
                          <span className="text-[11px] text-slate-400">
                            Perfil {currentIndex + 1} de{" "}
                            {filteredStudents.length}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  )}
                </AnimatePresence>

                {/* Flecha derecha */}
                <button
                  type="button"
                  onClick={goNextStudent}
                  disabled={currentIndex === filteredStudents.length - 1}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              </div>

              {/* Botones swipe inferiores */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-6">
                  <motion.button
                    type="button"
                    onClick={() => void handleSwipe("dislike")}
                    disabled={!studentActual}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{
                      scale: 1.07,
                      boxShadow: "0 18px 45px rgba(239,68,68,0.25)",
                    }}
                    className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center rounded-full border-[3px] border-red-400 bg-white text-red-500 text-2xl font-bold shadow-md hover:bg-red-50 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ✕
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => void handleSwipe("like")}
                    disabled={!studentActual}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{
                      scale: 1.07,
                      boxShadow: "0 20px 50px rgba(236,72,153,0.35)",
                    }}
                    className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 text-white text-3xl font-bold shadow-xl hover:opacity-95 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ♥
                  </motion.button>
                </div>

                <p className="text-[10px] text-slate-500">
                  “✕ No me interesa” · “♥ Me interesa” — también puedes arrastrar
                  la tarjeta para hacer swipe.
                </p>

                <p className="text-[11px] text-slate-500 mt-1">
                  Perfil {currentIndex + 1} de {filteredStudents.length} · Página{" "}
                  {page}
                </p>
              </div>

              {/* Paginación backend (solo para perfiles públicos) */}
              <div className="mt-6 flex justify-between items-center w-full max-w-5xl text-xs text-slate-600">
                <button
                  onClick={prevPage}
                  disabled={page === 1 || viewingInterested}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  ← Página anterior
                </button>
                <span>{viewingInterested ? "Intereses" : `Página ${page}`}</span>
                <button
                  onClick={nextPage}
                  disabled={viewingInterested}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  {viewingInterested ? " " : "Siguiente página →"}
                </button>
              </div>
            </section>
          </>
        )}

        {/* MODAL PERFIL PÚBLICO ESTUDIANTE (simplificado) */}
        {showModal && selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={closeStudentModal}
          >
            <div
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera con foto */}
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 h-52 md:h-full">
                  {selectedStudent.foto_perfil ? (
                    <img
                      src={selectedStudent.foto_perfil}
                      alt={getFullName(selectedStudent)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-semibold text-white">
                        {getFullName(selectedStudent)
                          .split(" ")
                          .filter(Boolean)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 md:p-7 space-y-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                        {getFullName(selectedStudent)}
                      </h2>
                      {selectedStudent.carrera && (
                        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                          {selectedStudent.carrera}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {getUnivCiudad(selectedStudent)}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 text-xs">
                          ★
                        </span>
                        <span className="font-medium">
                          {formatRating(selectedStudent.valoracion)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={closeStudentModal}
                      className="self-start h-8 w-8 rounded-full bg-slate-100 text-slate-500 text-sm flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-slate-700">
                    {normalizeList(selectedStudent.habilidades_basicas).map(
                      (h, idx) => (
                        <span
                          key={`hab-${idx}`}
                          className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200"
                        >
                          {h}
                        </span>
                      )
                    )}
                  </div>

                  <div className="mt-2 text-[11px] md:text-xs text-slate-700 space-y-2">
                    <div>
                      <p className="font-semibold mb-1">Bio</p>
                      <p>
                        {selectedStudent.biografia?.trim()
                          ? selectedStudent.biografia
                          : "Este perfil aún no tiene una biografía detallada."}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">Disponibilidad</p>
                      <p>
                        {selectedStudent.disponibilidad_de_tiempo ||
                          "No especificado"}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">Links</p>
                      {parseLinks(selectedStudent.links).length === 0 ? (
                        <p className="text-slate-500">
                          El estudiante aún no ha añadido links públicos.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {parseLinks(selectedStudent.links).map((link) => (
                            <li key={link}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-600 underline break-all"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400">
                    La comunicación directa se habilita cuando exista interés
                    mutuo en un CameYo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast flotante de feedback de swipe */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                <span
                  className={
                    feedback === "like"
                      ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 text-white text-sm"
                      : "inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 text-sm"
                  }
                >
                  {feedback === "like" ? "♥" : "✕"}
                </span>
                <span>
                  {feedback === "like"
                    ? viewingInterested
                      ? "Has marcado interés en este estudiante."
                      : "Marcaste interés en este estudiante."
                    : "Descartaste este estudiante."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay de celebración de match (solo si el POST fue correcto) */}
        <AnimatePresence>
          {showMatch && (
            <motion.div
              key="match-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative max-w-md w-full rounded-3xl bg-white shadow-2xl px-6 py-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-500 shadow-lg">
                  <span className="text-3xl text-white">♥</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  ¡Tienes un match!
                </h2>
                <p className="text-xs text-slate-600 mb-2">
                  Tú y{" "}
                  <span className="font-semibold">
                    {getFullName(matchStudent)}
                  </span>{" "}
                  han mostrado interés en trabajar en un CameYo.
                </p>
                <p className="text-[11px] text-slate-500">
                  Muy pronto podrán avanzar al siguiente paso dentro de CameYa
                  para coordinar detalles y, más adelante, chatear
                  directamente.
                </p>

                <button
                  type="button"
                  onClick={() => setShowMatch(false)}
                  className="mt-4 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 active:scale-[0.97] transition"
                >
                  Entendido
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EmployerStudentsHome;
