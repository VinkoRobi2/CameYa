import { useMemo, useState } from "react";
import Input from "../../Register&Login/components/Input";
import { Link } from "react-router-dom";

type TipoIdentidad = "persona_natural" | "empresa" | "organizacion";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://4fd6fa9887ae.ngrok-free.app";
const REGISTER_ENDPOINT = `${API_BASE}/register`;
const UPLOAD_ENDPOINT = `${API_BASE}/upload`;

const correoPublico = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "proton.me", "icloud.com"];

// Catálogo de categorías
const CATEGORIES = [
  "servicios_varios","logistica","mensajeria","mantenimiento","limpieza","jardineria","mudanzas",
  "eventos","produccion_eventos","staff_eventos","animacion","dj","fotografia","video","edicion_video",
  "tutorias","clases_particulares","preparacion_examenes","idiomas","nivelacion",
  "soporte_it","desarrollo_web","desarrollo_mobile","qa_testing","soporte_tecnico","devops_basico",
  "analisis_datos","automatizacion","scraping_basico",
  "diseno_grafico","ux_ui","presentaciones","redaccion","copywriting","community_manager",
  "marketing_digital","seo_sem","gestion_anuncios",
  "data_entry","asistente_virtual","atencion_cliente","call_center","ventas","crm",
  "contabilidad_basica","facturacion","inventarios",
  "tramites_simples","investigacion_basica",
  "autocad_basico","modelado_3d_basico",
  "deportes","bienestar","promocion_salud",
];

