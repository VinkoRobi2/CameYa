import { useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import Input from "../../Register&Login/components/Input";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? ""; 
// Ajusta la ruta si tu backend difiere:
const REGISTER_ENDPOINT = `${API_BASE}/api/register/worker`;

function calcAgeFromDOB(dob: string) {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(Math.max(age, 0));
}

export default function WorkerRegister() {
  const navigate = useNavigate();

  // Backend schema fields
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tipoCuenta] = useState<"worker">("worker"); // fijo
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [institucionEducativa, setInstitucionEducativa] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [carrera, setCarrera] = useState("");
  const [nivelActual, setNivelActual] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [habilidadesBasicas, setHabilidadesBasicas] = useState<string[]>([]);
  const [disponibilidadDeTiempo, setDisponibilidadDeTiempo] = useState("part-time");
  const [password, setPassword] = useState("");

  // Extra UI
  const [skillsInput, setSkillsInput] = useState("");

  // Carnet (archivo) — SIEMPRE obligatorio
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);

  // Dos checkboxes en UI -> se envían como un solo campo: terminos_aceptados
  const [verify, setVerify] = useState(false);
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkillFromInput = () => {
    const cleaned = skillsInput.trim().replace(/,+$/, "");
    if (!cleaned) return;
    const parts = cleaned.split(",").map(s => s.trim()).filter(Boolean);
    const next = Array.from(new Set([...habilidadesBasicas, ...parts])).slice(0, 15);
    setHabilidadesBasicas(next);
    setSkillsInput("");
  };

  const onSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillFromInput();
    }
  };

  const removeSkill = (s: string) => {
    setHabilidadesBasicas(prev => prev.filter(x => x !== s));
  };

  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setStudentIdFile(null);
      setStudentIdPreview(null);
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, foto_de_carnet: "Formato inválido. Usa JPG, PNG o WEBP." }));
      setStudentIdFile(null);
      setStudentIdPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, foto_de_carnet: "La imagen supera 5 MB." }));
      setStudentIdFile(null);
      setStudentIdPreview(null);
      return;
    }
    setErrors(prev => {
      const { foto_de_carnet: _drop, ...rest } = prev;
      return rest;
    });
    setStudentIdFile(file);
    const reader = new FileReader();
    reader.onload = () => setStudentIdPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const err: Record<string, string> = {};

    if (!nombre.trim()) err.nombre = "Ingresa tu nombre";
    if (!apellido.trim()) err.apellido = "Ingresa tu apellido";
    if (!cedula.trim()) err.cedula = "Ingresa tu cédula";
    if (!email.trim()) err.email = "Ingresa tu correo";
    if (!telefono.trim()) err.telefono = "Ingresa tu teléfono";
    if (!institucionEducativa.trim()) err.institucion_educativa = "Ingresa tu institución educativa";
    if (!fechaNacimiento) err.fecha_nacimiento = "Selecciona tu fecha de nacimiento";
    if (!ubicacion.trim()) err.ubicacion = "Ingresa tu ubicación";
    if (!ciudad.trim()) err.ciudad = "Ingresa tu ciudad";
    if (!carrera.trim()) err.carrera = "Ingresa tu carrera";
    if (!nivelActual) err.nivel_actual = "Selecciona tu nivel actual";
    if (!universidad.trim()) err.universidad = "Ingresa tu universidad";
    if (!habilidadesBasicas.length) err.habilidades_basicas = "Añade al menos una habilidad";
    if (!disponibilidadDeTiempo) err.disponibilidad_de_tiempo = "Selecciona tu disponibilidad";
    if (!password || password.length < 8) err.password = "La contraseña debe tener mínimo 8 caracteres";
    if (!studentIdFile) err.foto_de_carnet = "Sube la foto de tu carnet estudiantil";

    // Ambos checkboxes deben estar marcados
    if (!(verify && agree)) err.terminos_aceptados = "Debes confirmar veracidad y aceptar Términos/Política.";

    // Reglas simples
    if (cedula && !/^\d{10}$/.test(cedula)) err.cedula = "La cédula debe tener 10 dígitos";
    if (telefono && !/^\+?\d{7,15}$/.test(telefono)) err.telefono = "Teléfono inválido";

    setErrors(err);
    return err;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return;

    try {
      setIsSubmitting(true);

      const edad = calcAgeFromDOB(fechaNacimiento);
      const terminos_aceptados = verify && agree;

      // Construye FormData con claves exactamente como el backend
      const form = new FormData();
      form.append("nombre", nombre);
      form.append("apellido", apellido);
      form.append("tipo_cuenta", tipoCuenta);
      form.append("cedula", cedula);
      form.append("email", email);
      form.append("telefono", telefono);
      form.append("institucion_educativa", institucionEducativa);
      form.append("fecha_nacimiento", fechaNacimiento);
      form.append("ubicacion", ubicacion);
      form.append("edad", edad);
      form.append("ciudad", ciudad);
      form.append("carrera", carrera);
      form.append("nivel_actual", nivelActual);
      if (studentIdFile) form.append("foto_de_carnet", studentIdFile);
      form.append("universidad", universidad);
      form.append("habilidades_basicas", JSON.stringify(habilidadesBasicas)); // o CSV si tu API lo requiere
      form.append("disponibilidad_de_tiempo", disponibilidadDeTiempo);
      form.append("password", password);
      form.append("terminos_aceptados", String(terminos_aceptados));

      // IMPORTANTE: NO seteamos Content-Type; el navegador lo hace para multipart
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        body: form,
        // credentials: "include", // <- descomenta si tu API usa cookies/sesiones
      });

      // Manejo de respuesta
      if (!res.ok) {
        // Intentar parsear errores del backend
        let payload: any = null;
        try { payload = await res.json(); } catch {}
        // Soporta shape tipo {errors:{campo:'msg'}} o {message:'...'}
        if (payload?.errors && typeof payload.errors === "object") {
          setErrors((prev) => ({ ...prev, ...payload.errors }));
        } else if (payload?.message) {
          setErrors((prev) => ({ ...prev, server: payload.message }));
          alert(payload.message);
        } else {
          alert(`Error ${res.status}: No se pudo completar el registro`);
        }
        return;
      }

      // Éxito: redirige al onboarding post-registro
      // Si la API responde con {id}, puedes guardarlo/adjuntarlo en query
      // const data = await res.json();
      navigate("/register/worker/post");
    } catch (e: any) {
      console.error(e);
      alert("Ocurrió un error de red. Revisa tu conexión o el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-2xl px-6">
        <div className="mb-6">
          <Link to="/register" className="text-sm text-primary font-semibold hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Crear cuenta — Buscar trabajo
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Mantén tu perfil auténtico para una comunidad segura en CameYa.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errors.nombre} autoComplete="given-name" required />
            <Input label="Apellido" placeholder="Tu apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} error={errors.apellido} autoComplete="family-name" required />
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cédula" placeholder="10 dígitos" value={cedula} onChange={(e) => setCedula(e.target.value)} error={errors.cedula} inputMode="numeric" required />
            <Input label="Teléfono" placeholder="Ej.: +5939XXXXXXXX" value={telefono} onChange={(e) => setTelefono(e.target.value)} error={errors.telefono} inputMode="tel" required />
          </div>

          {/* Email y Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Correo electrónico" type="email" placeholder="tucorreo@institucional.edu.ec" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
            <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="new-password" required />
          </div>

          {/* Fecha de nacimiento y Edad (auto) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-left w-full">
              <span className="block mb-1 text-sm font-semibold">Fecha de nacimiento</span>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                aria-invalid={!!errors.fecha_nacimiento}
                required
              />
              {errors.fecha_nacimiento && <p className="text-xs text-red-600 mt-1">{errors.fecha_nacimiento}</p>}
            </label>

            <Input label="Edad" value={calcAgeFromDOB(fechaNacimiento)} onChange={() => {}} error={errors.edad} readOnly required />
          </div>

          {/* Ciudad y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ciudad" placeholder="Ej.: Guayaquil" value={ciudad} onChange={(e) => setCiudad(e.target.value)} error={errors.ciudad} required />
            <Input label="Ubicación" placeholder="Ej.: Guayas, Ecuador" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} error={errors.ubicacion} required />
          </div>

          {/* Universidad e Institución educativa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Universidad" placeholder="Ej.: ESPOL, USFQ, PUCE..." value={universidad} onChange={(e) => setUniversidad(e.target.value)} error={errors.universidad} required />
            <Input label="Institución educativa" placeholder="Ej.: Facultad / Colegio / Instituto" value={institucionEducativa} onChange={(e) => setInstitucionEducativa(e.target.value)} error={errors.institucion_educativa} required />
          </div>

          {/* Carrera y Nivel actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Carrera" placeholder="Ej.: Economía, Ing. en Sistemas..." value={carrera} onChange={(e) => setCarrera(e.target.value)} error={errors.carrera} required />
            <label className="block text-left w-full">
              <span className="block mb-1 text-sm font-semibold">Nivel actual</span>
              <select
                className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                value={nivelActual}
                onChange={(e) => setNivelActual(e.target.value)}
                aria-invalid={!!errors.nivel_actual}
                required
              >
                <option value="">Selecciona tu nivel</option>
                <option value="1er semestre">1er semestre</option>
                <option value="2do semestre">2do semestre</option>
                <option value="3er semestre">3er semestre</option>
                <option value="4to semestre">4to semestre</option>
                <option value="5to semestre">5to semestre</option>
                <option value="6to semestre">6to semestre</option>
                <option value="7mo semestre">7mo semestre</option>
                <option value="8vo semestre">8vo semestre</option>
                <option value="9no semestre">9no semestre</option>
                <option value="10mo semestre">10mo semestre</option>
                <option value="Egresado/a">Egresado/a</option>
                <option value="Graduado/a">Graduado/a</option>
              </select>
              {errors.nivel_actual && <p className="text-xs text-red-600 mt-1">{errors.nivel_actual}</p>}
            </label>
          </div>

          {/* Carnet estudiantil (archivo) */}
          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">
              Foto de carnet estudiantil <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleStudentIdChange}
              className="block w-full cursor-pointer rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white hover:file:opacity-90"
              aria-invalid={!!errors.foto_de_carnet}
              required
            />
            {errors.foto_de_carnet && <p className="text-xs text-red-600 mt-1">{errors.foto_de_carnet}</p>}
            {studentIdPreview && (
              <div className="mt-3">
                <img src={studentIdPreview} alt="Vista previa carnet" className="max-h-32 rounded-md border border-primary/20" />
              </div>
            )}
          </div>

          {/* Habilidades (tags) */}
          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">Habilidades (tags)</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Escribe una habilidad y presiona Enter (ej: Excel)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={onSkillKeyDown}
                required={habilidadesBasicas.length === 0}
              />
              <button type="button" onClick={addSkillFromInput} className="px-3 h-10 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors text-sm">
                Añadir
              </button>
            </div>
            {habilidadesBasicas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {habilidadesBasicas.map((s) => (
                  <span key={s} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} aria-label={`Eliminar ${s}`} className="rounded-full px-1.5 hover:bg-primary/10">×</button>
                  </span>
                ))}
              </div>
            )}
            {errors.habilidades_basicas && <p className="text-xs text-red-600 mt-1">{errors.habilidades_basicas}</p>}
            <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">Máximo 15 habilidades.</p>
          </div>

          {/* Disponibilidad */}
          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Disponibilidad de tiempo</span>
            <select
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              value={disponibilidadDeTiempo}
              onChange={(e) => setDisponibilidadDeTiempo(e.target.value)}
              aria-invalid={!!errors.disponibilidad_de_tiempo}
              required
            >
              <option value="part-time">Parcial (tardes/noches)</option>
              <option value="weekends">Fines de semana</option>
              <option value="fulltime-short">Tiempo completo (corto)</option>
            </select>
            {errors.disponibilidad_de_tiempo && <p className="text-xs text-red-600 mt-1">{errors.disponibilidad_de_tiempo}</p>}
          </label>

          {/* Checkboxes -> terminos_aceptados */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
                checked={verify}
                onChange={(e) => setVerify(e.target.checked)}
                required
              />
              <span>Confirmo que mi información es verídica.</span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span>
                Acepto los{" "}
                <a href="/terms" className="text-primary font-semibold hover:underline">Términos</a> y la{" "}
                <a href="/terms" className="text-primary font-semibold hover:underline">Política de Privacidad</a>.
              </span>
            </label>

            {errors.terminos_aceptados && <p className="text-xs text-red-600">{errors.terminos_aceptados}</p>}
            {errors.server && <p className="text-xs text-red-600">{errors.server}</p>}
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </section>
  );
}
