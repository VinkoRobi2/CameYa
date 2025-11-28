import { motion } from "framer-motion";
import BackNav from "../../ui/BackNav";

export default function TermsAndPriv() {
  const updated = "27 de noviembre de 2025"; // Actualiza esta fecha cuando cambien las políticas

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
            <li>
              <a href="#definiciones" className="underline underline-offset-2">
                Definiciones
              </a>
            </li>
            <li>
              <a href="#terminos" className="underline underline-offset-2">
                Términos de Servicio
              </a>
            </li>
            <li>
              <a href="#privacidad" className="underline underline-offset-2">
                Política de Privacidad
              </a>
            </li>
            <li>
              <a href="#cookies" className="underline underline-offset-2">
                Uso de Cookies
              </a>
            </li>
            <li>
              <a href="#contacto" className="underline underline-offset-2">
                Contacto legal
              </a>
            </li>
          </ul>
        </nav>

        {/* Definiciones */}
        <section id="definiciones" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Definiciones</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li>
              <span className="font-semibold">CameYa:</span> Plataforma web que
              conecta personas que buscan contratar trabajos puntuales de corta
              duración con personas (en especial estudiantes universitarios) que
              desean realizar dichos trabajos.
            </li>
            <li>
              <span className="font-semibold">CameSeekers:</span> Usuarios que
              publican trabajos o buscan contratar (empleadores, personas o
              empresas).
            </li>
            <li>
              <span className="font-semibold">CameMakers:</span> Usuarios que se
              postulan a los trabajos (estudiantes u otros prestadores de
              servicios).
            </li>
            <li>
              <span className="font-semibold">Usuario:</span> Cualquier persona
              que crea una cuenta en la plataforma, ya sea CameSeeker o
              CameMaker.
            </li>
            <li>
              <span className="font-semibold">Cuenta institucional:</span>{" "}
              Correo universitario requerido para verificación de identidad
              estudiantil (cuando aplique).
            </li>
            <li>
              <span className="font-semibold">Contenido:</span> Datos,
              descripciones de trabajos, mensajes y archivos que los usuarios
              comparten en CameYa.
            </li>
            <li>
              <span className="font-semibold">Interacciones fuera de la
              plataforma:</span>{" "}
              Reuniones presenciales, llamadas, transferencias de dinero,
              mensajes por WhatsApp u otras apps ajenas a CameYa.
            </li>
          </ul>
        </section>

        {/* Términos */}
        <section id="terminos" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">
            Términos de Servicio
          </h2>

          <details className="mt-4 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              1. Aceptación y elegibilidad
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Al usar CameYa aceptas estos Términos y la Política de
                Privacidad. Si no estás de acuerdo, debes dejar de utilizar la
                plataforma.
              </p>
              <p>
                Para registrarte debes tener al menos 18 años y capacidad legal
                para contratar de acuerdo con la normativa aplicable. Para
                perfiles de estudiante, puede requerirse{" "}
                <span className="font-semibold">correo institucional</span> de
                una universidad local.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              2. Cuentas, verificación y seguridad
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Debes proporcionar información veraz, actualizada y completa, y
                eres responsable de mantener la confidencialidad de tus
                credenciales de acceso. Eres plenamente responsable de toda
                actividad realizada desde tu cuenta.
              </p>
              <p>
                CameYa puede solicitar verificación adicional (por ejemplo,
                correo institucional, número de teléfono u otros mecanismos) para
                habilitar funciones o mejorar la confianza entre partes.
              </p>
              <p>
                Podemos suspender o cerrar cuentas que presenten indicios de
                fraude, suplantación de identidad, uso abusivo o incumplimiento
                de estos Términos.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              3. Publicación y contratación de trabajos
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Los CameSeekers deben publicar información clara sobre el
                trabajo, incluyendo, en la medida de lo posible: descripción,
                requisitos, ubicación/modalidad, horarios aproximados, y
                condiciones de pago.
              </p>
              <p>
                Los CameMakers deben postularse con información veraz sobre sus
                habilidades, experiencia y disponibilidad. Al aceptar un trabajo,
                adquieres la responsabilidad de cumplirlo de buena fe.
              </p>
              <p>
                <span className="font-semibold">
                  CameYa no es parte del contrato
                </span>{" "}
                entre usuarios. La relación jurídica (incluyendo pago,
                condiciones laborales o de servicios, y cualquier obligación
                adicional) existe exclusivamente entre CameSeeker y CameMaker.
              </p>
              <p>
                Si en el futuro se implementan mecanismos de depósito en
                garantía/escrow o pagos integrados, sus condiciones específicas
                se detallarán en documentos adicionales y prevalecerán sobre lo
                aquí indicado en lo que resulten más específicos.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              4. Conducta, contenido y reportes
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Está prohibido publicar contenido ilegal, engañoso,
                discriminatorio, violento, difamatorio o que infrinja derechos
                de terceros (incluyendo derechos de autor, marcas o datos
                personales).
              </p>
              <p>
                No puedes utilizar CameYa para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Ofrecer trabajos que impliquen actividades ilícitas o
                  peligrosas sin información adecuada.
                </li>
                <li>
                  Enviar spam, estafas, esquemas piramidales o solicitudes de
                  dinero ajenas al trabajo acordado.
                </li>
                <li>
                  Suplantar a otra persona o falsear tu identidad o tus
                  credenciales.
                </li>
              </ul>
              <p>
                CameYa puede moderar, ocultar o eliminar contenido y cuentas que
                violen estos Términos, así como implementar medidas automatizadas
                y revisión manual ante reportes de otros usuarios.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              5. Riesgos, seguridad y uso responsable
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                CameYa facilita el contacto entre personas, pero no puede
                controlar ni garantizar el comportamiento de los usuarios, ni
                supervisar las interacciones fuera de la plataforma. Siempre
                existen riesgos al tratar con terceros, especialmente en
                encuentros presenciales o en la gestión de pagos.
              </p>
              <p>
                Recomendamos:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Verificar la información del otro usuario (por ejemplo,
                  reputación, valoraciones, historial de trabajos).
                </li>
                <li>
                  Evitar compartir datos sensibles innecesarios (claves,
                  contraseñas, códigos de verificación, etc.).
                </li>
                <li>
                  Acordar lugares y horarios seguros para cualquier encuentro
                  presencial.
                </li>
                <li>
                  Ser cauteloso ante cualquier solicitud de adelantos de dinero
                  o pagos fuera de los canales que eventualmente defina la
                  plataforma.
                </li>
              </ul>
              <p>
                Si detectas conductas sospechosas, ofensivas, fraudulentas o
                peligrosas, debes utilizar las herramientas de reporte de CameYa
                y, en casos graves, contactar a las autoridades competentes.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              6. Limitación de responsabilidad
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                La plataforma se ofrece “tal cual” y “según disponibilidad”. En
                la máxima medida permitida por la ley aplicable, CameYa, sus
                administradores y colaboradores{" "}
                <span className="font-semibold">
                  no serán responsables
                </span>{" "}
                por:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Daños directos o indirectos derivados de interacciones entre
                  usuarios (incluyendo impagos, incumplimientos, conflictos,
                  daños personales o materiales).
                </li>
                <li>
                  Contenido generado por los usuarios o acciones realizadas por
                  ellos dentro o fuera de la plataforma.
                </li>
                <li>
                  Pérdida de datos, interrupciones del servicio, fallos técnicos
                  o de seguridad que no se deban a dolo o culpa grave de CameYa.
                </li>
              </ul>
              <p>
                Nada en estos Términos excluye responsabilidades que no puedan
                ser excluidas bajo la ley aplicable. En cualquier caso, y en la
                medida en que una limitación cuantitativa sea exigible, la
                responsabilidad total de CameYa frente a un usuario por cualquier
                reclamación vinculada a la plataforma se limitará, como máximo, al
                monto que dicho usuario haya pagado efectivamente a CameYa en los
                últimos 12 meses, si aplicase.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              7. Resolución de disputas y reclamaciones
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Cualquier desacuerdo entre CameSeeker y CameMaker (por ejemplo,
                sobre calidad del trabajo, montos a pagar o puntualidad) debe
                intentarse resolver directamente entre las partes, ya que{" "}
                <span className="font-semibold">CameYa no es parte del
                contrato</span>.
              </p>
              <p>
                No obstante, los usuarios pueden reportar desde la plataforma a
                aquellos que consideren que han incumplido sus obligaciones. Estos
                reportes podrán utilizarse para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Evaluar sanciones internas (advertencias, suspensiones,
                  bloqueos).
                </li>
                <li>
                  Mejorar los sistemas de reputación y seguridad.
                </li>
              </ul>
              <p>
                Para disputas legales relacionadas con el uso de CameYa (por
                ejemplo, sobre interpretación de estos Términos), las partes se
                comprometen primero a una instancia de diálogo o mediación
                amistosa. Si no se lograra un acuerdo, la controversia se someterá
                a la jurisdicción competente de los tribunales del domicilio
                principal de operación de CameYa, salvo que la ley imperativa
                disponga otra cosa.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              8. Cambios en la plataforma y terminación
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Podemos modificar, suspender o descontinuar partes de la
                plataforma en cualquier momento, así como introducir nuevas
                funcionalidades o limitar el acceso a ciertas secciones.
              </p>
              <p>
                También podemos finalizar o suspender cuentas que incumplan estos
                Términos o que supongan un riesgo para otros usuarios o para la
                plataforma.
              </p>
              <p>
                Notificaremos cambios sustanciales en estos Términos mediante la
                propia plataforma o por correo electrónico, según corresponda. El
                uso continuado de CameYa tras dichos cambios implica la aceptación
                de los nuevos términos.
              </p>
            </div>
          </details>
        </section>

        {/* Privacidad */}
        <section id="privacidad" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">
            Política de Privacidad
          </h2>

          <details className="mt-4 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              1. Datos que recopilamos
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-semibold">Datos de cuenta:</span> nombre,
                  correo electrónico, rol (CameSeeker/CameMaker), universidad (en
                  caso de estudiantes), número de teléfono u otros datos de
                  contacto que decidas proporcionar.
                </li>
                <li>
                  <span className="font-semibold">
                    Contenido de publicaciones:
                  </span>{" "}
                  ofertas de trabajo, postulaciones, valoraciones, mensajes y
                  archivos enviados a través de CameYa.
                </li>
                <li>
                  <span className="font-semibold">Datos técnicos:</span> dirección
                  IP aproximada, tipo de dispositivo, sistema operativo,
                  identificadores de sesión y datos de uso (páginas vistas,
                  acciones dentro del sitio, timestamps).
                </li>
              </ul>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              2. Finalidades del tratamiento
            </summary>
            <div className="mt-3 text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Operar la plataforma y habilitar coincidencias entre CameSeekers
                  y CameMakers.
                </li>
                <li>
                  Gestionar la seguridad, prevención de fraude, abuso,
                  suplantaciones y otros usos indebidos.
                </li>
                <li>
                  Proporcionar soporte técnico y atención al usuario.
                </li>
                <li>
                  Analizar el uso de la plataforma (en forma agregada y/o
                  anonimizada cuando sea posible) para mejorar producto,
                  funcionalidades y experiencia.
                </li>
                <li>
                  Enviar notificaciones relacionadas con la cuenta, cambios en los
                  Términos o mensajes operativos. Las comunicaciones de marketing,
                  si se usaran, se enviarán con base legal adecuada y podrás darte
                  de baja cuando corresponda.
                </li>
              </ul>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              3. Conservación y derechos del usuario
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Conservamos los datos personales mientras la cuenta esté activa o
                mientras sea necesario para las finalidades descritas, o durante
                el tiempo que exija la normativa aplicable (por ejemplo, para
                atención de reclamaciones o obligaciones legales).
              </p>
              <p>
                Dependiendo de la legislación aplicable, puedes tener derechos de
                acceso, rectificación, eliminación, oposición, limitación del
                tratamiento y portabilidad de tus datos. Para ejercerlos, puedes
                contactarnos a través de los canales indicados en la sección de
                Contacto legal.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              4. Seguridad de la información
            </summary>
            <div className="mt-3 text-sm leading-relaxed">
              <p>
                Aplicamos medidas razonables de seguridad técnica y organizativa
                para proteger los datos personales. No obstante, ningún sistema es
                100% infalible. Recomendamos utilizar contraseñas fuertes, no
                compartir tus credenciales y cerrar sesión cuando uses
                dispositivos compartidos.
              </p>
            </div>
          </details>

          <details className="mt-3 rounded-xl border border-primary/10 p-4">
            <summary className="cursor-pointer font-semibold">
              5. Compartición de datos con terceros
            </summary>
            <div className="mt-3 text-sm leading-relaxed space-y-2">
              <p>
                Podemos compartir datos con proveedores de servicios que nos
                ayudan a operar la plataforma (por ejemplo, hosting, analítica,
                correo transaccional), bajo acuerdos que les obligan a proteger la
                información y usarla solo para los fines indicados.
              </p>
              <p>
                También podremos divulgar información cuando sea requerido por
                autoridad competente o necesario para cumplir con una obligación
                legal, proteger nuestros derechos o los de otros usuarios, o
                investigar posibles violaciones de la ley o de estos Términos.
              </p>
            </div>
          </details>
        </section>

        {/* Cookies */}
        <section id="cookies" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Uso de Cookies</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Utilizamos cookies esenciales para el funcionamiento de la
            plataforma (por ejemplo, mantener tu sesión iniciada) y, de forma
            opcional, cookies analíticas para entender el uso del sitio y
            mejorar la experiencia. Puedes gestionar o bloquear las cookies desde
            la configuración de tu navegador. La desactivación de ciertas cookies
            puede afectar el funcionamiento de algunas partes de la plataforma.
          </p>
        </section>

        {/* Contacto legal */}
        <section id="contacto" className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">Contacto legal</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Para consultas sobre estos Términos o sobre la gestión de tus datos
            personales, puedes escribirnos a:{" "}
            <a
              className="underline underline-offset-2"
              href="mailto:legal@cameya.app"
            >
              legal@cameya.app
            </a>{" "}
            o{" "}
            <a
              className="underline underline-offset-2"
              href="mailto:soporte@cameya.app"
            >
              soporte@cameya.app
            </a>
            .
          </p>
        </section>
      </div>
    </section>
  );
}
