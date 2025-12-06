// src/auth/employerDashboard/EmployerChat.tsx
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

  const wsRef = useRef<WebSocket | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const studentName = state.studentName || "Estudiante CameYa";
  const jobTitle = state.jobTitle || "CameYo sin título";
  const otherAvatar = state.avatar;
  const jobId = state.jobId;

  // Datos del usuario logueado (empleador) desde localStorage
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

  // Scroll al final cuando llegan mensajes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 1) Cargar histórico desde backend
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !receiverId || !jobId || !currentUserId) return;

    const fetchHistory = async () => {
      try {
        const url = `${API_BASE_URL}/protected/mensajes/${receiverId}?job_id=${jobId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          console.error("Error cargando histórico de mensajes");
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

  // 2) Abrir WebSocket (en dev con StrictMode verás dos conexiones, es normal)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }
    if (!receiverId || !jobId) {
      console.warn("Falta receiverId o jobId");
      return;
    }

    const wsBase = API_BASE_URL.replace(/^http/i, "ws");
    const url = `${wsBase}/mensajes/empleadores/${receiverId}?jobId=${jobId}&token=${encodeURIComponent(
      token
    )}`;

    console.log("Employer WS URL:", url);

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      console.log("Employer WS abierto");
      setWsStatus("open");

      // Si había un mensaje pendiente lo enviamos ahora
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
          fromSelf: false, // viene del estudiante
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

    ws.onclose = (evt) => {
      console.log("Employer WS cerrado, code:", evt.code, "reason:", evt.reason);
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

    // Si todavía no está listo, lo guardamos en pending y dejamos que onopen lo envíe
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS aún no OPEN, guardando mensaje pendiente (employer)");
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
                  <p className="text-[11px] text-slate-500">Postulación a:</p>
                  <p className="text-[11px] text-slate-700">{jobTitle}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Estado:{" "}
                    {wsStatus === "open"
                      ? "Conectado"
                      : wsStatus === "connecting"
                      ? "Conectando..."
                      : "Desconectado"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-primary/70 bg-white text-[11px] font-semibold text-primary shadow-sm hover:bg-primary/5"
              >
                Marcar como completado
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
                  {/* foto siempre a la izquierda de la burbuja */}
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
    </div>
  );
};

export default EmployerChat;
