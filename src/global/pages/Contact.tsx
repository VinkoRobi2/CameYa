import { Mail, Phone, MessageSquareText, MapPin, Globe, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import BackNav from "../../ui/BackNav";

type ContactItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  helper?: string;
};

const CONTACTS: ContactItem[] = [
  {
    label: "soporte@cameya.app",
    href: "mailto:soporte@cameya.app",
    icon: Mail,
    helper: "Soporte general y ayuda técnica",
  },
  {
    label: "+593 99 027 6272",
    href: "tel:+593990276272",
    icon: Phone,
    helper: "Lunes a viernes, 9:00–18:00",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/593990276272?text=Hola%20CameYa%2C%20necesito%20ayuda",
    icon: MessageSquareText,
    helper: "Tiempo de respuesta estimado: rápido",
  },
  {
    label: "Guayaquil, Ecuador",
    href: "https://maps.google.com/?q=Guayaquil%2C%20Ecuador",
    icon: MapPin,
    helper: "Atención remota",
  },
  {
    label: "cameya.ec",
    href: "https://cameya.ec",
    icon: Globe,
    helper: "Sitio web oficial",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/cameyaec",
    icon: Instagram,
    helper: "@cameya.ec",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cameya",
    icon: Linkedin,
    helper: "Empresa CameYa",
  },
];

export default function Contact() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <BackNav />
        <motion.h1
          className="font-display text-3xl md:text-4xl font-semibold tracking-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Contacto
        </motion.h1>

        <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          ¿Dudas, soporte o sugerencias? Estos son nuestros canales oficiales.
        </p>

        {/* Tarjetas de contacto */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((c, i) => (
            <motion.a
              key={c.label + i}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-4 rounded-2xl border border-primary/10 bg-background-light/60 dark:bg-background-dark/60 p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-tight">{c.label}</p>
                {c.helper && (
                  <p className="mt-1 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
                    {c.helper}
                  </p>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Formulario de contacto (opcional) */}
        <div className="mt-10 rounded-2xl border border-primary/10 p-6">
          <h2 className="text-xl font-semibold">Escríbenos</h2>
          <p className="mt-1 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Completa el formulario y te responderemos a la brevedad.
          </p>

          <form
            className="mt-4 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Conectar con tu endpoint (ej: /api/contact) o proveedor (Formspree, Resend, etc.)
              alert("¡Gracias! Tu mensaje ha sido enviado (demo).");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 outline-none focus:border-primary/40"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Correo</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Asunto</label>
              <input
                type="text"
                required
                placeholder="¿Cómo podemos ayudarte?"
                className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 outline-none focus:border-primary/40"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Mensaje</label>
              <textarea
                required
                rows={5}
                placeholder="Cuéntanos los detalles"
                className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 outline-none focus:border-primary/40"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" required className="h-4 w-4 rounded border-primary/30" />
                Acepto los{" "}
                <a className="underline underline-offset-2" href="/terms" onClick={(e) => e.stopPropagation()}>
                  Términos y Privacidad
                </a>
              </label>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 active:opacity-80"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>

        {/* Nota de SLA */}
        <p className="mt-6 text-xs text-foreground-light/60 dark:text-foreground-dark/60">
          *Tiempo de respuesta estimado: 24–48 h hábiles. Para urgencias operativas usa WhatsApp.
        </p>
      </div>
    </section>
  );
}
