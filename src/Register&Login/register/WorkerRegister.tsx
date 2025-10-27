import { useState } from "react";
import type { KeyboardEvent } from "react";
import axios from "axios";
import { Register } from "../../global_helpers/api";
import Input from "../../Register&Login/components/Input";
import { Link } from "react-router-dom";

export default function WorkerRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [edad, setEdad] = useState<number | "">("");
  const [institucion, setInstitucion] = useState("");
  const [carrera, setCarrera] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [dispTiempo, setDispTiempo] = useState(false);
  const [fotoCarnetFile, setFotoCarnetFile] = useState<File | null>(null);

  const [skillsInput, setSkillsInput] = useState("");
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [availability, setAvailability] = useState("part-time");
  const [preference, setPreference] = useState("general");

  const [verify, setVerify] = useState(false);
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const addSkillFromInput = () => {
    const cleaned = skillsInput.trim().replace(/,+$/, "");
    if (!cleaned) return;
    const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
    const next = Array.from(new Set([...skillsTags, ...parts])).slice(0, 15);
    setSkillsTags(next);
    setSkillsInput("");
  };

  const onSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillFromInput();
    }
  };

  const removeSkill = (s: string) => {
    setSkillsTags((prev) => prev.filter((x) => x !== s));
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!fullName.trim()) err.fullName = "Ingresa tu nombre completo";
    if (!email) err.email = "Ingresa tu correo electrónico";
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!cedula) err.cedula = "Ingresa tu cédula";
    if (!telefono) err.telefono = "Ingresa tu teléfono";
    if (!fechaNacimiento) err.fechaNacimiento = "Selecciona tu fecha de nacimiento";
    if (!ciudad) err.ciudad = "Ingresa tu ciudad";
    if (!direccion) err.direccion = "Ingresa tu dirección";
    if (edad === "" || Number.isNaN(Number(edad))) err.edad = "Ingresa tu edad";
    if (!institucion) err.institucion = "Ingresa tu institución educativa";
    if (!carrera) err.carrera = "Ingresa tu carrera";
    if (!universidad) err.universidad = "Ingresa tu universidad";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";

    setErrors(err);
    if (Object.keys(err).length) return;

    const [nombre, ...rest] = fullName.trim().split(/\s+/);
    const apellido = rest.join(" ");

    let fotoDeCarnet = "";
    if (fotoCarnetFile) {
      try {
        fotoDeCarnet = await fileToBase64(fotoCarnetFile);
      } catch {
        setErrors({ foto: "No se pudo procesar la foto de carnet" });
        return;
      }
    }


    const payload = {
      nombre: nombre || "",
      apellido: apellido || "",
      email,
      password: pwd,
      tipo_cuenta: "estudiante",
      cedula,
      telefono,
      fecha_nacimiento: fechaNacimiento,
      ciudad,
      direccion,
      edad: Number(edad),
      institucion_educativa: institucion,
      carrera,
      universidad,
       disponibilidad_de_tiempo: dispTiempo ? "true" : "false", 
      foto_de_carnet: fotoDeCarnet,
    };

    try {
      setLoading(true);
      const { data } = await axios.post(Register, payload);
      alert("Registro exitoso");
      console.log("REGISTER_WORKER_OK", data, { extras: { skillsTags, availability, preference } });
      window.location.href = "/login";
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo completar el registro";
      alert(msg);
    } finally {
      setLoading(false);
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
          <Input
            label="Nombre completo"
            placeholder="Tu nombre y apellido"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            autoComplete="name"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Cédula"
              placeholder="0000000000"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              error={errors.cedula}
              required
            />
            <Input
              label="Teléfono"
              placeholder="+593 9xxxxxxxx"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={errors.telefono}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Fecha de nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              error={errors.fechaNacimiento}
              required
            />
            <Input
              label="Edad"
              type="number"
              placeholder="18"
              value={edad}
              onChange={(e) => setEdad(e.target.value === "" ? "" : Number(e.target.value))}
              error={errors.edad}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              placeholder="Guayaquil"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              error={errors.ciudad}
              required
            />
            <Input
              label="Dirección"
              placeholder="Av. Ejemplo 123"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              error={errors.direccion}
              required
            />
          </div>

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tucorreo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres, incluye caracteres especiales"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={errors.pwd}
            autoComplete="new-password"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Institución educativa"
              placeholder="Colegio/Instituto"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              error={errors.institucion}
              required
            />
            <Input
              label="Carrera"
              placeholder="Administración"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              error={errors.carrera}
              required
            />
            <Input
              label="Universidad"
              placeholder="ESPOL / UEES / UCSG"
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
              error={errors.universidad}
              required
            />
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={dispTiempo}
              onChange={(e) => setDispTiempo(e.target.checked)}
            />
            <span>Tengo disponibilidad de tiempo</span>
          </label>

          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">Foto de carnet (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoCarnetFile(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2"
            />
            {errors.foto && <p className="text-xs text-red-600 mt-1">{errors.foto}</p>}
          </div>

          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">Habilidades (tags)</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Escribe una habilidad y presiona Enter (ej: Excel)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={onSkillKeyDown}
              />
              <button
                type="button"
                onClick={addSkillFromInput}
                className="px-3 h-10 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors text-sm"
              >
                Añadir
              </button>
            </div>
            {skillsTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skillsTags.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-sm"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      aria-label={`Eliminar ${s}`}
                      className="rounded-full px-1.5 hover:bg-primary/10"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">
              Máximo 15 habilidades.
            </p>
          </div>

          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Sector de preferencia</span>
            <select
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
            >
              <option value="general">General</option>
              <option value="eventos">Eventos</option>
              <option value="tutorias">Tutorías</option>
              <option value="soporte">Soporte / IT</option>
              <option value="creativo">Contenido / Creativo</option>
              <option value="servicios">Servicios varios</option>
            </select>
          </label>

          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Disponibilidad</span>
            <select
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="part-time">Parcial (tardes/noches)</option>
              <option value="weekends">Fines de semana</option>
              <option value="fulltime-short">Tiempo completo (corto)</option>
            </select>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
            />
            <span>
              Confirmo que mi información es verídica y entiendo que CameYa revisa perfiles para evitar fraudes.
            </span>
          </label>
          {errors.verify && <p className="text-xs text-red-600 -mt-2">{errors.verify}</p>}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <a href="/terms" className="text-primary font-semibold hover:underline">Términos</a>{" "}
              y la{" "}
              <a href="/terms" className="text-primary font-semibold hover:underline">Política de Privacidad</a>.
            </span>
          </label>
          {errors.agree && <p className="text-xs text-red-600 -mt-2">{errors.agree}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </section>
  );
}
