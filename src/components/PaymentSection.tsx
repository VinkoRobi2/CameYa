// src/components/PaymentSection.tsx
import { useNavigate } from 'react-router-dom'

export default function PaymentSection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-white-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Pagos seguros con PayPhone
          </h2>
          <p className="text-gray-700 mb-6">
            Tus fondos quedan en depósito con PayPhone y sólo se liberan cuando confirmas la entrega.
          </p>
          <button
            onClick={() => navigate('/jobs/new')}
            className="px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition"
          >
            Publica un proyecto
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/payphone-logo.png"
            alt="PayPhone escrow"
            className="object-contain w-[300px] h-[200px]"
          />
        </div>
      </div>
    </section>
  )
}
