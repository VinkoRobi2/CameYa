// src/pages/PricingPage.tsx

export default function PricingPage() {
  return (
    <main className="pt-[80px] pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-6">Planes y Comisiones</h1>
        <p className="text-lg text-gray-700 mb-8">
          Durante la fase beta, cobramos una única comisión del <strong>10%</strong> sobre el valor final de cada trabajo.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Comisión Estándar */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">Comisión Estándar</h2>
            <p className="text-gray-600">10% del total del proyecto</p>
          </div>
          {/* Potenciar Perfil */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">Potenciar Perfil</h2>
            <p className="text-gray-600 mb-4">$5 USD / día</p>
            <p className="text-sm text-gray-500">Mayor visibilidad ante empleadores o freelancers.</p>
          </div>
          {/* Publicación Destacada */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">Publicación Destacada</h2>
            <p className="text-gray-600 mb-4">$3 USD / publicación</p>
            <p className="text-sm text-gray-500">Aparece en la parte superior de los listados.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
