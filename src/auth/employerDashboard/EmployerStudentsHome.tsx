// src/auth/employerDashboard/EmployerStudentsHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";
import EmployerSidebar from "./EmployerSidebar";

interface PublicStudent {
  nombre: string;
  apellido: string;
  ciudad: string;
  carrera: string;
  universidad: string;
  habilidades_basicas: string[];
  foto_perfil: string;
  disponibilidad_de_tiempo: string;
  biografia: string;
}

interface ApiResponse {
  page: number;
  limit: number;
  data: PublicStudent[];
  count: number;
}

const STUDENTS_ENDPOINT = `${API_BASE_URL}/protected/perfiles-publicos-estudiantes`;

const EmployerStudentsHome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Índice del estudiante que se muestra al centro
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modal de perfil público
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<PublicStudent | null>(null);

  // Leemos tipo_identidad para saber cómo mostrar el sidebar
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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${STUDENTS_ENDPOINT}?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: ApiResponse = await res.json().catch(() => ({} as any));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data as any).err ||
              (data as any).error ||
              "No se pudieron cargar los estudiantes."
          );
          return;
        }

        setStudents(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, limit, logout, navigate]);

  // Cuando cambian los estudiantes (otra página), reseteamos el índice
  useEffect(() => {
    setCurrentIndex(0);
  }, [students]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => (p > 1 ? p - 1 : 1));

  // helper para limpiar { } y " que vienen en los strings de habilidades_basicas
  const normalizeList = (arr?: string[]) =>
    (arr || [])
      .map((s) => s.replace(/[{}"]/g, "").trim())
      .filter((s) => s.length > 0);

  // --- Modal: abrir / cerrar (sin llamadas extra al backend) ---
  const openStudentModal = (st: PublicStudent) => {
    setSelectedStudent(st);
    setShowModal(true);
  };

  const closeStudentModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const profile = selectedStudent;

  // Navegación entre estudiantes de la página actual
  const goPrevStudent = () => {
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };

  const goNextStudent = () => {
    setCurrentIndex((idx) =>
      idx < students.length - 1 ? idx + 1 : idx
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Buscar estudiantes</h1>
          <p className="text-sm text-slate-600">
            Mira un perfil a la vez y navega con las flechas para encontrar
            al estudiante ideal para tu CameYo.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando perfiles...</p>
        ) : students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no hay estudiantes con perfil público completo.
            </p>
            <p className="text-xs text-slate-500">
              Cuando los estudiantes completen su perfil, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            {/* Vista centrada: solo un estudiante protagonista + flechas */}
            <section className="mb-6 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 w-full max-w-2xl">
                {/* Flecha izquierda */}
                <button
                  type="button"
                  onClick={goPrevStudent}
                  disabled={currentIndex === 0}
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>

                {/* Card protagonista */}
                {(() => {
                  const s = students[currentIndex];

                  const st = {
                    ...s,
                    habilidades_basicas: normalizeList(
                      s.habilidades_basicas
                    ),
                  };

                  const fullName =
                    `${st.nombre ?? ""} ${st.apellido ?? ""}`.trim() ||
                    "Estudiante CameYa";

                  const initials =
                    fullName
                      .split(" ")
                      .filter(Boolean)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "ST";

                  // Subtítulo: carrera + universidad
                  const subtitle =
                    st.carrera && st.universidad
                      ? `${st.carrera} · ${st.universidad}`
                      : st.carrera ||
                        st.universidad ||
                        "Estudiante universitario";

                  const habilidades = st.habilidades_basicas || [];
                  const disponibilidad =
                    st.disponibilidad_de_tiempo ||
                    "No especificado";

                  const habilidadChips = habilidades.slice(0, 3);

                  return (
                    <article
                      className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer w-full"
                      onClick={() => openStudentModal(st)}
                    >
                      {/* Imagen tipo Tinder card */}
                      <div className="relative h-72 w-full bg-slate-200">
                        {st.foto_perfil ? (
                          <img
                            src={st.foto_perfil}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-primary to-sky-400 flex items-center justify-center">
                            <span className="text-4xl font-semibold text-white">
                              {initials}
                            </span>
                          </div>
                        )}

                        {/* Overlay con nombre y subtítulo */}
                        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <h2 className="text-white text-lg font-semibold leading-tight">
                            {fullName}
                          </h2>
                          <p className="text-[11px] text-white/80">
                            {subtitle}
                            {st.ciudad && ` · ${st.ciudad}`}
                          </p>
                        </div>
                      </div>

                      {/* Zona inferior: chips + CTA */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                          {habilidadChips.map((hab) => (
                            <span
                              key={hab}
                              className="px-3 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700"
                            >
                              {hab}
                            </span>
                          ))}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          Disponibilidad:{" "}
                          <span className="font-medium">
                            {disponibilidad}
                          </span>
                        </p>

                        <div className="mt-1 flex">
                          <button
                            type="button"
                            className="flex-1 px-3 py-2 rounded-full bg-primary text-white text-[11px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStudentModal(st);
                            }}
                          >
                            Ver detalles del perfil
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })()}

                {/* Flecha derecha */}
                <button
                  type="button"
                  onClick={goNextStudent}
                  disabled={currentIndex === students.length - 1}
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  → 
                </button>
              </div>

              {/* Controles móviles de flechas debajo */}
              <div className="mt-4 flex sm:hidden gap-4">
                <button
                  type="button"
                  onClick={goPrevStudent}
                  disabled={currentIndex === 0}
                  className="flex-1 inline-flex items-center justify-center h-9 rounded-full border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={goNextStudent}
                  disabled={currentIndex === students.length - 1}
                  className="flex-1 inline-flex items-center justify-center h-9 rounded-full border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Siguiente →
                </button>
              </div>

              {/* Indicador de posición dentro de la página */}
              <p className="mt-3 text-[11px] text-slate-600">
                Perfil {currentIndex + 1} de {students.length} · Página {page}
              </p>
            </section>

            {/* Paginación de backend (sigue igual) */}
            <div className="flex justify-between items-center text-xs text-slate-600">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Página anterior
              </button>
              <span>Página {page}</span>
              <button
                onClick={nextPage}
                className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
              >
                Siguiente página →
              </button>
            </div>
          </>
        )}

        {/* MODAL PERFIL PÚBLICO ESTUDIANTE */}
        {showModal && profile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={closeStudentModal}
          >
            <div
              className="relative w-full max-w-4xl aspect-[4/5] md:aspect-[16/9] rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen protagonista */}
              {profile.foto_perfil ? (
                <img
                  src={profile.foto_perfil}
                  alt={`${profile.nombre} ${profile.apellido}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-sky-400 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-semibold text-white">
                    {(
                      `${profile.nombre ?? ""} ${
                        profile.apellido ?? ""
                      }`.trim() || "ST"
                    )
                      .split(" ")
                      .filter(Boolean)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}

              {/* Gradiente para leer texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Botón cerrar */}
              <button
                onClick={closeStudentModal}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                ✕
              </button>

              {/* Contenido sobre la imagen */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 text-white space-y-4 md:space-y-5 pointer-events-none">
                {/* Cabecera: nombre + info principal */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-4 pointer-events-auto">
                  <div>
                    <h2 className="text-lg md:text-2xl font-semibold leading-tight">
                      {`${profile.nombre ?? ""} ${
                        profile.apellido ?? ""
                      }`.trim() || "Estudiante CameYa"}
                    </h2>
                    <p className="mt-1 text-[11px] md:text-xs text-white/70">
                      {profile.carrera && profile.universidad
                        ? `${profile.carrera} · ${profile.universidad}`
                        : profile.carrera || profile.universidad || ""}
                      {profile.ciudad && ` · ${profile.ciudad}`}
                    </p>
                  </div>

                  <div className="text-right text-[11px] md:text-xs text-white/80">
                    <p className="uppercase tracking-wide text-white/60">
                      Disponibilidad
                    </p>
                    <p className="font-semibold">
                      {profile.disponibilidad_de_tiempo || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Habilidades */}
                <div className="flex flex-wrap gap-2 text-[11px] md:text-xs pointer-events-auto">
                  {normalizeList(profile.habilidades_basicas).map(
                    (h, idx) => (
                      <span
                        key={`hab-${idx}`}
                        className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm"
                      >
                        {h}
                      </span>
                    )
                  )}
                </div>

                {/* Biografía */}
                <div className="max-w-2xl text-[11px] md:text-xs text-white/85 pointer-events-auto">
                  <p>
                    {profile.biografia &&
                    profile.biografia.trim().length > 0
                      ? profile.biografia
                      : "Este estudiante aún no ha añadido una biografía detallada."}
                  </p>
                  <p className="mt-1 text-white/70">
                    La comunicación se realiza por el chat 1 a 1 de CameYa
                    cuando exista interés mutuo en avanzar con un CameYo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployerStudentsHome;
