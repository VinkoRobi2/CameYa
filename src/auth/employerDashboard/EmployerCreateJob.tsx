import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_BASE_URL from "../../global/ApiBase";
import { useAuth } from "../../global/AuthContext";
import EmployerSidebar from "./EmployerSidebar";

const EmployerCreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState({
    categoria: "",
    titulo: "",
    pago_estimado: "",
    negociable: false,
    ubicacion: "",
    descripcion: "",
    requisitos: "",
    habilidades: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const storedUserStr = localStorage.getItem("auth_user");
  let tipoIdentidad: string | null = null;
  if (storedUserStr) {
    try {
      const u = JSON.parse(storedUserStr);
      tipoIdentidad = u.tipo_identidad || u.TipoIdentidad || null;
    } catch {
      tipoIdentidad = null;
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    // Validación mínima en frontend
    if (
      !form.categoria.trim() ||
      !form.titulo.trim() ||
      !form.pago_estimado.trim() ||
      !form.ubicacion.trim() ||
      !form.descripcion.trim()
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    const pagoNumber = Number(form.pago_estimado);
    if (Number.isNaN(pagoNumber) || pagoNumber <= 0) {
      setError("El pago estimado debe ser un número mayor a 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/protected/crear-trabajo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoria: form.categoria,
          titulo: form.titulo,
          pago_estimado: pagoNumber,
          negociable: form.negociable,
          ubicacion: form.ubicacion,
          descripcion: form.descripcion,
          requisitos: form.requisitos,
          habilidades: form.habilidades,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        setError(
          (data && (data.error as string)) ||
            (data && (data.mensaje as string)) ||
            "No se pudo crear el trabajo."
        );
        return;
      }

      setSuccess("Trabajo creado con éxito ✅");
      setForm({
        categoria: "",
        titulo: "",
        pago_estimado: "",
        negociable: false,
        ubicacion: "",
        descripcion: "",
        requisitos: "",
        habilidades: "",
      });

      const isCompany =
        typeof tipoIdentidad === "string" &&
        tipoIdentidad.toLowerCase() === "empresa";

      navigate(
        isCompany
          ? "/dashboard/employer/company"
          : "/dashboard/employer/person",
        { replace: true }
      );
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // 🔹 Progreso visual según campos obligatorios llenos
  const requiredFields: (keyof typeof form)[] = [
    "categoria",
    "titulo",
    "pago_estimado",
    "ubicacion",
    "descripcion",
  ];
  const completedRequired = requiredFields.filter(
    (field) => String(form[field]).trim() !== ""
  ).length;
  const progress =
    requiredFields.length === 0
      ? 0
      : Math.round((completedRequired / requiredFields.length) * 100);

  // 🔹 Para microcopy contextual
  const isCompanyView =
    typeof tipoIdentidad === "string" &&
    tipoIdentidad.toLowerCase() === "empresa";

  return (
    <div className="min-h-screen bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark flex">
      <EmployerSidebar
        mode={isCompanyView ? "company" : "person"}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Encabezado con mini paso a paso y progreso */}
          <div className="mb-6 space-y-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold mb-1">
                Publicar un nuevo CameYo
              </h1>
              <p className="mt-1 text-[11px] md:text-xs text-foreground-light/60 dark:text-foreground-dark/60">
                Los campos marcados con <span className="font-semibold">*</span>{" "}
                son obligatorios. Mientras más claro describas el CameYo, mejores
                estudiantes se postularán.
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] md:text-xs text-foreground-light/70 dark:text-foreground-dark/70">
                <span>Progreso del formulario</span>
                <span>
                  {completedRequired}/{requiredFields.length} campos clave
                  completos ({progress}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs md:text-sm text-red-700"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs md:text-sm text-emerald-700"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {success}
            </motion.div>
          )}

          {/* Layout: formulario + columna de tips */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.05fr)]">
            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Paso 1: básicos */}
              <div className="rounded-2xl bg-white/90 dark:bg-background-dark/90 border border-primary/10 px-4 py-4 md:px-5 md:py-5 space-y-4 shadow-sm transition-all duration-200 hover:shadow-md focus-within:border-primary focus-within:shadow-md">
                <p className="text-[11px] md:text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">
                    1
                  </span>
                  Paso 1 · Datos básicos
                </p>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoría *
                  </label>
                  <input
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={
                      isCompanyView
                        ? "Activaciones, eventos de marca, soporte en local..."
                        : "Eventos, logística, apoyo en mudanzas..."
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Tip: piensa en la categoría como la “familia” del trabajo. Facilita
                    que los estudiantes lo encuentren rápido en el feed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título del CameYo *
                  </label>
                  <input
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={
                      isCompanyView
                        ? "Staff para activación de marca en campus ESPOL"
                        : "Ayudante para evento familiar en ESPOL"
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    {isCompanyView ? (
                      <>
                        Usa el título para dejar claro el tipo de activación o evento,
                        la marca y el contexto. Ej:&nbsp;
                        <span className="italic">
                          “Team de apoyo para feria de empleo (viernes)”.
                        </span>
                      </>
                    ) : (
                      <>
                        Cuenta rápidamente qué necesitas y cuándo. Ej:&nbsp;
                        <span className="italic">
                          “Ayuda para logística en cumpleaños (sábado tarde)”.
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Paso 2: pago y ubicación */}
              <div className="rounded-2xl bg-white/90 dark:bg-background-dark/90 border border-primary/10 px-4 py-4 md:px-5 md:py-5 space-y-4 shadow-sm transition-all duration-200 hover:shadow-md focus-within:border-primary focus-within:shadow-md">
                <p className="text-[11px] md:text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">
                    2
                  </span>
                  Paso 2 · Pago y ubicación
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Pago estimado (USD) *
                    </label>
                    <input
                      name="pago_estimado"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.pago_estimado}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="25"
                    />
                    <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                      Coloca el pago total esperado por el CameYo (no por hora) para que
                      el estudiante tenga una idea clara de cuánto va a ganar.
                    </p>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm text-foreground-light/80 dark:text-foreground-dark/80">
                      <input
                        type="checkbox"
                        name="negociable"
                        checked={form.negociable}
                        onChange={handleChange}
                        className="rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span>Pago negociable</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ubicación *
                  </label>
                  <input
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={
                      isCompanyView
                        ? "Local / punto de venta / stand en ESPOL"
                        : "Guayaquil, ESPOL, Campus Gustavo Galindo"
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    {isCompanyView ? (
                      <>
                        Indica si el CameYo es en tu local, en un stand dentro de ESPOL
                        o en otro punto específico. Esto ayuda al estudiante a calcular
                        tiempos de traslado.
                      </>
                    ) : (
                      <>
                        Especifica el lugar lo más claro posible. Si es dentro de ESPOL,
                        indica el campus y la zona aproximada (facultad, edificio,
                        canchas, etc.).
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Paso 3: detalles del trabajo */}
              <div className="rounded-2xl bg-white/90 dark:bg-background-dark/90 border border-primary/10 px-4 py-4 md:px-5 md:py-5 space-y-4 shadow-sm transition-all duration-200 hover:shadow-md focus-within:border-primary focus-within:shadow-md">
                <p className="text-[11px] md:text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">
                    3
                  </span>
                  Paso 3 · Detalles del CameYo
                </p>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descripción del trabajo *
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[90px]"
                    placeholder={
                      isCompanyView
                        ? "Describe qué hará el estudiante durante la activación (recibir clientes, entregar material, ayudar a montar/desmontar, etc.)."
                        : "Describe qué esperas del estudiante, horario, tareas concretas, si habrá pausas o refrigerio, etc."
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Incluye horario, duración aproximada y tipo de tareas. Mientras más
                    concreto seas, más fácil será que el estudiante decida si el CameYo
                    le calza.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Requisitos (opcional)
                  </label>
                  <textarea
                    name="requisitos"
                    value={form.requisitos}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[70px]"
                    placeholder={
                      isCompanyView
                        ? "Ejemplo: buena presencia, trato con clientes, puntualidad, manejo básico de caja (si aplica)..."
                        : "Ejemplo: mayor de edad, puntual, responsable, experiencia básica en atención al cliente..."
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Usa requisitos solo para lo realmente necesario. Evita poner listas
                    largas que puedan espantar a buenos candidatos.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Habilidades valoradas (opcional)
                  </label>
                  <textarea
                    name="habilidades"
                    value={form.habilidades}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[70px]"
                    placeholder={
                      isCompanyView
                        ? "Ejemplo: ventas, comunicación con clientes, manejo de redes en vivo, trabajo en equipo..."
                        : "Ejemplo: manejo de Excel, buena comunicación, trabajo en equipo, experiencia en eventos..."
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Menciona habilidades que suman puntos pero no son excluyentes:
                    comunicación, proactividad, experiencia en eventos, organización,
                    etc.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {loading ? "Publicando..." : "Publicar CameYo"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      isCompanyView
                        ? "/dashboard/employer/company"
                        : "/dashboard/employer/person"
                    )
                  }
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* COLUMNA DE TIPS / CONTEXTO */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-4">
                {/* 🔹 Sugerencias con nuevo color en tonos CameYa */}
                <motion.div
                  className="rounded-2xl bg-primary/10 border border-primary/30 text-foreground-light dark:text-foreground-dark px-4 py-4 text-sm shadow-sm"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                >
                  <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">
                      i
                    </span>
                    Sugerencias para un buen CameYo
                  </h2>
                  <ul className="space-y-2 text-[11px] text-foreground-light/80 dark:text-foreground-dark/80 list-disc list-inside">
                    <li>
                      Usa un título claro: di qué, dónde y cuándo en una sola frase.
                    </li>
                    <li>
                      Sé transparente con el pago, la duración y el horario para evitar
                      malentendidos.
                    </li>
                    <li>
                      Explica el contexto:{" "}
                      {isCompanyView
                        ? "¿es una activación de marca, un evento corporativo, una campaña puntual?"
                        : "¿es un evento familiar, una reunión, una mudanza, un apoyo académico?"}
                    </li>
                    <li>
                      Piensa en el estudiante: ¿qué le gustaría saber antes de aceptar?
                      Horario real, tipo de tareas y ambiente.
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  className="rounded-2xl bg-white/95 dark:bg-background-dark/95 border border-primary/10 px-4 py-3 text-xs text-foreground-light/80 dark:text-foreground-dark/80 shadow-sm"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                >
                  <p className="font-semibold mb-1">
                    {isCompanyView
                      ? "Prueba el modelo con un CameYo piloto"
                      : "Empieza con algo sencillo"}
                  </p>
                  <p>
                    {isCompanyView
                      ? "Si eres empresa, puedes empezar con una sola activación pequeña para entender cómo responden los estudiantes y luego escalar a más fechas."
                      : "Si es tu primera vez usando CameYa, publica un CameYo pequeño y concreto. Ver cómo funciona te ayudará a ajustar futuros trabajos."}
                  </p>
                </motion.div>
              </div>
            </aside>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EmployerCreateJob;
