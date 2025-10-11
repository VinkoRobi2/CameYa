import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Página no encontrada</h1>
      <p className="text-gray-600 mb-8">La página que buscas no existe o está en construcción.</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
