import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

      // Redirigimos al dashboard correspondiente
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <EmployerSidebar
        mode={tipoIdentidad && tipoIdentidad.toLowerCase() === "empresa" ? "company" : "person"}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-2">
            Publicar un nuevo CameYo
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Describe el trabajo que necesitas para que los estudiantes puedan
            postular.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoría *
              </label>
              <input
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Eventos, logística, atención al cliente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Título del CameYo *
              </label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Ayudante en evento universitario"
              />
            </div>

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
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="25"
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="negociable"
                    checked={form.negociable}
                    onChange={handleChange}
                    className="rounded border-slate-300"
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
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Guayaquil, ESPOL, Campus Gustavo Galindo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción del trabajo *
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[90px]"
                placeholder="Describe qué esperas del estudiante, horario, tareas, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Requisitos (opcional)
              </label>
              <textarea
                name="requisitos"
                value={form.requisitos}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[70px]"
                placeholder="Ejemplo: mayor de edad, puntual, experiencia básica en atención al cliente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Habilidades valoradas (opcional)
              </label>
              <textarea
                name="habilidades"
                value={form.habilidades}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[70px]"
                placeholder="Ejemplo: manejo de Excel, buena comunicación, trabajo en equipo..."
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Publicando..." : "Publicar CameYo"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    tipoIdentidad &&
                      tipoIdentidad.toLowerCase() === "empresa"
                      ? "/dashboard/employer/company"
                      : "/dashboard/employer/person"
                  )
                }
                className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EmployerCreateJob;
