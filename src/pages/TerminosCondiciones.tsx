// src/pages/TerminosCondiciones.tsx

export default function TerminosCondiciones() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-justify">
      <h1 className="text-3xl font-bold mb-6 text-center">Términos y Condiciones de Uso</h1>
      <p className="mb-2 text-sm text-gray-500 text-center">Fecha de última actualización: 01/08/2025</p>
      <section className="space-y-4">
        <p><strong>1. Introducción</strong><br />
          Bienvenido a FlashWorkEC (“la Plataforma”). Estos Términos regulan el uso de la Plataforma. Al registrarte y usarla, aceptas estos términos.
        </p>
        <p><strong>2. Definiciones</strong><br />
          <b>FlashEmployer:</b> quien contrata servicios.<br />
          <b>FlashWorker:</b> quien ofrece servicios.<br />
          <b>Escrow:</b> fondos retenidos por FlashWorkEC para asegurar el pago tras la entrega del servicio.
        </p>
        <p><strong>3. Registro y Cuenta</strong><br />
          Para usar la Plataforma debes ser mayor de edad y proporcionar datos reales.<br />
          Eres responsable de mantener la confidencialidad de tu cuenta.
        </p>
        <p><strong>4. Uso de la Plataforma</strong><br />
          No se permite contenido ilegal, ofensivo o fraudulento.<br />
          FlashWorkEC se reserva el derecho de remover contenido inapropiado.
        </p>
        <p><strong>5. Rol de FlashWorkEC</strong><br />
          Somos un intermediario que conecta oferta y demanda.<br />
          Realizamos verificaciones KYC para validar usuarios.<br />
          Retenemos pagos en Escrow hasta la confirmación de entrega.<br />
          Disponemos de sistemas de valoración para fomentar confianza.<br />
          No somos responsables de la calidad, cumplimiento ni resultados del trabajo entre usuarios.
        </p>
        <p><strong>6. Pagos y Comisiones</strong><br />
          FlashEmployer deposita el pago en Escrow antes del inicio.<br />
          Liberamos el pago al FlashWorker tras la confirmación de entrega.<br />
          FlashWorkEC cobra una comisión del 20 % sobre el valor bruto del servicio.
        </p>
        <p><strong>7. Cancelaciones y Reembolsos</strong><br />
          El FlashEmployer puede cancelar antes de iniciar y recibir reembolso completo.<br />
          Si el FlashWorker cancela sin causa, puede aplicarse penalización.<br />
          Solicitudes de reembolso se gestionan en un plazo máximo de 5 días hábiles.
        </p>
        <p><strong>8. Valoraciones y Reputación</strong><br />
          Ambas partes pueden calificarse mutuamente tras la finalización del servicio.<br />
          El sistema de valoraciones busca mantener la calidad y confianza en la plataforma.
        </p>
        <p><strong>9. Limitación de Responsabilidad</strong><br />
          La Plataforma se ofrece “tal cual”. No garantizamos disponibilidad ni resultados.<br />
          No somos responsables por daños indirectos ni incumplimientos entre usuarios.<br />
          Nuestra responsabilidad máxima se limita a la comisión cobrada en los últimos 6 meses.
        </p>
        <p><strong>10. Resolución de Disputas</strong><br />
          Las partes deben intentar resolver conflictos mediante diálogo directo usando la mensajería interna.<br />
          Si no se resuelve en 3 días, se puede solicitar asistencia limitada de FlashWorkEC.<br />
          En última instancia, las partes pueden acudir a mediación, arbitraje o justicia ordinaria.<br />
          FlashWorkEC solo administra fondos en calidad de intermediario, sin asumir responsabilidad en el fondo del conflicto.
        </p>
        <p><strong>11. Modificaciones</strong><br />
          Podemos modificar estos Términos en cualquier momento, notificando con al menos 15 días de anticipación.
        </p>
        <p><strong>12. Terminación</strong><br />
          Podemos suspender o cancelar cuentas por incumplimiento o fraude.
        </p>
        <p><strong>13. Ley Aplicable y Jurisdicción</strong><br />
          Se aplican las leyes del Ecuador. Las controversias se someten a tribunales de Guayaquil.
        </p>
        <p><strong>14. Contacto</strong><br />
          Para dudas o soporte, escríbenos a soporte@flashworkec.com
        </p>
      </section>
    </main>
  )
}