function calcAge(isoDate: string): number {
  if (!isoDate) return 0;
  const dob = new Date(isoDate);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function getDomainFromEmail(email: string): string | null {
  const at = email.split("@")[1]?.trim().toLowerCase() || "";
  if (!at) return null;
  if (correoPublico.includes(at)) return null;
  return at;
}

export default function EmployerRegister() {
  // Básicos
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(""); // yyyy-mm-dd
  const edad = useMemo(() => calcAge(fechaNacimiento), [fechaNacimiento]);

  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  // Foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  // Identidad / documentos
  const [tipoIdentidad, setTipoIdentidad] = useState<TipoIdentidad>("persona_natural");
  const [cedulaPN, setCedulaPN] = useState("");
  const [rucPN, setRucPN] = useState("");
  const [rucEmpresa, setRucEmpresa] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

  // Categorías
  const [preferenciasCategorias, setPreferenciasCategorias] = useState<string[]>([]);
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState("");

  const dominioDetectado = useMemo(() => getDomainFromEmail(email), [email]);
  const [dominioCorporativo, setDominioCorporativo] = useState("");

  // Consentimientos
  const [declaraVeracidad, setDeclaraVeracidad] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const effectiveDominio = dominioCorporativo || dominioDetectado || null;

  const onToggleCategoria = (cat: string) => {
    setPreferenciasCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCategoriaPersonalizada = () => {
    const v = categoriaPersonalizada.trim().toLowerCase().replaceAll(" ", "_");
    if (!v) return;
    if (!preferenciasCategorias.includes(v)) {
      setPreferenciasCategorias((prev) => [...prev, v]);
    }
    setCategoriaPersonalizada("");
  };

  async function uploadFoto(file: File) {
    const form = new FormData();
    form.append("file", file);
    setSubiendoFoto(true);
    setServerMsg(null);
    try {
      const res = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.message || "No se pudo subir la imagen");
      }
      setFotoPerfil(data.url);
      setServerMsg("Foto subida correctamente.");
    } catch (e: any) {
      setServerMsg(e?.message || "Error al subir la foto.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  const onFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFoto(URL.createObjectURL(file));
    uploadFoto(file);
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!nombre.trim()) err.nombre = "Ingresa tu nombre";
    if (!apellido.trim()) err.apellido = "Ingresa tu apellido";
    if (!email.trim()) err.email = "Ingresa tu correo";
    if (!password || password.length < 8) err.password = "Mínimo 8 caracteres";
    if (!telefono.trim()) err.telefono = "Ingresa tu teléfono";
    if (!ciudad.trim()) err.ciudad = "Ingresa tu ciudad";
    if (!declaraVeracidad) err.veracidad = "Debes declarar veracidad de la información";
    if (!aceptaTerminos) err.terminos = "Debes aceptar Términos y Privacidad";

    if (tipoIdentidad === "persona_natural") {
      if (!cedulaPN.trim() && !rucPN.trim()) {
        err.docPN = "Ingresa cédula o RUC (al menos uno)";
      }
    } else {
      if (!razonSocial.trim()) err.razon_social = "Razón social es requerida";
      if (!rucEmpresa.trim()) err.rucEmpresa = "RUC es requerido";
      if (!effectiveDominio) {
        err.dominio_corporativo =
          "Usa un email con dominio corporativo o indica el dominio de tu organización";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMsg(null);
    if (!validate()) return;
    setLoading(true);

    const cedula_ruc_final =
      tipoIdentidad === "persona_natural"
        ? (rucPN?.trim() || cedulaPN?.trim() || "")
        : rucEmpresa?.trim();

    // Payload EXACTO: incluye fecha_nacimiento y edad
    const payload = {
      nombre,
      apellido,
      email,
      password,
      tipo_cuenta: "empleador",
      cedula_ruc: cedula_ruc_final,
      telefono,
      fecha_nacimiento: fechaNacimiento || null, // <-- incluido
      ciudad,
      foto_perfil: fotoPerfil || null,
      direccion: direccion || null,
      edad: edad || null, // <-- incluido

      ubicacion: ubicacion || null,

      tipo_identidad: (tipoIdentidad ?? null) as string | null,
      preferencias_categorias:
        preferenciasCategorias.length ? preferenciasCategorias.join(",") : null,
      dominio_corporativo: effectiveDominio,
      razon_social:
        tipoIdentidad === "persona_natural"
          ? null
          : razonSocial.trim()
          ? razonSocial.trim()
          : null,
    };

    try {
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerMsg(
          data?.message ?? "No se pudo completar el registro. Intenta nuevamente."
        );
      } else {
        setServerMsg(
          data?.message ?? "Usuario registrado correctamente. Verifica tu correo electrónico."
        );
      }
    } catch {
      setServerMsg("Error de red. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl px-6">
        <div className="mb-6">
          <Link to="/register" className="text-sm text-primary font-semibold hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Crear cuenta — Empleador
          </h1>
          <p className="mt-2 text-sm opacity-80">Los datos se verifican para mantener segura la comunidad.</p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errors.nombre} required />
          <Input label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} error={errors.apellido} required />

          <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />

          <Input label="Teléfono" type="tel" placeholder="+593 99 123 4567" value={telefono} onChange={(e) => setTelefono(e.target.value)} error={errors.telefono} required />
          <Input label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} error={errors.ciudad} required />

          {/* Fecha de nacimiento (para calcular edad) */}
          <div>
            <Input
              label="Fecha de nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
            {fechaNacimiento && (
              <p className="mt-1 text-xs opacity-70">Edad calculada: <b>{isNaN(edad) ? "-" : edad}</b></p>
            )}
          </div>

          <Input label="Dirección (opcional)" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <Input label="Ubicación (referencia / zona)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />

          {/* FOTO - SUBIDA DIRECTA */}
          <div className="md:col-span-2">
            <span className="block mb-1 text-sm font-semibold">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFotoChange}
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2"
            />
            <div className="mt-2 flex items-center gap-4">
              {previewFoto && (
                <img src={previewFoto} alt="preview" className="h-16 w-16 rounded-full object-cover border" />
              )}
              {fotoPerfil && !previewFoto && (
                <img src={fotoPerfil} alt="foto perfil" className="h-16 w-16 rounded-full object-cover border" />
              )}
              {subiendoFoto && <span className="text-sm opacity-70">Subiendo foto…</span>}
              {fotoPerfil && <span className="text-xs opacity-70 break-all">URL: {fotoPerfil}</span>}
            </div>
          </div>

          {/* IDENTIDAD */}
          <label className="block">
            <span className="block mb-1 text-sm font-semibold">Tipo de identidad</span>
            <select
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              value={tipoIdentidad}
              onChange={(e) => setTipoIdentidad(e.target.value as TipoIdentidad)}
            >
              <option value="persona_natural">Persona natural</option>
              <option value="empresa">Empresa</option>
              <option value="organizacion">Organización</option>
            </select>
          </label>

          {tipoIdentidad === "persona_natural" ? (
            <>
              <Input label="Cédula (opcional si usas RUC)" value={cedulaPN} onChange={(e) => setCedulaPN(e.target.value)} error={errors.docPN} />
              <Input label="RUC (opcional si usas Cédula)" value={rucPN} onChange={(e) => setRucPN(e.target.value)} error={errors.docPN} />
            </>
          ) : (
            <>
              <Input label="RUC (obligatorio)" value={rucEmpresa} onChange={(e) => setRucEmpresa(e.target.value)} error={errors.rucEmpresa} required />
              <Input label="Razón social" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} error={errors.razon_social} required />
            </>
          )}

          {/* CATEGORÍAS AMPLIADAS */}
          <div className="md:col-span-2">
            <span className="block mb-1 text-sm font-semibold">Categorías de contratación (opcional)</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => onToggleCategoria(cat)}
                  className={`px-3 py-1 rounded-full border transition ${
                    preferenciasCategorias.includes(cat)
                      ? "bg-primary text-white border-primary"
                      : "border-primary/30"
                  }`}
                >
                  {cat.replaceAll("_", " ")}
                </button>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="otra categoría..."
                  value={categoriaPersonalizada}
                  onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-primary/30 outline-none"
                />
                <button
                  type="button"
                  onClick={addCategoriaPersonalizada}
                  className="h-9 px-3 rounded-lg bg-primary text-white font-medium"
                >
                  Añadir
                </button>
              </div>
              {preferenciasCategorias.length > 0 && (
                <p className="w-full mt-2 text-xs opacity-70">
                  Seleccionadas: {preferenciasCategorias.map((c) => c.replaceAll("_", " ")).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* DOMINIO */}
          <div className="md:col-span-2">
            <Input
              label="Dominio corporativo (opcional)"
              placeholder={dominioDetectado ? `Sugerido: ${dominioDetectado}` : "Ej: micompañia.com"}
              value={dominioCorporativo}
              onChange={(e) => setDominioCorporativo(e.target.value)}
              error={errors.dominio_corporativo}
            />
            {dominioDetectado && !dominioCorporativo && (
              <p className="mt-1 text-xs opacity-70">
                Detectamos <b>{dominioDetectado}</b> por tu email. Si es correcto, puedes dejarlo vacío y lo usaremos.
              </p>
            )}
          </div>

          {/* CONSENTIMIENTOS */}
          <label className="md:col-span-2 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={declaraVeracidad}
              onChange={(e) => setDeclaraVeracidad(e.target.checked)}
            />
            <span>Declaro que la información ingresada es verídica y entiendo que el perfil puede ser verificado.</span>
          </label>
          {errors.veracidad && <p className="md:col-span-2 text-xs text-red-600 -mt-2">{errors.veracidad}</p>}

          <label className="md:col-span-2 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <a href="/terms" className="text-primary font-semibold hover:underline">Términos</a> y la{" "}
              <a href="/privacy" className="text-primary font-semibold hover:underline">Política de Privacidad</a>.
            </span>
          </label>
          {errors.terminos && <p className="md:col-span-2 text-xs text-red-600 -mt-2">{errors.terminos}</p>}

          {serverMsg && (
            <div className="md:col-span-2 p-3 rounded-lg border mt-2">
              <p className="text-sm">{serverMsg}</p>
            </div>
          )}

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading || subiendoFoto}
              className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Creando cuenta..." : subiendoFoto ? "Subiendo foto..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
