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

      <main className="flex-1 px-4 md:px-10 pt-20 pb-16 overflow-y-auto bg-slate-50/70 dark:bg-background-dark">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header tipo SwipeHire */}
          <div className="mb-6 md:mb-8 flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Publicar un nuevo CameYo
            </h1>
            <p className="text-xs md:text-sm text-foreground-light/60 dark:text-foreground-dark/60">
              Crea una publicación clara para empezar a recibir postulaciones de
              estudiantes.
            </p>
          </div>

          {/* Card principal */}
          <div className="rounded-3xl bg-white/95 dark:bg-background-dark/95 border border-slate-100/80 dark:border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-4 sm:px-6 md:px-8 py-6 md:py-8">
            {/* Progreso arriba del form */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] md:text-xs text-foreground-light/60 dark:text-foreground-dark/70">
                <span>Progreso del formulario</span>
                <span>
                  {completedRequired}/{requiredFields.length} campos clave
                  completos ({progress}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Mensajes de error / éxito */}
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

            {/* FORMULARIO, mismo set de inputs que antes */}
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Fila: categoría + título (Job Title) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1.5">
                    Categoría *
                  </label>
                  {/* 🔹 CAMBIO: input → select con categorías fijas */}
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="Eventos y promociones">
                      Eventos y promociones
                    </option>
                    <option value="Apoyo en locales / comercio">
                      Apoyo en locales / comercio
                    </option>
                    <option value="Tareas administrativas / oficina">
                      Tareas administrativas / oficina
                    </option>
                    <option value="Apoyo digital y redes sociales">
                      Apoyo digital y redes sociales
                    </option>
                    <option value="Tutorías y apoyo académico">
                      Tutorías y apoyo académico
                    </option>
                    <option value="Apoyo logístico ligero">
                      Apoyo logístico ligero
                    </option>
                    <option value="Tareas remotas varias">
                      Tareas remotas varias
                    </option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1.5">
                    Título del CameYo *
                  </label>
                  <input
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={
                      isCompanyView
                        ? "Staff para activación de marca en campus ESPOL"
                        : "Ayudante para evento familiar en ESPOL"
                    }
                  />
                </div>
              </div>

              {/* Descripción tipo Job Description */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5">
                  Descripción del trabajo *
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[110px]"
                  placeholder={
                    isCompanyView
                      ? "Describe qué hará el estudiante durante la activación, horario, tareas, etc."
                      : "Describe qué esperas del estudiante, horario, duración y tareas concretas..."
                  }
                />
              </div>

              {/* Fila similar a Hourly Rate + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1.5">
                    Pago estimado (USD) *
                  </label>
                  <input
                    name="pago_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pago_estimado}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="25"
                  />
                  <p className="mt-1 text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Coloca el pago total del CameYo (no por hora).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs md:text-sm font-medium mb-1.5">
                      Ubicación *
                    </label>
                    <label className="inline-flex items-center gap-2 text-[11px] md:text-xs text-foreground-light/70 dark:text-foreground-dark/80">
                      <input
                        type="checkbox"
                        name="es_virtual"
                        checked={form.es_virtual}
                        onChange={handleChange}
                        className="rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span>CameYo virtual</span>
                    </label>
                  </div>

                  {!form.es_virtual && (
                    <input
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={
                        isCompanyView
                          ? "Local / punto de venta / stand en ESPOL"
                          : "Guayaquil, ESPOL, Campus Gustavo Galindo"
                      }
                    />
                  )}

                  {form.es_virtual && (
                    <p className="text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                      Al ser virtual no se solicitará una dirección física.
                    </p>
                  )}
                </div>
              </div>

              {/* Fila tipo Job Type + Método de pago / Negociable */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs md:text-sm font-medium mb-1.5">
                    Método de pago *
                  </label>
                  <select
                    name="metodo_pago"
                    value={form.metodo_pago}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia bancaria">
                      Transferencia bancaria
                    </option>
                  </select>
                  <p className="text-[11px] text-foreground-light/60 dark:text-foreground-dark/60">
                    Indica si pagarás en efectivo o por transferencia.
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

              {/* Requisitos (puede funcionar visualmente como "tags" libres) */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5">
                  Requisitos (opcional)
                </label>
                <textarea
                  name="requisitos"
                  value={form.requisitos}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50/60 dark:bg-background-dark border border-slate-200/80 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                  placeholder={
                    isCompanyView
                      ? "Ejemplo: buena presencia, trato con clientes, puntualidad..."
                      : "Ejemplo: mayor de edad, puntual, responsable..."
                  }
                />
              </div>

              {/* Imagen del CameYo, colocada abajo tipo campo extra */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium mb-1.5">
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
                  Esta imagen se mostrará como portada del CameYo en el feed de
                  estudiantes.
                </p>

                {jobImagePreview && (
                  <div className="mt-2 flex flex-col gap-2">
                    <span className="text-[11px] text-foreground-light/70 dark:text-foreground-dark/70">
                      Vista previa:
                    </span>
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

              {/* Botones tipo barra inferior de la card */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      isCompanyView
                        ? "/dashboard/employer/company"
                        : "/dashboard/employer/person"
                    )
                  }
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300/80 text-sm text-foreground-light/80 dark:text-foreground-dark/80 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-primary via-primary/90 to-pink-500 text-white text-sm font-semibold tracking-tight hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {loading ? "Publicando..." : "Publicar CameYo"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EmployerCreateJob;