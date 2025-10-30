import { useState } from "react";
import axios from "axios";
import Input from "../../Register&Login/components/Input";
import { Link } from "react-router-dom";
import { Register } from "../../global_helpers/api";

export default function EmployerRegister() {
  const [orgName, setOrgName] = useState("");
  const [lastName, setLastName] = useState(""); // Apellido
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [cedulaRuc, setCedulaRuc] = useState(""); // Cedula RUC
  const [fechaNacimiento, setFechaNacimiento] = useState(""); // Fecha de nacimiento

  const [dominio, setDominio] = useState(""); // Dominio corporativo
  const [razonSocial, setRazonSocial] = useState(""); // Razon Social
  const [preferenciasCategorias, setPreferenciasCategorias] = useState(""); // Preferencias categorías
  const [tipoIdentidad, setTipoIdentidad] = useState(""); // Tipo identidad
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null); // Foto de perfil
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [gigType, setGigType] = useState("general"); // Estado para el tipo de actividad principal
  console.log(setGigType);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    // Validaciones
    if (!orgName.trim()) err.orgName = "Ingresa el nombre de la organización o persona";
    if (!city.trim()) err.city = "Selecciona tu ciudad";
    if (!email) err.email = "Ingresa tu correo electrónico";
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";
    if (!fotoPerfil) err.fotoPerfil = "La foto de perfil es obligatoria";
    setErrors(err);
    if (Object.keys(err).length) return;

    const [nombre, ...rest] = orgName.trim().split(/\s+/);
    const apellido = rest.join(" ");

    // Codificar la foto de perfil a Base64
    let fotoPerfilBase64 = "";
    if (fotoPerfil) {
      try {
        fotoPerfilBase64 = await fileToBase64(fotoPerfil); // Convertir archivo a Base64
      } catch {
        setErrors({ fotoPerfil: "No se pudo procesar la foto de perfil" });
        return;
      }
    }

    const data = {
      nombre: nombre || "",
      apellido: apellido || "",
      email,
      password: pwd,
      tipo_cuenta: "empleador",
      cedula_ruc: cedulaRuc,
      telefono: phone,
      ciudad: city,
      foto_perfil: fotoPerfilBase64, // Foto codificada en Base64
      tipo_identidad: tipoIdentidad || "", // Si existe
      preferencias_categorias: preferenciasCategorias || "",
      dominio_corporativo: dominio || "",
      razon_social: razonSocial || "",
      fecha_nacimiento: fechaNacimiento || "", // Incluir la fecha de nacimiento
      terminos_aceptados: true, // Siempre aceptado
      consentimiento: true, // Siempre consentido
      tipo_actividad: gigType, // Tipo de actividad principal
    };

    try {
      const response = await axios.post(Register, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Registro exitoso", response.data);
      alert("Registro exitoso. Por favor, verifica tu correo.");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo completar el registro";
      alert(msg);
    }
  };

  // Función para convertir la foto a Base64
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-2xl px-6">
        <div className="mb-6">
          <Link to="/register" className="text-sm text-primary font-semibold hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Crear cuenta — Buscar trabajadores</h1>
          <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Los datos serán verificados para mantener segura la comunidad CameYa.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
            onChange={(e) => setCedulaRuc(e.target.value)}
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
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

          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoPerfil(e.target.files ? e.target.files[0] : null)}
              required
            />
          </label>
          {errors.fotoPerfil && <p className="text-xs text-red-600 -mt-2">{errors.fotoPerfil}</p>}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/50"
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
            />
            <span>Confirmo que mi información es verídica y entiendo que CameYa revisa perfiles para evitar fraudes.</span>
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
            className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </section>
  );
}
