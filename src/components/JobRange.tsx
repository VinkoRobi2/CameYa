// src/components/JobRange.tsx
import { Zap, Calendar, Briefcase, Users } from 'lucide-react'

export default function JobRange() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* TEXTO */}
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-bold text-primary">
            Desde trabajos flash hasta contratos a largo plazo
          </h2>
          <p className="text-gray-700 leading-relaxed">
            En FlashWorkEC encuentras de todo: tareas relámpago de 1–2 días, 
            proyectos cortos de una semana, o colaboraciones de meses. Sea cual 
            sea tu necesidad, tenemos el talento perfecto.
          </p>
          <button
            onClick={() => window.location.href = '/jobs'}
            className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition"
          >
            Ver todos los proyectos
          </button>
        </div>

        {/* GRÁFICO CON ÍCONOS */}
        <div className="md:w-1/2 flex justify-center relative">
          {/* CÍRCULO CENTRAL */}
          <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center relative">
            {/* ICONOS alrededor */}
            <Zap       className="absolute top-4 left-1/2 -translate-x-1/2 text-primary w-10 h-10" />
            <Calendar  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary w-10 h-10" />
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-10 h-10" />
            <Users     className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-10 h-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
