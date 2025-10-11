import { motion } from "framer-motion";
import BackNav from "../ui/BackNav";

export default function TermsAndPriv() {
  const updated = "10 de octubre de 2025"; // Actualiza esta fecha cuando cambien las políticas

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
          Términos de Servicio &amp; Política de Privacidad
        </motion.h1>

        <p className="mt-2 text-sm text-foreground-light/70 dark:text-foreground-dark/70">
          Última actualización: {updated}
        </p>

        {/* Índice */}
        <nav className="mt-6 rounded-2xl border border-primary/10 bg-background-light/60 dark:bg-background-dark/60 p-4">
          <p className="text-sm font-semibold">Índice</p>
          <ul className="mt-2 grid gap-1 text-sm list-disc pl-5">
            <li><a href="#definiciones" className="underline underline-offset-2">Definiciones</a></li>
            <li><a href="#terminos" className="underline underline-offset-2">Términos de Servicio</a></li>
            <li><a href="#privacidad" className="underline underline-offset-2">Política de Privacidad</a></li>
            <li><a href="#cookies" className="underline underline-offset-2">Uso de Cookies</a></li>
            <li><a href="#contacto" className="underline underline-offset-2">Contacto legal</a></li>
          </ul>
        </nav>

        {/* Definiciones */}
        <section id="definiciones" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Definiciones</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li><span className="font-semibold">CameYa:</span> Plataforma web que conecta “CameSeekers” (quienes buscan contratar) con “CameMakers” (quienes buscan trabajos flash).</li>
            <li><span className="font-semibold">Usuario:</span> Persona que crea una cuenta en la plataforma.</li>
            <li><span className="font-semibold">Cuenta institucional:</span> Correo universitario requerido para verificación de identidad estudiantil (cuando aplique).</li>
            <li><span className="font-semibold">Contenido:</span> Datos, descripciones de trabajos, mensajes y archivos que los usuarios comparten en CameYa.</li>
          </ul>
        </section>

        {/* Términos */}
        <section id="terminos" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Términos de Servicio</h2>

          <details className="mt-4 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">1. Aceptación y elegibilidad</summary>
            <div className="mt-3 text-sm leading-relaxed">
              <p>Al usar CameYa aceptas estos Términos y la Política de Privacidad. Para registrarte debes tener al menos 18 años. Para perfiles de estudiante, puede requerirse <span className="font-semibold">correo institucional</span> de una universidad local.</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">2. Cuentas y verificación</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>Debes proporcionar información veraz y mantener la seguridad de tus credenciales.</p>
              <p>CameYa puede solicitar verificación adicional (p. ej., correo institucional) para habilitar funciones o mejorar la confianza entre partes.</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">3. Publicación y contratación de trabajos</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>Los CameSeekers deben publicar información clara sobre el trabajo, requisitos, ubicación/modalidad, tiempos y pago.</p>
              <p>Los CameMakers deben postularse con información veraz sobre habilidades y disponibilidad.</p>
              <p>CameYa no es parte del contrato entre usuarios; solo provee la plataforma de conexión. (Si existiesen métodos de depósito en garantía/escrow en el futuro, se detallarán en una adenda).</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">4. Conducta y contenido</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>Está prohibido publicar contenido ilegal, engañoso, discriminatorio o que infrinja derechos de terceros.</p>
              <p>CameYa puede moderar, ocultar o eliminar contenido que viole estos Términos.</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">5. Limitación de responsabilidad</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>La plataforma se ofrece “tal cual”. En la medida permitida por la ley, CameYa no es responsable por pérdidas resultantes de interacciones entre usuarios o interrupciones del servicio.</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">6. Cambios y terminación</summary>
            <div className="mt-3 text-sm leading-relaxed">
              <p>Podemos actualizar estos Términos y/o finalizar o suspender cuentas que incumplan las políticas. Notificaremos cambios sustanciales mediante la plataforma.</p>
            </div>
          </details>
        </section>

        {/* Privacidad */}
        <section id="privacidad" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Política de Privacidad</h2>

          <details className="mt-4 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">1. Datos que recopilamos</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de cuenta (nombre, correo, rol, universidad).</li>
                <li>Contenido de publicaciones (ofertas/solicitudes de trabajo).</li>
                <li>Datos técnicos (IP aprox., tipo de dispositivo, analítica de uso).</li>
              </ul>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">2. Finalidades</summary>
            <div className="mt-3 text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li>Operar la plataforma y habilitar coincidencias entre usuarios.</li>
                <li>Mejorar seguridad, prevención de fraude y soporte.</li>
                <li>Estadísticas y mejoras de producto (datos agregados y/o anonimizados cuando sea posible).</li>
              </ul>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">3. Conservación y derechos</summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>Conservamos datos por el tiempo necesario para los fines descritos o según lo exija la ley aplicable.</p>
              <p>Derechos del usuario: acceso, rectificación, eliminación, oposición y portabilidad (según normativa aplicable). Escríbenos para ejercerlos.</p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">4. Seguridad</summary>
            <div className="mt-3 text-sm leading-relaxed">
              <p>Aplicamos medidas razonables de seguridad técnica y organizativa. Ningún sistema es 100% infalible; recomendamos buenas prácticas (contraseñas fuertes, no compartir credenciales, etc.).</p>
            </div>
          </details>
        </section>

        {/* Cookies */}
        <section id="cookies" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Uso de Cookies</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Utilizamos cookies esenciales para el funcionamiento de la plataforma y, opcionalmente, cookies analíticas para entender el uso del sitio y mejorar la experiencia. Puedes gestionar tus preferencias desde la configuración del navegador.
          </p>
        </section>

        {/* Contacto legal */}
        <section id="contacto" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Contacto legal</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Para consultas sobre estos Términos o la Privacidad, escríbenos a:{" "}
            <a className="underline underline-offset-2" href="mailto:legal@cameya.app">legal@cameya.app</a>
            {" "}o{" "}
            <a className="underline underline-offset-2" href="mailto:soporte@cameya.app">soporte@cameya.app</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
