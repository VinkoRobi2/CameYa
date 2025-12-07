// src/auth/chat/EmployerChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EmployerSidebar from "../employerDashboard/EmployerSidebar";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";

interface LocationState {
  estudianteId?: number;
  jobId?: number;
  jobTitle?: string;
  studentName?: string;
  avatar?: string;
  matchId?: number; // camelCase
  match_id?: number; // por si llega directo del backend
}

interface ChatMessage {
  id: number;
  text: string;
  fromSelf: boolean;
  createdAt: string;
}

interface MensajeApi {
  id: number;
  sender_id: number;
  receiver_id: number;
  job_id: number;
  contenido: string;
  fecha: string;
}

interface CompletionState {
  meCompleted: boolean;
  otherCompleted: boolean;
  estado: string;
}

const EmployerChat: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { receiverId } = useParams<{ receiverId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">(
    "connecting"
  );

  const [completion, setCompletion] = useState<CompletionState>({
    meCompleted: false,
    otherCompleted: false,
    estado: "en_progreso",
  });
  const [isCompleting, setIsCompleting] = useState(false);

  // Estado para valoraciones (empleador → estudiante)
  const [hasRatedStudent, setHasRatedStudent] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [ratingTags, setRatingTags] = useState({
    responsable_puntual: false,
    calidad_trabajo: false,
    buena_comunicacion: false,
    buena_actitud: false,
    autonomo: false,
    no_se_presento: false,
    cancelo_ultima_hora: false,
    falta_respeto: false,
    no_termino_trabajo: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const studentName = state.studentName || "Estudiante CameYa";
  const jobTitle = state.jobTitle || "CameYo sin título";
  const otherAvatar = state.avatar;
  const jobId = state.jobId;
  const matchId = state.matchId ?? state.match_id ?? null;
  const estudianteId = state.estudianteId;

  // Datos del usuario logueado (empleador)
  const storedUserStr = localStorage.getItem("auth_user");
  let mode: "person" | "company" = "person";
  let selfAvatar: string | undefined;
  let currentUserId: number | null = null;

  if (storedUserStr) {
    try {
      const u: any = JSON.parse(storedUserStr);
      const tipoIdentidad = u.tipo_identidad || u.TipoIdentidad;
      if (
        typeof tipoIdentidad === "string" &&
        tipoIdentidad.toLowerCase() === "empresa"
      ) {
        mode = "company";
      }
      selfAvatar =
        u.foto_perfil || u.fotoPerfil || u.FotoPerfil || undefined;
      currentUserId =
        u.id ?? u.ID ?? u.user_id ?? u.userID ?? u.empleador_id ?? null;
    } catch {
      mode = "person";
    }
  }

  // Scroll al final en cada cambio de mensajes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 1) Histórico de mensajes
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !receiverId || !jobId || !currentUserId) return;

    const fetchHistory = async () => {
      try {
        const url = `${API_BASE_URL}/protected/mensajes/${receiverId}?job_id=${jobId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          console.error("Error cargando histórico de mensajes (employer)");
          return;
        }

        const data = await res.json();
        const apiMessages: MensajeApi[] = data.mensajes || [];

        const mapped: ChatMessage[] = apiMessages.map((m) => ({
          id: m.id,
          text: m.contenido,
          fromSelf: m.sender_id === currentUserId,
          createdAt: new Date(m.fecha).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(mapped);
      } catch (err) {
        console.error("Error histórico mensajes employer:", err);
      }
    };

    fetchHistory();
  }, [receiverId, jobId, currentUserId, logout, navigate]);

  // 1.5) Estado de completado vía match_id
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !matchId || !jobId) return;

    const fetchCompletion = async () => {
      try {
        const url = `${API_BASE_URL}/protected/completar/estado?match_id=${matchId}&job_id=${jobId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          console.error("Error obteniendo estado de match (employer)");
          return;
        }

        const data = await res.json();

        setCompletion({
          meCompleted: !!data.employer_completed,
          otherCompleted: !!data.student_completed,
          estado: data.estado || "en_progreso",
        });
      } catch (err) {
        console.error("Error estado match employer:", err);
      }
    };

    fetchCompletion();
  }, [matchId, jobId, logout, navigate]);

  // 1.6) Estado de valoración (si el empleador ya valoró al estudiante)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !jobId || !estudianteId) return;

    const fetchRating = async () => {
      try {
        const url = `${API_BASE_URL}/protected/valoracion/estudiante/?job_id=${jobId}&=${estudianteId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        if (data.exists) {
          setHasRatedStudent(true);
          if (typeof data.rating === "number") {
            setRating(data.rating);
          }
        }
      } catch (err) {
        console.error("Error obteniendo estado de valoración estudiante:", err);
      }
    };

    fetchRating();
  }, [jobId, estudianteId, logout, navigate]);

  // 2) WebSocket
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }
    if (!receiverId || !jobId) {
      console.warn("Falta receiverId o jobId en EmployerChat");
      return;
    }

    const wsBase = API_BASE_URL.replace(/^http/i, "ws");
    const url = `${wsBase}/mensajes/empleadores/${receiverId}?jobId=${jobId}&token=${encodeURIComponent(
      token
    )}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("open");

      if (pendingMessageRef.current) {
        const msg = pendingMessageRef.current;
        pendingMessageRef.current = null;

        ws.send(msg);

        const now = new Date();
        setMessages((prev) => [
          ...prev,
          {
            id: now.getTime(),
            text: msg,
            fromSelf: true,
            createdAt: now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    };

    ws.onmessage = (event) => {
      const text = String(event.data);
      const now = new Date();
      setMessages((prev) => [
        ...prev,
        {
          id: now.getTime() + Math.random(),
          text,
          fromSelf: false,
          createdAt: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    ws.onerror = (err) => {
      console.error("Employer WS error", err);
    };

    ws.onclose = () => {
      setWsStatus("closed");
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [receiverId, jobId, logout, navigate]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      pendingMessageRef.current = trimmed;
      setInput("");
      return;
    }

    ws.send(trimmed);

    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: now.getTime(),
        text: trimmed,
        fromSelf: true,
        createdAt: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleMarkCompleted = async () => {
    if (!jobId || !matchId) {
      console.error("Falta jobId o matchId para completar el trabajo", {
        jobId,
        matchId,
        state,
      });
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsCompleting(true);

      const res = await fetch(`${API_BASE_URL}/protected/completar/empleador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          job_id: jobId,
        }),
      });

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        console.error("Error marcando completado (empleador)");
        return;
      }

      const data = await res.json();

      setCompletion({
        meCompleted: !!data.employer_completed,
        otherCompleted: !!data.student_completed,
        estado: data.estado || "en_progreso",
      });
    } catch (err) {
      console.error("Error completando (empleador):", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleTag = (key: keyof typeof ratingTags) => {
    setRatingTags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitRating = async () => {
    if (!jobId || !estudianteId || rating <= 0) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/protected/valorar-estudiante`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estudiante_valorado_id: estudianteId,
            job_id: jobId,
            rating,
            comentario: comment,
            ...ratingTags,
          }),
        }
      );

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        console.error("Error creando valoración de estudiante");
        return;
      }

      setHasRatedStudent(true);
      setShowRatingModal(false);
    } catch (err) {
      console.error("Error enviando valoración estudiante:", err);
    }
  };

  const renderAvatar = (fromSelf: boolean) => {
    const url = fromSelf ? selfAvatar : otherAvatar;
    const name = fromSelf ? "Tú" : studentName;

    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className="h-7 w-7 rounded-full object-cover border border-slate-200"
        />
      );
    }

    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div className="h-7 w-7 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-700">
        {initials}
      </div>
    );
  };

  const statusLabel = (() => {
    if (completion.estado === "completado") {
      return "Ambos marcaron este CameYo como completado.";
    }
    if (completion.meCompleted && !completion.otherCompleted) {
      return "Ya marcaste este CameYo como completado. Esperando al estudiante.";
    }
    if (!completion.meCompleted && completion.otherCompleted) {
      return "El estudiante ya marcó como completado. Aún falta tu confirmación.";
    }
    return "CameYo en progreso.";
  })();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <EmployerSidebar mode={mode} onLogout={handleLogout} />

      <main className="flex-1 px-4 md:px-10 pt-24 pb-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            className="text-xs text-slate-500 mb-3 hover:text-slate-800"
            onClick={() => navigate(-1)}
          >
            ← Volver a matches
          </button>

          <div className="rounded-3xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-slate-100 overflow-hidden flex flex-col min-h-[480px]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-pink-50 via-white to-purple-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                  {otherAvatar ? (
                    <img
                      src={otherAvatar}
                      alt={studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600">
                      {studentName
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {studentName}
                  </p>
                  <p className="text-[11px] text-slate-500">Match en:</p>
                  <p className="text-[11px] text-slate-700">{jobTitle}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Estado chat:{" "}
                    {wsStatus === "open"
                      ? "Conectado"
                      : wsStatus === "connecting"
                      ? "Conectando..."
                      : "Desconectado"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {statusLabel}
                  </p>

                  {completion.estado === "completado" && (
                    <div className="mt-2 flex flex-col items-start gap-1">
                      {hasRatedStudent ? (
                        <p className="text-[10px] text-emerald-600 font-medium">
                          Ya valoraste a este estudiante{" "}
                          {rating ? `(⭐ ${rating}/5)` : ""}.
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRatingModal(true)}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          Valorar estudiante
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleMarkCompleted}
                disabled={isCompleting || completion.meCompleted}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-primary/70 bg-white text-[11px] font-semibold text-primary shadow-sm hover:bg-primary/5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completion.meCompleted
                  ? "Ya marcaste como completado"
                  : "Marcar como completado"}
              </button>
            </div>

            {/* Mensajes */}
            <div
              ref={listRef}
              className="flex-1 px-4 md:px-6 py-4 space-y-3 overflow-y-auto bg-slate-50/40"
            >
              {messages.length === 0 && (
                <p className="text-xs text-slate-400 text-center mt-8">
                  Aún no hay mensajes. Envía el primero para coordinar el CameYo.
                </p>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${
                    m.fromSelf ? "justify-end" : "justify-start"
                  }`}
                >
                  {renderAvatar(m.fromSelf)}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                      m.fromSelf
                        ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p>{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        m.fromSelf
                          ? "text-pink-100/90"
                          : "text-slate-500/80"
                      }`}
                    >
                      {m.createdAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 md:px-6 py-3 border-t border-slate-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-9 w-9 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 flex items-center justify-center text-white text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de valoración al estudiante */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Valorar a {studentName}
            </h3>

            <p className="text-[11px] text-slate-500 mb-2">
              ¿Cómo fue la experiencia trabajando con este estudiante?
            </p>

            {/* Rating 1–5 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-600">Rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`h-7 w-7 flex items-center justify-center rounded-full text-xs border ${
                    rating >= n
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Tags positivos */}
            <div className="mb-3 space-y-1">
              <p className="text-[10px] text-slate-500">Aspectos positivos:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  ["responsable_puntual", "Responsable / puntual"],
                  ["calidad_trabajo", "Buena calidad de trabajo"],
                  ["buena_comunicacion", "Buena comunicación"],
                  ["buena_actitud", "Buena actitud"],
                  ["autonomo", "Autónomo"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTag(key as keyof typeof ratingTags)}
                    className={`px-2 py-1 rounded-full text-[10px] border ${
                      ratingTags[key as keyof typeof ratingTags]
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 mt-2">Alertas:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  ["no_se_presento", "No se presentó"],
                  ["cancelo_ultima_hora", "Canceló a última hora"],
                  ["falta_respeto", "Falta de respeto"],
                  ["no_termino_trabajo", "No terminó el trabajo"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTag(key as keyof typeof ratingTags)}
                    className={`px-2 py-1 rounded-full text-[10px] border ${
                      ratingTags[key as keyof typeof ratingTags]
                        ? "bg-red-50 text-red-700 border-red-300"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comentario */}
            <textarea
              className="w-full border border-slate-200 rounded-xl px-2 py-1 text-[11px] mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              placeholder="Comentario opcional..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRatingModal(false)}
                className="px-3 py-1.5 rounded-full text-[11px] border border-slate-200 text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={rating <= 0}
                className="px-3 py-1.5 rounded-full text-[11px] bg-emerald-500 text-white font-semibold disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerChat;
