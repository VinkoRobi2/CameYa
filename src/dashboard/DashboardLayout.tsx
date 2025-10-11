import { Link, Outlet, useLocation } from 'react-router-dom'

const roles = [
  { key: 'flashemployer', label: 'FlashEmployer' },
  { key: 'freelancer', label: 'Freelancer' },
  { key: 'flashworker', label: 'FlashWorker' },
]

export default function DashboardLayout() {
  const location = useLocation()
  const current = location.pathname.split('/')[2] || 'FlashEmployer'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header reutilizable */}
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">FlashWorkEC</span>
        <nav className="flex space-x-2">
          {roles.map(r => (
            <Link
              key={r.key}
              to={`/dashboard/${r.key}`}
              className={`px-4 py-2 rounded transition font-medium
                ${current === r.key
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-600 hover:bg-primary hover:text-white'}`}
            >
              {r.label}
            </Link>
          ))}
        </nav>
        {/* Opcional: menú usuario, logout, etc */}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
