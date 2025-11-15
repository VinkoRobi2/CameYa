import { useMemo, useState } from "react";
import axios from "axios";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { REGISTER_URL } from "../../global_helpers/api";

// Primera letra de cada palabra en mayúscula, resto minúscula
// "mARiA péReZ" -> "Maria Pérez"
function formatTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Email en minúsculas, sin espacios
function normalizeEmail(str: string): string {
  return str.trim().toLowerCase();
}

// Texto genérico solo sin espacios extremos
function normalizeGeneric(str: string): string {
  return str.trim();
}

export default function EmployerRegister() {
  const navigate = useNavigate();

  // Nombres / apellidos del empleador (persona de contacto)
  const [orgName, setOrgName] = useState("");
  const [lastName, setLastName] = useState("");

  // Ubicación
  const [city, setCity] = useState("");

  // Datos de acceso
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  // Teléfono y documento
  const [phone, setPhone] = useState("");
  const [cedulaRuc, setCedulaRuc] = useState("");

  // Fecha de nacimiento
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  // Tipo de empleador: persona o empresa
  const [tipoEmpleador, setTipoEmpleador] = useState<"persona" | "empresa">(
    "persona"
  );

  // la foto ya no se guarda en estado; siempre se enviará como cadena vacía
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [gigType, setGigType] = useState("general");
  // Evita warning por variable no usada
  console.log(setGigType);

  // Función para validar edad mínima (18 años)
  const isAtLeast18 = (dateString: string): boolean => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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

  const totalSteps = 8; // nombres, apellidos, ubicación, email, pwd, teléfono, cédula/RUC, fecha
  const completedSteps = useMemo(() => {
    let done = 0;
    if (orgName.trim()) done++;
    if (lastName.trim()) done++;
    if (city.trim()) done++;
    if (email.trim()) done++;
    if (pwd && pwd.length >= 8) done++;
    if (phone.trim()) done++;

    if (
      cedulaRuc.trim() &&
      ((tipoEmpleador === "persona" && cedulaRuc.length === 10) ||
        (tipoEmpleador === "empresa" && cedulaRuc.length === 13))
    ) {
      done++;
    }

    if (
      fechaNacimiento &&
      isValidDate(fechaNacimiento) &&
      isAtLeast18(fechaNacimiento)
    ) {
      done++;
    }

    return done;
  }, [
    orgName,
    lastName,
    city,
    email,
    pwd,
    phone,
    cedulaRuc,
    fechaNacimiento,
    tipoEmpleador,
  ]);

  const percent = Math.round((completedSteps / totalSteps) * 100);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    // Validaciones básicas
    if (!orgName.trim()) err.orgName = "Ingresa tus nombres";
    if (!lastName.trim()) err.lastName = "Ingresa tus apellidos";
    if (!city.trim()) err.city = "Ingresa tu ubicación";
    if (!email.trim()) err.email = "Ingresa tu correo electrónico";
    if (!pwd || pwd.length < 8)
      err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!phone.trim()) err.phone = "Ingresa tu número de teléfono";
    if (!tipoEmpleador) err.tipoEmpleador = "Selecciona el tipo de empleador";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";

    // Validaciones de cédula/RUC según tipo de empleador
    if (!cedulaRuc.trim()) {
      err.cedulaRuc =
        tipoEmpleador === "empresa"
          ? "Ingresa tu RUC"
          : "Ingresa tu cédula";
    } else {
      if (tipoEmpleador === "persona" && cedulaRuc.length !== 10) {
        err.cedulaRuc = "La cédula debe tener 10 dígitos";
      } else if (tipoEmpleador === "empresa" && cedulaRuc.length !== 13) {
        err.cedulaRuc = "El RUC debe tener 13 dígitos";
      }
    }

    // Validaciones de fecha de nacimiento
    if (!fechaNacimiento) {
      err.fechaNacimiento = "Selecciona tu fecha de nacimiento";
    } else if (!isValidDate(fechaNacimiento)) {
      err.fechaNacimiento = "La fecha no puede ser tan lejana";
    } else if (!isAtLeast18(fechaNacimiento)) {
      err.fechaNacimiento = "Debes tener al menos 18 años";
    }

    setErrors(err);
    if (Object.keys(err).length) return;

    // 🔹 NORMALIZACIONES ANTES DE ENVIAR AL BACKEND
    const nombreNormalizado = formatTitleCase(orgName); // nombre
    const apellidoNormalizado = formatTitleCase(lastName); // apellido
    const ciudadNormalizada = formatTitleCase(city); // ciudad
    const emailNormalizado = normalizeEmail(email); // email
    const telefonoNormalizado = normalizeGeneric(phone);
    const cedulaRucNormalizada = normalizeGeneric(cedulaRuc);
    const tipoEmpleadorNormalizado = formatTitleCase(tipoEmpleador);

    const data = {
      nombre: nombreNormalizado || "",
      apellido: apellidoNormalizado || "",
      email: emailNormalizado,
      password: pwd,
      tipo_cuenta: "empleador",
      cedula_ruc: cedulaRucNormalizada,
      telefono: telefonoNormalizado,
      ciudad: ciudadNormalizada,
      fecha_nacimiento: fechaNacimiento || "",
      tipo_empleador: tipoEmpleadorNormalizado,
      terminos_aceptados: true,
      consentimiento: true,
      tipo_actividad: gigType,
    };

    try {
      setLoading(true);
      const response = await axios.post(REGISTER_URL, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Registro exitoso", response.data);

      // Redirigir a la página de confirmación
      navigate("/register/email-confirmation", {
        state: { email: emailNormalizado },
      });
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
          <Link
            to="/register"
            className="text-sm text-primary font-semibold hover:underline"
          >
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Crear cuenta — Buscar trabajadores
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Los datos serán verificados para mantener segura la comunidad
            CameYa.
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

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombres y apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nombres"
              placeholder="Ej: Ricardo José"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              error={errors.orgName}
              required
            />
            <Input
              label="Apellidos"
              placeholder="Ej: Puga Rabascall"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          {/* Ubicación y tipo de empleador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Ubicación"
              placeholder="Ej: Guayaquil"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              required
            />

            <div className="flex flex-col gap-1 text-sm">
              <label className="font-medium">Tipo de empleador</label>
              <select
                className="h-10 w-full rounded-lg border border-primary/30 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={tipoEmpleador}
                onChange={(e) =>
                  setTipoEmpleador(e.target.value as "persona" | "empresa")
                }
              >
                <option value="persona">Persona</option>
                <option value="empresa">Empresa</option>
              </select>
              {errors.tipoEmpleador && (
                <p className="text-xs text-red-600">{errors.tipoEmpleador}</p>
              )}
            </div>
          </div>

          {/* Cédula/RUC y teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={tipoEmpleador === "empresa" ? "RUC" : "Cédula"}
              type="text"
              placeholder={
                tipoEmpleador === "empresa"
                  ? "Ej: 1790012345001"
                  : "Ej: 0991234567"
              }
              value={cedulaRuc}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const maxLength = tipoEmpleador === "empresa" ? 13 : 10;
                setCedulaRuc(raw.slice(0, maxLength));
              }}
              error={errors.cedulaRuc}
              required
            />

            <Input
              label="Número de teléfono"
              type="tel"
              placeholder="+593 99 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              required
            />
          </div>

          {/* Fecha de nacimiento */}
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            error={errors.fechaNacimiento}
            required
          />

          {/* Correo y contraseña */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="usuario@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres, incluye caracteres especiales"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              error={errors.pwd}
              required
            />
          </div>

          {/* Checkboxes de verificación y términos */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
            />
            <span>
              Confirmo que mi información es verídica y entiendo que CameYa
              revisa perfiles para evitar fraudes.
            </span>
          </label>
          {errors.verify && (
            <p className="text-xs text-red-600 -mt-2">{errors.verify}</p>
          )}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <a
                href="/terms"
                className="text-primary font-semibold hover:underline"
              >
                Términos
              </a>{" "}
              y la{" "}
              <a
                href="/terms"
                className="text-primary font-semibold hover:underline"
              >
                Política de Privacidad
              </a>
              .
            </span>
          </label>
          {errors.agree && (
            <p className="text-xs text-red-600 -mt-2">{errors.agree}</p>
          )}

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