/* === WorkerRegister.tsx COMPLETO CON navigate('/check-email') === */
import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import axios from "axios";
import { REGISTER_URL } from "../../global_helpers/api";
import Input from "../../Register&Login/components/Input";
import { Link, useNavigate } from "react-router-dom";

const SECTOR_SUGGESTIONS = ["general","eventos","tutorías","soporte / it","contenido / creativo","servicios varios"];
const UNIVERSITY = "ESPOL";

export default function WorkerRegister() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [carrera, setCarrera] = useState("");

  const [skillsInput, setSkillsInput] = useState("");
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [preference, setPreference] = useState("general");
  const [availability, setAvailability] = useState("part-time");
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
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkillFromInput(); }
  };
  const removeSkill = (s: string) => setSkillsTags((prev) => prev.filter((x) => x !== s));
  const espolRegex = /^[a-zA-Z0-9._%+-]+@espol\.edu\.ec$/i;

  const totalSteps = 12;
  const completedSteps = useMemo(() => {
    let done = 0;
    if (firstName.trim()) done++;
    if (lastName.trim()) done++;
    if (cedula.trim()) done++;
    if (telefono.trim()) done++;
    if (fechaNacimiento) done++;
    if (email.trim() && espolRegex.test(email.trim())) done++;
    if (pwd && pwd.length >= 8) done++;
    if (carrera.trim()) done++;
    if (skillsTags.length > 0) done++;
    if (preference.trim()) done++;
    if (availability) done++;
    if (verify && agree) done++;
    return done;
  }, [firstName,lastName,cedula,telefono,fechaNacimiento,email,pwd,carrera,skillsTags,preference,availability,verify,agree]);
  const percent = Math.round((completedSteps / totalSteps) * 100);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!firstName.trim()) err.firstName = "Ingresa tus nombres";
    if (!lastName.trim()) err.lastName = "Ingresa tus apellidos";
    if (!cedula.trim()) err.cedula = "Ingresa tu cédula";
    if (!telefono.trim()) err.telefono = "Ingresa tu teléfono";
    if (!fechaNacimiento) err.fechaNacimiento = "Selecciona tu fecha de nacimiento";
    if (!email.trim()) err.email = "Ingresa tu correo electrónico";
    else if (!espolRegex.test(email.trim())) err.email = "Solo se admiten correos @espol.edu.ec por el momento";
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!carrera.trim()) err.carrera = "Ingresa tu carrera";
    if (skillsTags.length === 0) err.skills = "Añade al menos una habilidad";
    if (!preference.trim()) err.preference = "Indica tu sector de preferencia";
    if (!availability) err.availability = "Selecciona tu disponibilidad";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";
    setErrors(err);
    if (Object.keys(err).length) return;

    const payload = {
      nombre: firstName.trim(),
      apellido: lastName.trim(),
      email,
      password: pwd,
      tipo_cuenta: "estudiante",
      cedula,
      telefono,
      fecha_nacimiento: fechaNacimiento,
      carrera,
      universidad: UNIVERSITY,
      habilidades: skillsTags,
      sector_preferencia: preference,
      disponibilidad: availability,
    };

    try {
      setLoading(true);
      await axios.post(REGISTER_URL, payload);
      navigate("/check-email", { state: { email } });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "No se pudo completar el registro";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-2xl px-6">
        <div className="mb-6">
          <Link to="/register" className="text-sm text-primary font-semibold hover:underline">← Volver</Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Crear cuenta — Buscar trabajo</h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">Mantén tu perfil auténtico para una comunidad segura en CameYa.</p>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1"><span>Progreso</span><span>{percent}%</span></div>
          <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Nombres" placeholder="Tus nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} autoComplete="given-name" required />
            <Input label="Apellidos" placeholder="Tus apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} autoComplete="family-name" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Cédula" placeholder="0000000000" value={cedula} onChange={(e) => setCedula(e.target.value)} error={errors.cedula} required />
            <Input label="Teléfono" placeholder="+593 9xxxxxxxx" value={telefono} onChange={(e) => setTelefono(e.target.value)} error={errors.telefono} required />
          </div>

          <Input label="Fecha de nacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} error={errors.fechaNacimiento} required />
          <Input label="Correo electrónico" type="email" placeholder="usuario@espol.edu.ec" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={pwd} onChange={(e) => setPwd(e.target.value)} error={errors.pwd} autoComplete="new-password" required />
          <Input label="Carrera" placeholder="Administración / Computación / ..." value={carrera} onChange={(e) => setCarrera(e.target.value)} error={errors.carrera} required />
          <Input label="Universidad" value="ESPOL" onChange={() => {}} disabled />

          {/* Habilidades */}
          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">Habilidades (tags)</label>
            <div className="flex items-center gap-2">
              <input className="flex-1 rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40" placeholder="Escribe una habilidad y presiona Enter (ej: Excel)" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} onKeyDown={onSkillKeyDown} />
              <button type="button" onClick={addSkillFromInput} className="px-3 h-10 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors text-sm">Añadir</button>
            </div>
            {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}
            {skillsTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skillsTags.map((s) => (
                  <span key={s} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} aria-label={`Eliminar ${s}`} className="rounded-full px-1.5 hover:bg-primary/10">×</button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">Máximo 15 habilidades.</p>
          </div>

          {/* Sector de preferencia */}
          <div className="w-full">
            <label className="block mb-1 text-sm font-semibold">Sector de preferencia</label>
            <input list="sector-options" className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40" placeholder="Escribe o elige un sector (puedes proponer uno nuevo)" value={preference} onChange={(e) => setPreference(e.target.value)} onBlur={(e) => setPreference(e.target.value.trim())} />
            <datalist id="sector-options">{SECTOR_SUGGESTIONS.map((opt) => (<option key={opt} value={opt} />))}</datalist>
            {errors.preference && <p className="text-xs text-red-600 mt-1">{errors.preference}</p>}
            <p className="mt-1 text-xs text-foreground-light/70 dark:text-foreground-dark/70">Sugerencias disponibles, pero también puedes escribir tu propio sector.</p>
          </div>

          {/* Disponibilidad */}
          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Disponibilidad</span>
            <select className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40" value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="part-time">Parcial (tardes/noches)</option>
              <option value="weekends">Fines de semana</option>
              <option value="fulltime-short">Tiempo completo (corto)</option>
            </select>
            {errors.availability && <p className="text-xs text-red-600 mt-1">{errors.availability}</p>}
          </label>

          {/* Aceptaciones */}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50" checked={verify} onChange={(e) => setVerify(e.target.checked)} />
            <span>Confirmo que mi información es verídica y entiendo que CameYa revisa perfiles para evitar fraudes.</span>
          </label>
          {errors.verify && <p className="text-xs text-red-600 -mt-2">{errors.verify}</p>}

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span> Acepto los <a href="/terms" className="text-primary font-semibold hover:underline">Términos</a> y la <a href="/terms" className="text-primary font-semibold hover:underline">Política de Privacidad</a>. </span>
          </label>
          {errors.agree && <p className="text-xs text-red-600 -mt-2">{errors.agree}</p>}

          <button type="submit" disabled={loading} className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? "Enviando..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </section>
  );
}
