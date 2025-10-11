import { useState } from "react";
import Input from "../../Register&Login/components/Input";
import { Link } from "react-router-dom";

export default function EmployerRegister() {
  const [orgName, setOrgName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [gigType, setGigType] = useState("general");
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!orgName.trim()) err.orgName = "Ingresa el nombre de la organización o persona";
    if (!city.trim()) err.city = "Selecciona tu ciudad";
    if (!email) err.email = "Ingresa tu correo electrónico";
    if (!pwd || pwd.length < 8) err.pwd = "La contraseña debe tener mínimo 8 caracteres";
    if (!verify) err.verify = "Debes confirmar tu identidad";
    if (!agree) err.agree = "Debes aceptar los Términos y la Política";
    setErrors(err);
    if (Object.keys(err).length) return;

    console.log("REGISTER_EMPLOYER", { orgName, city, email, pwd, phone, gigType });
    alert("Registro enviado — demo.");
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

          <label className="block text-left w-full">
            <span className="block mb-1 text-sm font-semibold">Tipo de actividad principal</span>
            <select
              className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              value={gigType}
              onChange={(e) => setGigType(e.target.value)}
            >
              <option value="general">General</option>
              <option value="eventos">Eventos</option>
              <option value="tutorias">Tutorías</option>
              <option value="soporte">Soporte / IT</option>
              <option value="creativo">Contenido / Creativo</option>
              <option value="servicios">Servicios varios</option>
            </select>
          </label>

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
