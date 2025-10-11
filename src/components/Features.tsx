// frontend-vite/src/components/Features.tsx
import { Lightbulb, Clock, ShieldCheck, User } from 'lucide-react'

const features = [
  {
    Icon: Lightbulb,
    title: 'Publica tu Trabajo',
    desc: 'Crea un post en menos de 2 minutos y recibe aplicaciones al instante.',
  },
  {
    Icon: Clock,
    title: 'Respuestas Rápidas',
    desc: 'Notificaciones en tiempo real para que no pierdas ninguna oportunidad.',
  },
  {
    Icon: ShieldCheck,
    title: 'Pago Seguro',
    desc: 'Fondos retenidos hasta que confirmes la entrega satisfactoria.',
  },
  {
    Icon: User,
    title: 'Construye Reputación',
    desc: 'Calificaciones y comentarios para aumentar tu confianza en la plataforma.',
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">Cómo Funciona</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
