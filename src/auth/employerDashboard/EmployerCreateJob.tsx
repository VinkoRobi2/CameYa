// src/auth/employerDashboard/EmployerCreateJob.tsx
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
    metodo_pago: "",
    es_virtual: false, // 🔹 flag virtual/presencial
    ubicacion: "",
    descripcion: "",
    requisitos: "",
    foto_trabajo_base64: "", // 🔹 NUEVO: imagen del CameYo
  });

  const [jobImagePreview, setJobImagePreview] = useState<string | null>(null); // 🔹 preview
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Manejo de imagen del CameYo
  const handleJobImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // reader.result ya viene en formato data:image/...;base64,...
        setForm((prev) => ({
          ...prev,
          foto_trabajo_base64: reader.result as string,
        }));
        setJobImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
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

    // 🔹 Validación mínima en frontend
    if (
      !form.categoria.trim() ||
      !form.titulo.trim() ||
      !form.pago_estimado.trim() ||
      !form.metodo_pago.trim() ||
      (!form.es_virtual && !form.ubicacion.trim()) || // ubicación solo si NO es virtual
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
          metodo_pago: form.metodo_pago,
          presencial: !form.es_virtual,
          ubicacion: form.es_virtual ? "" : form.ubicacion,
          descripcion: form.descripcion,
          requisitos: form.requisitos,
          foto_trabajo_base64:
            form.foto_trabajo_base64 && form.foto_trabajo_base64.trim().length > 0
              ? form.foto_trabajo_base64
              : undefined, // 🔹 opcional, para que si está vacío no moleste
        }),
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
            (data as any).mensaje ||
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
        metodo_pago: "",
        es_virtual: false,
        ubicacion: "",
        descripcion: "",
        requisitos: "",
        foto_trabajo_base64: "",
      });
      setJobImagePreview(null);

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

  // 🔹 Progreso visual (ubicación solo cuenta si no es virtual)
  const requiredFieldsBase: (keyof typeof form)[] = [
    "categoria",
    "titulo",
    "pago_estimado",
    "metodo_pago",
    "descripcion",
  ];
  const requiredFields: (keyof typeof form)[] = form.es_virtual
    ? requiredFieldsBase
    : [...requiredFieldsBase, "ubicacion"];

  const completedRequired = requiredFields.filter(
    (field) => String(form[field]).trim() !== ""
  ).length;

  const progress =
    requiredFields.length === 0
      ? 0
      : Math.round((completedRequired / requiredFields.length) * 100);

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
          {/* Encabezado + progreso */}
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

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.05fr)]">
            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Paso 1 */}
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
                    Tip: piensa en la categoría como la “familia” del trabajo para que se
                    encuentre fácil en el feed.
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
                    Usa el título para dejar claro el tipo de CameYo, lugar y día.
                  </p>
                </div>
              </div>

              {/* Paso 2: pago, método y virtual/presencial */}
              <div className="rounded-2xl bg-white/90 dark:bg-background-dark/90 border border-primary/10 px-4 py-4 md:px-5 md:py-5 space-y-4 shadow-sm transition-all duration-200 hover:shadow-md focus-within:border-primary focus-within:shadow-md">
                <p className="text-[11px] md:text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">
                    2
                  </span>
                  Paso 2 · Pago y modalidad
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pago */}
                  <div>
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
                      Coloca el pago total del CameYo (no por hora).
                    </p>
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Método de pago *
                    </label>
                    <select
                      name="metodo_pago"
                      value={form.metodo_pago}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia bancaria">
                        Transferencia bancaria
                      </option>
                    </select>
                    <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                      Indica si pagarás en efectivo o por transferencia.
                    </p>
                  </div>

                  {/* Negociable */}
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

                {/* Virtual / presencial */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-foreground-light/80 dark:text-foreground-dark/80">
                    <input
                      type="checkbox"
                      name="es_virtual"
                      checked={form.es_virtual}
                      onChange={handleChange}
                      className="rounded border-slate-300 text-primary focus:ring-primary/30"
                    />
                    <span>Este CameYo es virtual (online)</span>
                  </label>

                  <p className="text-[11px] text-foreground-light/60 dark:text-foreground-dark/60 max-w-md">
                    Si es virtual, no se pedirá una ubicación física y el CameYo se
                    entenderá como remoto (clases en línea, diseño, soporte remoto, etc.).
                  </p>
                </div>

                {/* Ubicación solo cuando NO es virtual */}
                {!form.es_virtual && (
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
                      Indica el lugar donde se realizará el CameYo.
                    </p>
                  </div>
                )}
              </div>

              {/* Paso 3: detalles + imagen */}
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
                        ? "Describe qué hará el estudiante durante la activación..."
                        : "Describe qué esperas del estudiante, horario, tareas concretas..."
                    }
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Incluye horario, duración aproximada y tipo de tareas.
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
                        ? "Ejemplo: buena presencia, trato con clientes, puntualidad..."
                        : "Ejemplo: mayor de edad, puntual, responsable..."
                    }
                  />
                </div>

                {/* 🔹 Imagen del CameYo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Imagen del CameYo (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleJobImageChange}
                    className="block w-full text-xs text-foreground-light/80 dark:text-foreground-dark/80
                      file:mr-3 file:py-1.5 file:px-3
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20"
                  />
                  <p className="text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Esta imagen se mostrará como portada del CameYo en el feed de estudiantes.
                  </p>

                  {jobImagePreview && (
                    <div className="mt-2">
                      <p className="text-[11px] text-foreground-light/70 dark:text-foreground-dark/70 mb-1">
                        Vista previa:
                      </p>
                      <div className="w-full max-w-xs aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <img
                          src={jobImagePreview}
                          alt="Vista previa del CameYo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
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

            {/* COLUMNA TIPS */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-4">
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
                      Añadir una imagen ayuda a que el CameYo destaque y se entienda mejor
                      el contexto.
                    </li>
                  </ul>
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