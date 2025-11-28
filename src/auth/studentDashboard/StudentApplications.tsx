// src/auth/studentDashboard/StudentApplications.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../global/AuthContext";
import API_BASE_URL from "../../global/ApiBase";
import StudentSidebar from "./StudentSidebar";

interface StudentApplication {
  id: number;
  trabajo_id: number;
  titulo_trabajo: string;
  empleador_id?: number;
  categoria: string;
  ciudad: string;
  modalidad: string;
  salario: string;
  estado: string; // pendiente, aceptada, rechazada, completada, etc.
  fecha_postulacion: string;
  fecha_actualizacion?: string;
}

interface RawPostulacion {
  id: number;
  trabajo_id: number;
  titulo_trabajo: string;
  estado: string;
  fecha_creacion: string;
  empleador_id?: number;
}

// Mapea a EmpleadorInfo de tu backend
interface EmployerContact {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  linkedin: string;
  facebook_ig: string;
  otros_links: string; // CSV
  empleador_id: number; // viene de info-empleador
}

// Tags para valorar al empleador
type EmployerRatingTagKey =
  | "paga_puntual"
  | "trato_respetuoso"
  | "explica_bien"
  | "ideal_recurrente"
  | "ambiente_seguro"
  | "no_pago"
  | "pago_menos"
  | "falta_respeto"
  | "ambiente_inseguro"
  | "exigio_mas_sin_pagar";

// Endpoints
const MY_APPLICATIONS_ENDPOINT = `${API_BASE_URL}/protected/mis-postulaciones`;
const EMPLOYER_CONTACT_BY_JOB_ENDPOINT = `${API_BASE_URL}/protected/info-empleador`;
const RATE_EMPLOYER_ENDPOINT = `${API_BASE_URL}/protected/valorar-empleador`;

// Endpoint alineado con EstudianteCompletarHandler (completar.go)
const STUDENT_COMPLETE_ENDPOINT = `${API_BASE_URL}/protected/completar/estudiante`;

