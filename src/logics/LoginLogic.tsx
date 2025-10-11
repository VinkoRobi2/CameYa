import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Loginn } from '../functions/Apiurl'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')  // Para manejar errores

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Llena los campos, por favor.')
      return
    }

    try {
      const response = await axios.post(`${Loginn}`, {
        email: email.trim(),
        password: password.trim(),
      })
      if (response.status === 200) {
        navigate('/dashboard')
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Un error ha ocurrido.')
      } else {
        setError('Error de conexión, intenta de nuevo más tarde.')
      }
    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-lg p-8 bg-white border border-gray-300 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">        {/* Flecha volver */}
        {/* Flecha volver, dentro de la caja */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-black text-sm font-medium"
            aria-label="Volver a inicio"
            type="button"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la página principal
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Inicia Sesión en FlashWorkEC</h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario o Email"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 placeholder-gray-500 transition-all duration-300"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 placeholder-gray-500 transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none transition-all duration-300 transform hover:scale-105"
          >
            Continuar
          </button>
        </form>

        <div className="my-6 flex items-center justify-center">
          <span className="text-gray-600">o</span>
        </div>
        <button className="w-full py-3 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:bg-gray-100 focus:outline-none hover:scale-105">
          <img src="/google-icon.webp" alt="Google icon" className="h-6 mr-2" />
          Continuar con Google
        </button>

        <button className="w-full py-3 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:bg-gray-100 focus:outline-none hover:scale-105">
          <img src="/apple-icon.png" alt="Apple icon" className="h-6 mr-2" />
          Continuar con Apple
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta en FlashWorkEC? ¡Regístrate ya!{' '}
            <a href="/signup" className="text-black hover:underline">
              Clickéame.
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
