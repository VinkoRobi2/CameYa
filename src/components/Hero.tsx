import * as React from 'react'
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const quickCategories = [
  'Diseño', 'Desarrollo', 'Marketing', 'Redacción',
  'Programación', 'Escritura', 'Soporte', 'Marketing'
] as const

export default function Hero() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'talent' | 'jobs'>('talent')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = (filter ?? query).trim()
    if (!q) return
    const path = mode === 'talent' ? '/talent' : '/jobs'
    navigate(`${path}?q=${encodeURIComponent(q)}`)
  }

  const title =
    mode === 'talent'
      ? '¡Conecta con el talento que buscas!'
      : '¡Encuentra el trabajo que quieres!'

  return (
    <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
      {/* Fondo */}
      <img
        src="/hero-bg.jpg"
        alt="Freelance workspace"
        className="absolute inset-0 w-full h-full object-cover animate-zoomSlow"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 space-y-6">
        <h1
          className="
            text-white text-4xl md:text-6xl font-extrabold text-center max-w-3xl
            animate-fadeUp animate-breathe shadow-lg
          "
        >
          {title}
        </h1>

        <div className="w-full max-w-3xl bg-white bg-opacity-90 rounded-2xl shadow-xl p-5 animate-fadeIn">
          <div className="flex overflow-hidden rounded-full bg-gray-200 mb-4">
            <button
              onClick={() => setMode('talent')}
              className={`flex-1 py-2 text-center font-medium transition 
                animate-bounceX
                ${
                  mode === 'talent'
                    ? 'bg-white text-primary shadow'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
            >
              Buscar Talento
            </button>
            <button
              onClick={() => setMode('jobs')}
              className={`flex-1 py-2 text-center font-medium transition 
                animate-bounceX2
                ${
                  mode === 'jobs'
                    ? 'bg-white text-primary shadow'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
            >
              Buscar Trabajo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex animate-fadeIn delay-300">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setFilter(null)
                }}
                placeholder="Ingresa rol, habilidad o palabra clave"
                className="w-full pl-12 pr-4 py-3 bg-white rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-r-full font-semibold hover:opacity-90 transition animate-pulseSlow"
            >
              Buscar
            </button>
          </form>

          {/* Marquee de categorías rápidas */}
          <div className="mt-6 relative overflow-x-hidden w-full">
            <div className="flex gap-4 whitespace-nowrap animate-marquee">
              {quickCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat)
                    setQuery('')
                  }}
                  className={`px-3 py-1 rounded-full border text-sm mx-1 transition
                    ${
                      filter === cat
                        ? 'bg-primary text-white border-primary animate-pulse'
                        : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
              {/* Duplicamos para lograr loop infinito */}
              {quickCategories.map(cat => (
                <button
                  key={cat + '-clone'}
                  onClick={() => {
                    setFilter(cat)
                    setQuery('')
                  }}
                  className={`px-3 py-1 rounded-full border text-sm mx-1 transition
                    ${
                      filter === cat
                        ? 'bg-primary text-white border-primary animate-pulse'
                        : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Animaciones personalizadas */}
      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0%);}
          100% { transform: translateX(-50%);}
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeUp {
          animation: fadeUp 1s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes breathe {
          0% { transform: scale(1); text-shadow: 0 2px 24px rgba(52,200,130,0.25);}
          50% { transform: scale(1.045); text-shadow: 0 4px 36px rgba(52,200,130,0.50);}
          100% { transform: scale(1); text-shadow: 0 2px 24px rgba(52,200,130,0.25);}
        }
        .animate-breathe {
          animation: breathe 4.2s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0;}
          to { opacity: 1;}
        }
        .animate-fadeIn {
          animation: fadeIn 1.3s ease both;
        }
        @keyframes zoomSlow {
          from { transform: scale(1);}
          to { transform: scale(1.06);}
        }
        .animate-zoomSlow {
          animation: zoomSlow 22s linear alternate infinite;
        }
        @keyframes bounceX {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-5px);}
        }
        .animate-bounceX {
          animation: bounceX 2.5s infinite cubic-bezier(0.55,0,0.1,1);
        }
        .animate-bounceX2 {
          animation: bounceX 2.5s 1.25s infinite cubic-bezier(0.55,0,0.1,1);
        }
        .animate-pulseSlow {
          animation: pulse 3s infinite;
        }
        `}
      </style>
    </section>
  )
}