const StudentApplications: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [apps, setApps] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de detalles (cuando está aceptada / completada)
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(
    null
  );

  // Contacto del empleador
  const [contact, setContact] = useState<EmployerContact | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Rating del empleador
  const [rating, setRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [ratingTags, setRatingTags] = useState<
    Record<EmployerRatingTagKey, boolean>
  >({
    paga_puntual: false,
    trato_respetuoso: false,
    explica_bien: false,
    ideal_recurrente: false,
    ambiente_seguro: false,
    no_pago: false,
    pago_menos: false,
    falta_respeto: false,
    ambiente_inseguro: false,
    exigio_mas_sin_pagar: false,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  // Confirmar finalización
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const resetRatingState = () => {
    setRating(null);
    setRatingComment("");
    setRatingMessage(null);
    setRatingTags({
      paga_puntual: false,
      trato_respetuoso: false,
      explica_bien: false,
      ideal_recurrente: false,
      ambiente_seguro: false,
      no_pago: false,
      pago_menos: false,
      falta_respeto: false,
      ambiente_inseguro: false,
      exigio_mas_sin_pagar: false,
    });
    setRatingLoading(false);
  };

  const resetConfirmState = () => {
    setConfirmLoading(false);
    setConfirmMessage(null);
  };

  const toggleRatingTag = (key: EmployerRatingTagKey) => {
    setRatingTags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const estadoBadge = (estado: string) => {
    const e = estado.toUpperCase();
    if (e === "ACEPTADA" || e === "ACEPTADO") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (e === "RECHAZADA" || e === "RECHAZADO") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (
      e === "COMPLETADA" ||
      e === "COMPLETADO" ||
      e === "FINALIZADA" ||
      e === "FINALIZADO"
    ) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const fetchApps = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(MY_APPLICATIONS_ENDPOINT, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({} as any));

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          setError(
            (data as any).error ||
              (data as any).message ||
              "No se pudieron cargar tus postulaciones."
          );
          return;
        }

        const rawList = (data.postulaciones || []) as RawPostulacion[];

        const list: StudentApplication[] = rawList.map((p) => ({
          id: p.id,
          trabajo_id: p.trabajo_id,
          titulo_trabajo: p.titulo_trabajo,
          empleador_id: p.empleador_id,
          categoria: "",
          ciudad: "",
          modalidad: "",
          salario: "",
          estado: p.estado,
          fecha_postulacion: p.fecha_creacion,
          fecha_actualizacion: undefined,
        }));

        setApps(list);
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar tus postulaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [logout, navigate]);

  const openDetailsModal = async (app: StudentApplication) => {
    setSelectedApp(app);
    setContact(null);
    setContactError(null);
    setContactLoading(false);
    resetRatingState();
    resetConfirmState();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setContactLoading(true);
      const res = await fetch(EMPLOYER_CONTACT_BY_JOB_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trabajo_id: app.trabajo_id,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setContactError(
          data.error ||
            data.message ||
            "No se pudo cargar la información de contacto del empleador."
        );
        setContact(null);
        return;
      }

      const emp = data.empleador as EmployerContact;
      setContact(emp);
    } catch (err) {
      console.error(err);
      setContactError(
        "Error de conexión al cargar la información de contacto."
      );
      setContact(null);
    } finally {
      setContactLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedApp(null);
    setContact(null);
    setContactError(null);
    setContactLoading(false);
    resetRatingState();
    resetConfirmState();
  };

  // Enviar valoración al empleador
  const handleSubmitRating = async () => {
    if (!selectedApp) return;

    if (rating === null) {
      setRatingMessage("Selecciona una calificación antes de enviar.");
      return;
    }

    // ID del empleador desde info-empleador
    if (!contact || !contact.empleador_id) {
      setRatingMessage(
        "No se pudo identificar al empleador a valorar (no se encontró empleador_id en la información de contacto)."
      );
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const payload = {
      empleador_valorado_id: contact.empleador_id,
      job_id: selectedApp.trabajo_id,

      claridad_trabajo: ratingTags.explica_bien,
      respeto_trato: ratingTags.trato_respetuoso,
      pago_cumplimiento: ratingTags.paga_puntual,
      organizacion: ratingTags.ideal_recurrente,
      ambiente_seguridad: ratingTags.ambiente_seguro,

      rating,
      comentario: ratingComment.trim(),
    };

    try {
      setRatingLoading(true);
      setRatingMessage(null);

      const res = await fetch(RATE_EMPLOYER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setRatingMessage(
          data.error ||
            data.message ||
            "No se pudo guardar la valoración. Intenta de nuevo."
        );
        return;
      }

      setRatingMessage(
        "Gracias por valorar al empleador. Tu opinión ayuda a proteger a otros estudiantes."
      );
    } catch (err) {
      console.error(err);
      setRatingMessage(
        "Error de conexión al enviar la valoración. Intenta nuevamente."
      );
    } finally {
      setRatingLoading(false);
    }
  };

  // Llama a EstudianteCompletarHandler (completar.go)
  const handleConfirmCompletion = async () => {
    if (!selectedApp) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setConfirmLoading(true);
      setConfirmMessage(null);

      const res = await fetch(STUDENT_COMPLETE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postulacion_id: selectedApp.id,
          job_id: selectedApp.trabajo_id,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setConfirmMessage(
          data.error ||
            data.message ||
            "No se pudo confirmar la finalización del trabajo."
        );
        return;
      }

      // ✅ Éxito:
      // 1) Sacar la postulación de la lista de "Mis postulaciones"
      // 2) Cerrar el modal
      setApps((prev) => prev.filter((a) => a.id !== selectedApp.id));
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      setConfirmMessage(
        "Error de conexión al confirmar la finalización. Intenta nuevamente."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <StudentSidebar onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8 overflow-y-auto relative">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Mis postulaciones</h1>
          <p className="text-sm text-slate-600">
            Aquí ves todos los CameYos a los que te has postulado y su estado.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando postulaciones...</p>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Aún no te has postulado a ningún CameYo.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Cuando te postules, verás aquí el estado de cada trabajo.
            </p>
            <button
              onClick={() => navigate("/dashboard/student")}
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90"
            >
              Ver trabajos disponibles
            </button>
          </div>
        ) : (
          <section className="space-y-3">
            {apps.map((app) => {
              const ciudad =
                app.ciudad && app.ciudad.trim().length > 0
                  ? app.ciudad
                  : "Ciudad no especificada";

              const modalidad =
                app.modalidad && app.modalidad.trim().length > 0
                  ? app.modalidad
                  : "Modalidad no especificada";

              const salarioLabel =
                app.salario && app.salario.trim().length > 0
                  ? app.salario
                  : "A convenir";

              const estadoUpper = app.estado.toUpperCase();
              const isAccepted =
                estadoUpper === "ACEPTADA" || estadoUpper === "ACEPTADO";
              const isRejected =
                estadoUpper === "RECHAZADA" || estadoUpper === "RECHAZADO";
              const isCompleted =
                estadoUpper === "COMPLETADA" ||
                estadoUpper === "COMPLETADO" ||
                estadoUpper === "FINALIZADA" ||
                estadoUpper === "FINALIZADO";

              return (
                <article
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {app.titulo_trabajo || "Trabajo sin título"}
                      </h2>
                      <span
                        className={[
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          estadoBadge(app.estado),
                        ].join(" ")}
                      >
                        {app.estado}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1">
                      {ciudad} · {modalidad}
                    </p>
                    {app.categoria && (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-medium">
                        {app.categoria}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Postulado el {formatDate(app.fecha_postulacion)}
                      {app.fecha_actualizacion &&
                        ` · Última actualización ${formatDate(
                          app.fecha_actualizacion
                        )}`}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-[160px]">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        Pago estimado
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {salarioLabel}
                      </p>
                    </div>

                    {isAccepted || isCompleted ? (
                      <button
                        type="button"
                        onClick={() => openDetailsModal(app)}
                        className="mt-1 px-4 py-1.5 rounded-full bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700"
                      >
                        Ver detalles
                      </button>
                    ) : isRejected ? (
                      <span className="mt-1 text-[11px] text-red-600 font-medium">
                        Postulación rechazada
                      </span>
                    ) : (
                      <span className="mt-1 text-[11px] text-slate-500">
                        En revisión por el empleador
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* MODAL DETALLES EMPLEADOR + CONFIRM + VALORACIÓN */}
        {selectedApp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeDetailsModal}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-4xl w-[90%] max-h-[80vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lado izquierdo: info básica del trabajo */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 px-6 py-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold mb-1">
                    {selectedApp.titulo_trabajo || "Trabajo sin título"}
                  </h2>
                  <p className="text-[11px] text-slate-500 mb-1">
                    ID trabajo: {selectedApp.trabajo_id}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Estado:{" "}
                    <span className="font-semibold">
                      {selectedApp.estado}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Te postulaste el {formatDate(selectedApp.fecha_postulacion)}
                  </p>
                </div>

                <button
                  onClick={closeDetailsModal}
                  className="mt-4 text-[11px] text-slate-500 hover:text-slate-700 self-start"
                >
                  Cerrar
                </button>
              </div>

              {/* Lado derecho: contacto + confirmar + rating */}
              <div className="flex-1 px-8 py-6 overflow-y-auto">
                {/* Contacto del empleador */}
                <section className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <h3 className="text-xs font-semibold mb-2 text-slate-800">
                    Datos de contacto del empleador
                  </h3>
                  {contactLoading ? (
                    <p className="text-[11px] text-slate-500">
                      Cargando información...
                    </p>
                  ) : contactError ? (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                      {contactError}
                    </div>
                  ) : contact ? (
                    <div className="space-y-1 text-[11px] text-slate-700">
                      {(contact.nombre || contact.apellido) && (
                        <p>
                          <span className="font-medium">Nombre:</span>{" "}
                          {[contact.nombre, contact.apellido]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      )}
                      {contact.email && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {contact.email}
                        </p>
                      )}
                      {contact.telefono && (
                        <p>
                          <span className="font-medium">Teléfono:</span>{" "}
                          {contact.telefono}
                        </p>
                      )}
                      {contact.linkedin && (
                        <p>
                          <span className="font-medium">LinkedIn:</span>{" "}
                          <a
                            href={
                              contact.linkedin.startsWith("http")
                                ? contact.linkedin
                                : `https://${contact.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 underline"
                          >
                            {contact.linkedin}
                          </a>
                        </p>
                      )}
                      {contact.facebook_ig && (
                        <p>
                          <span className="font-medium">Facebook / IG:</span>{" "}
                          {contact.facebook_ig}
                        </p>
                      )}

                      {contact.otros_links && contact.otros_links.trim() && (
                        <div className="mt-1">
                          <p className="font-medium mb-1">Otros links:</p>
                          <div className="flex flex-wrap gap-2">
                            {contact.otros_links
                              .split(",")
                              .map((l) => l.trim())
                              .filter(Boolean)
                              .map((link, idx) => {
                                const href = link.startsWith("http")
                                  ? link
                                  : `https://${link}`;
                                return (
                                  <a
                                    key={idx}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 rounded-full bg-white border border-sky-200 hover:bg-sky-100 text-[11px]"
                                  >
                                    {link}
                                  </a>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600">
                      Aquí verás los datos de contacto del empleador para
                      coordinar el CameYo.
                    </p>
                  )}
                </section>

                {/* Confirmar que el trabajo ha finalizado (cuando está aceptado pero no completado) */}
                {(() => {
                  const estadoUpper =
                    selectedApp.estado && selectedApp.estado.toUpperCase();
                  const isAccepted =
                    estadoUpper === "ACEPTADA" || estadoUpper === "ACEPTADO";
                  const isCompleted =
                    estadoUpper === "COMPLETADA" ||
                    estadoUpper === "COMPLETADO" ||
                    estadoUpper === "FINALIZADA" ||
                    estadoUpper === "FINALIZADO";

                  if (isAccepted && !isCompleted) {
                    return (
                      <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                        <h3 className="text-sm font-semibold mb-1">
                          Confirmar que el trabajo ha finalizado
                        </h3>
                        <p className="text-[11px] text-slate-600 mb-2">
                          Cuando el CameYo realmente haya terminado, confirma
                          aquí. Esto sacará el trabajo de tus postulaciones y,
                          cuando el empleador también lo marque, aparecerá en
                          Trabajos completados.
                        </p>
                        {confirmMessage && (
                          <div className="mb-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
                            {confirmMessage}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleConfirmCompletion}
                          disabled={confirmLoading}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {confirmLoading
                            ? "Confirmando..."
                            : "Marcar como completado"}
                        </button>
                      </section>
                    );
                  }
                  return null;
                })()}

                {/* Bloque de valoración del empleador */}
                {(() => {
                  const estadoUpper =
                    selectedApp.estado && selectedApp.estado.toUpperCase();
                  const isCompleted =
                    estadoUpper === "COMPLETADA" ||
                    estadoUpper === "COMPLETADO" ||
                    estadoUpper === "FINALIZADA" ||
                    estadoUpper === "FINALIZADO";

                  if (!isCompleted) {
                    return (
                      <section className="mb-2 border-t border-slate-100 pt-3 mt-2">
                        <h3 className="text-sm font-semibold mb-2">
                          Valorar al empleador
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          Podrás valorar al empleador una vez que el CameYo se
                          marque como completado por ambas partes. Eso ayuda a
                          proteger a otros estudiantes de malos empleadores.
                        </p>
                      </section>
                    );
                  }

                  return (
                    <section className="mb-4 border-t border-slate-100 pt-3 mt-2">
                      <h3 className="text-sm font-semibold mb-2">
                        Valorar al empleador
                      </h3>

                      <p className="text-[11px] text-slate-600 mb-2">
                        Cuéntale a otros estudiantes cómo fue trabajar con este
                        empleador. Tu valoración ayuda a evitar estafadores o
                        abusos.
                      </p>

                      {/* Paso 1: rating global */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`w-7 h-7 rounded-full border text-xs font-semibold ${
                              rating !== null && rating >= star
                                ? "bg-amber-400 border-amber-400 text-white"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {star}
                          </button>
                        ))}
                        <span className="text-[11px] text-slate-500 ml-2">
                          {rating
                            ? `Calificación: ${rating}/5`
                            : "Selecciona una calificación (5⭐ = volverías a trabajar con este empleador)"}
                        </span>
                      </div>

                      {/* Paso 2: chips */}
                      <div className="mb-3">
                        <p className="text-[11px] text-slate-600 mb-1">
                          Selecciona lo que mejor describe la experiencia:
                        </p>

                        {/* Positivos */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {[
                            {
                              key: "paga_puntual",
                              label: "Paga puntual",
                            },
                            {
                              key: "trato_respetuoso",
                              label: "Trato muy respetuoso",
                            },
                            {
                              key: "explica_bien",
                              label: "Explica bien lo que pide",
                            },
                            {
                              key: "ideal_recurrente",
                              label: "Ideal para trabajos recurrentes",
                            },
                            {
                              key: "ambiente_seguro",
                              label: "Ambiente cómodo / seguro",
                            },
                          ].map((chip) => (
                            <button
                              key={chip.key}
                              type="button"
                              onClick={() =>
                                toggleRatingTag(
                                  chip.key as EmployerRatingTagKey
                                )
                              }
                              className={`px-3 py-1 rounded-full border text-[11px] ${
                                ratingTags[chip.key as EmployerRatingTagKey]
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                  : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>

                        {/* Flags de alerta */}
                        <p className="text-[11px] text-slate-600 mb-1">
                          ¿Ocurrió algo de esto? Márcalo como alerta:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            {
                              key: "no_pago",
                              label: "No pagó",
                            },
                            {
                              key: "pago_menos",
                              label: "Pagó menos de lo acordado",
                            },
                            {
                              key: "falta_respeto",
                              label: "Falta de respeto / comentarios malos",
                            },
                            {
                              key: "ambiente_inseguro",
                              label: "Ambiente inseguro",
                            },
                            {
                              key: "exigio_mas_sin_pagar",
                              label: "Exigió más sin pagar extra",
                            },
                          ].map((chip) => (
                            <button
                              key={chip.key}
                              type="button"
                              onClick={() =>
                                toggleRatingTag(
                                  chip.key as EmployerRatingTagKey
                                )
                              }
                              className={`px-3 py-1 rounded-full border text-[11px] ${
                                ratingTags[chip.key as EmployerRatingTagKey]
                                  ? "bg-red-100 border-red-300 text-red-800"
                                  : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comentario opcional */}
                      <textarea
                        className="w-full rounded-2xl border border-slate-200 text-[11px] px-3 py-2 mb-2 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
                        rows={3}
                        placeholder="Comentario opcional sobre el empleador (máx. 200 caracteres)..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        maxLength={200}
                      />

                      {ratingMessage && (
                        <div className="mb-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
                          {ratingMessage}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSubmitRating}
                          disabled={ratingLoading}
                          className="px-4 py-1.5 rounded-full bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {ratingLoading
                            ? "Guardando..."
                            : "Guardar valoración"}
                        </button>
                        <button
                          type="button"
                          onClick={resetRatingState}
                          className="text-[11px] text-slate-500 hover:text-slate-700"
                        >
                          Omitir por ahora
                        </button>
                      </div>
                    </section>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentApplications;
