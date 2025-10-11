// src/components/FAQ.tsx
import { FC } from 'react'

const faqs = [
  {
    question: '¿Cómo funciona el pago seguro con PayPhone?',
    answer:
      'Tus fondos quedan retenidos en un escrow gestionado por PayPhone. Solo liberamos el pago al freelancer cuando confirmas que el trabajo se ha completado satisfactoriamente. Si no estás conforme, puedes solicitar la devolución y recibirás tu dinero de vuelta al instante.',
  },
  {
    question: '¿Puedo publicar trabajos de cualquier duración?',
    answer:
      'Sí. En FlashWorkEC puedes crear proyectos “Flash” de 1–2 días, encargos semanales o colaboraciones de largo plazo de semanas o meses. Tú decides la duración y el precio.',
  },
  {
    question: '¿Cómo encuentro al freelancer adecuado?',
    answer:
      'Utiliza nuestro buscador para filtrar por habilidad, categoría y palabra clave. Además, tienes acceso a valoraciones y portfolios para tomar la mejor decisión.',
  },
  {
    question: '¿Qué sucede si el freelancer no entrega?',
    answer:
      'Si el freelancer no cumple con los requisitos del proyecto, puedes iniciar una disputa antes de liberar el pago. Reembolsaremos tus fondos según nuestras políticas de protección al cliente.',
  },
  {
    question: '¿Hay alguna comisión por usar la plataforma?',
    answer:
      'FlashWorkEC cobra una comisión transparente sobre los proyectos completados con éxito. Consulta nuestra sección de Precios para ver las tarifas detalladas.',
  },
] as const

export const FAQ: FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <summary className="cursor-pointer select-none flex justify-between items-center p-4 text-lg font-medium text-gray-800 group-open:text-primary transition">
                {question}
                <span className="ml-2 transform group-open:rotate-180 transition">
                  ▼
                </span>
              </summary>
              <div className="p-4 pt-0 text-gray-600 border-t border-gray-200">
                {answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
