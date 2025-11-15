/* === WorkerRegister.tsx (actualizado con validaciones de cédula, edad y fecha) === */
import { useMemo, useState } from "react";
import axios from "axios";
import { REGISTER_URL } from "../../global_helpers/api";
import Input from "../../Register&Login/components/Input";
import { Link, useNavigate } from "react-router-dom";

const UNIVERSITY = "ESPOL";

export default function WorkerRegister() {
  const navigate = useNavigate();
  const kurac = 6
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [carrera, setCarrera] = useState("");
  const [verify, setVerify] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totalSteps = 9;
  const espolRegex = /^[a-zA-Z0-9._%+-]+@espol\.edu\.ec$/i;

  // Función para validar edad mínima (18 años)
  const isAtLeast18 = (dateString: string): boolean => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  // Función para validar que la fecha no sea exageradamente futura
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const maxYear = today.getFullYear() + 5; // No permite fechas 5+ años en el futuro
    
    return date.getFullYear() <= maxYear;
  };

  const completedSteps = useMemo(() => {
    let done = 0;
    if (firstName.trim()) done++;
    if (lastName.trim()) done++;
    if (cedula.trim() && cedula.length >= 10 && cedula.length <= 13) done++;
    if (telefono.trim()) done++;
    if (fechaNacimiento && isAtLeast18(fechaNacimiento) && isValidDate(fechaNacimiento)) done++;
    if (email.trim() && espolRegex.test(email.trim())) done++;
    if (pwd && pwd.length >= 8) done++;
    if (carrera.trim()) done++;
    if (verify && agree) done++;
    return done;
  }, [firstName, lastName, cedula, telefono, fechaNacimiento, email, pwd, carrera, verify, agree]);

  const percent = Math.round((completedSteps / totalSteps) * 100);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    
    if (!firstName.trim()) err.firstName = "Ingresa tus nombres";
    if (!lastName.trim()) err.lastName = "Ingresa tus apellidos";
    
    if (!cedula.trim()) err.cedula = "Ingresa tu cédula";
    else if (cedula.length < 10 || cedula.length > 13) 
      err.cedula = "La cédula debe tener entre 10 y 13 caracteres";
    
    if (!telefono.trim()) err.telefono = "Ingresa tu teléfono";
    
    if (!fechaNacimiento) err.fechaNacimiento = "Selecciona tu fecha de nacimiento";
    else if (!isValidDate(fechaNacimiento)) 
      err.fechaNacimiento = "La fecha no puede ser tan lejana";
    else if (!isAtLeast18(fechaNacimiento)) 
      err.fechaNacimiento = "Debes tener al menos 18 años";
    
    if (!email.trim()) err.email = "Ingresa tu correo electrónico";
    else if (!espolRegex.test(email.trim())) 
      err.email = "Solo se admiten correos @espol.edu.ec por el momento";
    
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!carrera.trim()) err.carrera = "Ingresa tu carrera";
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
      // Enviar siempre foto de perfil como cadena vacía
      foto_perfil: "",
    };

    try {
      setLoading(true);
      await axios.post(REGISTER_URL, payload);
      navigate("/register/email-confirmation", { state: { email } });
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

        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Crear cuenta — Buscar trabajo
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Mantén tu perfil auténtico para una comunidad segura en CameYa.
          </p>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span>Progreso</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nombres"
              placeholder="Tus nombres"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
              required
            />
            <Input
              label="Apellidos"
              placeholder="Tus apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Cédula"
              placeholder="0000000000"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 13))}
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

          <Input
            label="Fecha de nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            error={errors.fechaNacimiento}
            required
          />
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="usuario@espol.edu.ec"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={errors.pwd}
            autoComplete="new-password"
            required
          />
          <Input
            label="Carrera"
            placeholder="Administración / Computación / ..."
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            error={errors.carrera}
            required
          />
          <Input label="Universidad" value="ESPOL" onChange={() => {}} disabled />

          {/* Aceptaciones */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
            />
            <span>
              Confirmo que mi información es verídica y entiendo que CameYa revisa perfiles para
              evitar fraudes.
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
              <a href="/terms" className="text-primary font-semibold hover:underline">
                Términos
              </a>{" "}
              y la{" "}
              <a href="/terms" className="text-primary font-semibold hover:underline">
                Política de Privacidad
              </a>
              .
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
