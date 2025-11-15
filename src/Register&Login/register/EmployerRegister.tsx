import { useMemo, useState } from "react";
import axios from "axios";
import Input from "../../Register&Login/components/Input";
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

// Dominio en minúsculas, sin espacios
function normalizeDomain(str: string): string {
  return str.trim().toLowerCase();
}

// Texto genérico solo sin espacios extremos
function normalizeGeneric(str: string): string {
  return str.trim();
}

export default function EmployerRegister() {
  const navigate = useNavigate();
  
  const [orgName, setOrgName] = useState("");
  const [lastName, setLastName] = useState(""); 
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [cedulaRuc, setCedulaRuc] = useState(""); 
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [dominio, setDominio] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [preferenciasCategorias, setPreferenciasCategorias] = useState("");
  const [tipoIdentidad, setTipoIdentidad] = useState("");
  // la foto ya no se guarda en estado; siempre se enviará como cadena vacía
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [gigType, setGigType] = useState("general");
  console.log(setGigType);

  const totalSteps = 10;
  const completedSteps = useMemo(() => {
    let done = 0;
    if (orgName.trim()) done++;
    if (lastName.trim()) done++;
    if (city.trim()) done++;
    if (email.trim()) done++;
    if (pwd && pwd.length >= 8) done++;
    if (phone.trim()) done++;
    if (cedulaRuc.trim() && cedulaRuc.length >= 10 && cedulaRuc.length <= 13) done++;
    if (fechaNacimiento && isValidDate(fechaNacimiento) && isAtLeast18(fechaNacimiento)) done++;
    if (dominio.trim()) done++;
    if (razonSocial.trim()) done++;
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
    dominio,
    razonSocial,
  ]);

  const percent = Math.round((completedSteps / totalSteps) * 100);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    // Validaciones básicas
    if (!orgName.trim()) err.orgName = "Ingresa el nombre de la organización o persona";
    if (!city.trim()) err.city = "Selecciona tu ciudad";
    if (!email.trim()) err.email = "Ingresa tu correo electrónico";
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";
    // La foto de perfil ya no es obligatoria ni se valida aquí; se enviará como string vacío

    // Validaciones de cédula/RUC
    if (cedulaRuc.trim()) {
      if (cedulaRuc.length < 10 || cedulaRuc.length > 13) 
        err.cedulaRuc = "La cédula/RUC debe tener entre 10 y 13 caracteres";
    }

    // Validaciones de fecha de nacimiento
    if (fechaNacimiento) {
      if (!isValidDate(fechaNacimiento)) 
        err.fechaNacimiento = "La fecha no puede ser tan lejana";
      else if (!isAtLeast18(fechaNacimiento)) 
        err.fechaNacimiento = "Debes tener al menos 18 años";
    }

    setErrors(err);
    if (Object.keys(err).length) return;

    // 🔹 NORMALIZACIONES ANTES DE ENVIAR AL BACKEND
    const nombreNormalizado = formatTitleCase(orgName);      // nombre
    const apellidoNormalizado = formatTitleCase(lastName);   // apellido
    const ciudadNormalizada = formatTitleCase(city);         // ciudad
    const emailNormalizado = normalizeEmail(email);          // email
    const dominioNormalizado = normalizeDomain(dominio);     // dominio
    const razonSocialNormalizada = formatTitleCase(razonSocial); // razón social
    const tipoIdentidadNormalizada = formatTitleCase(tipoIdentidad); // tipo identidad
    const preferenciasNormalizadas = normalizeGeneric(preferenciasCategorias);
    const telefonoNormalizado = normalizeGeneric(phone);
    const cedulaRucNormalizada = normalizeGeneric(cedulaRuc);

  
    const data = {
      nombre: nombreNormalizado || "",
      apellido: apellidoNormalizado || "",
      email: emailNormalizado,
      password: pwd,
      tipo_cuenta: "empleador",
      cedula_ruc: cedulaRucNormalizada,
      telefono: telefonoNormalizado,
      ciudad: ciudadNormalizada,
      // foto_perfil: fotoPerfilBase64, // Enviar como cadena vacía si no hay foto
      tipo_identidad: tipoIdentidadNormalizada || "",
      preferencias_categorias: preferenciasNormalizadas || "",
      dominio_corporativo: dominioNormalizado || "",
      razon_social: razonSocialNormalizada || "",
      fecha_nacimiento: fechaNacimiento || "",
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
        state: { email: emailNormalizado } 
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
          <Link to="/register" className="text-sm text-primary font-semibold hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Crear cuenta — Buscar trabajadores
          </h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Los datos serán verificados para mantener segura la comunidad CameYa.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nombre de organización o persona"
              placeholder="Ej: Club de Economía ESPOL"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              error={errors.orgName}
              required
            />
            <Input
              label="Apellido (si lo tienes)"
              placeholder="Ej: Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              placeholder="Ej: Guayaquil"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="usuario@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
          </div>

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres, incluye caracteres especiales"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={errors.pwd}
            required
          />

          <Input
            label="Teléfono"
            type="tel"
            placeholder="+593 99 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Cédula RUC"
            type="text"
            placeholder="Ej: 0991234560001"
            value={cedulaRuc}
            onChange={(e) => setCedulaRuc(e.target.value.replace(/\D/g, "").slice(0, 13))}
            error={errors.cedulaRuc}
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            error={errors.fechaNacimiento}
          />

          <Input
            label="Dominio Corporativo (si lo tienes)"
            type="text"
            placeholder="Ej: empresa.com"
            value={dominio}
            onChange={(e) => setDominio(e.target.value)}
          />

          <Input
            label="Razón Social (si lo tienes)"
            type="text"
            placeholder="Ej: ABC S.A."
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
          />

          <Input
            label="Preferencias de Categorías (si las tienes)"
            type="text"
            placeholder="Ej: Servicios varios, Eventos"
            value={preferenciasCategorias}
            onChange={(e) => setPreferenciasCategorias(e.target.value)}
          />

          <Input
            label="Tipo de Identidad (si lo tienes)"
            type="text"
            placeholder="Ej: Jurídica, Natural"
            value={tipoIdentidad}
            onChange={(e) => setTipoIdentidad(e.target.value)}
          />


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
              <a href="/terms" className="text-primary font-semibold hover:underline">
                Términos
              </a>{" "}
              y la{" "}
              <a href="/terms" className="text-primary font-semibold hover:underline">
                Política de Privacidad
              </a>.
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
