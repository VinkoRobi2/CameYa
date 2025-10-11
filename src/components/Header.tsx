import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const workOptions = [
    {
      avatar: '/freelancer-avatar.jpg',
      smallText: 'Proyectos Regulares',
      title: 'FREELANCER',
      desc: 'Proyectos de mayor duración que requieren más especialización.',
      links: [
        { label: 'Ver Proyectos Freelancer', href: '/jobs?type=freelancer' },
        { label: 'Publica un Proyecto', href: '/jobs/new?type=freelancer' },
      ],
    },
    {
      avatar: '/hire-fulltime-avatar.jpg',
      smallText: 'Trabajo a tiempo completo',
      title: 'TALENTO FULL-TIME',
      desc: 'Contrata talento pre-seleccionado por un periodo definido.',
      links: [
        { label: 'Ver Talento Full-Time', href: '/jobs?type=fulltime' },
        { label: 'Publica un Proyecto Full-Time', href: '/jobs/new?type=fulltime' },
      ],
    },
  ]

  const hireOptions = [
    {
      avatar: '/hire-fulltime-avatar.jpg',
      smallText: 'Quiero contratar',
      title: 'TALENTO FULL-TIME',
      desc: 'Contrata talento pre-seleccionado por un periodo definido.',
      links: [{ label: 'Conoce Más Full-Time', href: '/hire/fulltime' }],
    },
    {
      avatar: '/freelancer-avatar.jpg',
      smallText: 'Quiero contratar',
      title: 'FREELANCERS',
      desc: 'Contrata freelancers por objetivos u horas.',
      links: [
        { label: 'Conoce Más Freelancers', href: '/hire/freelancers' },
        { label: 'Descubre Freelancers', href: '/talent' },
      ],
    },
  ]

  const flashOptions = [
    {
      avatar: '/flashworker-avatar.jfif',
      smallText: 'Proyectos Flash',
      title: 'FLASHWORKER',
      desc: 'Trabajos puntuales, rápidos y sencillos de pocos días.',
      links: [
        { label: 'Ver Flashworkers', href: '/jobs?type=flashworker' },
        { label: 'Encuentra Cachuelos', href: '/jobs?sub=cachuelos' },
      ],
    },
    {
      avatar: '/cachuelos-avatar.jpg',
      smallText: 'Encargos Exprés',
      title: 'CACHUELOS',
      desc: 'Tareas cortas y fáciles para resultados inmediatos.',
      links: [
        { label: 'Ver Cachuelos', href: '/jobs?sub=cachuelos' },
        { label: 'Publica un Cachuelo', href: '/jobs/new?sub=cachuelos' },
      ],
    },
  ]

  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // Determina el dashboard path según rol activo o por defecto
  const dashboardPath = user?.lastRole
    ? `/dashboard/${user.lastRole}`
    : '/dashboard/flash-employer'

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-30">
      <div className="max-w-6xl mx-auto flex items-center p-4">
        <Link to="/" className="text-2xl font-bold text-primary flex-none">
          FlashWorkEC
        </Link>
        <nav className="flex-1">
          <ul className="flex justify-center space-x-6">
            {/* Buscar Trabajo */}
            <li className="relative group">
              <span className="cursor-pointer hover:text-primary">Buscar Trabajo</span>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-[480px] bg-white rounded-2xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <div className="p-6 flex space-x-8">
                  {workOptions.map(opt => (
                    <div key={opt.title} className="flex-1 text-center">
                      <img
                        src={opt.avatar}
                        alt={opt.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                      <p className="text-sm text-gray-600 mb-1">{opt.smallText}</p>
                      <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                      <p className="text-gray-700 text-sm mb-4">{opt.desc}</p>
                      <ul className="space-y-2 text-sm">
                        {opt.links.map(ln => (
                          <li key={ln.label}>
                            <Link
                              to={ln.href}
                              className="text-primary hover:underline"
                            >
                              {ln.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
            {/* Buscar Talento */}
            <li className="relative group">
              <span className="cursor-pointer hover:text-primary">Buscar Talento</span>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-[480px] bg-white rounded-2xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <div className="p-6 flex space-x-8">
                  {hireOptions.map(opt => (
                    <div key={opt.title} className="flex-1 text-center">
                      <img
                        src={opt.avatar}
                        alt={opt.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                      <p className="text-sm text-gray-600 mb-1">{opt.smallText}</p>
                      <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                      <p className="text-gray-700 text-sm mb-4">{opt.desc}</p>
                      <ul className="space-y-2 text-sm">
                        {opt.links.map(ln => (
                          <li key={ln.label}>
                            <Link
                              to={ln.href}
                              className="text-primary hover:underline"
                            >
                              {ln.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
            {/* FlashWork */}
            <li className="relative group">
              <span className="cursor-pointer hover:text-primary">FlashWork</span>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-[600px] bg-white rounded-2xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <div className="p-6 flex space-x-8">
                  {flashOptions.map(opt => (
                    <div key={opt.title} className="flex-1 text-center">
                      <img
                        src={opt.avatar}
                        alt={opt.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                      <p className="text-sm text-gray-600 mb-1">{opt.smallText}</p>
                      <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                      <p className="text-gray-700 text-sm mb-4">{opt.desc}</p>
                      <ul className="space-y-2 text-sm">
                        {opt.links.map(ln => (
                          <li key={ln.label}>
                            <Link
                              to={ln.href}
                              className="text-primary hover:underline"
                            >
                              {ln.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-primary">Precios</Link>
            </li>
          </ul>
        </nav>

        <div className="flex-none flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(dashboardPath)}
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
              >
                Ir a Dashboard
              </button>
              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  px-4 py-2 rounded-lg
                  border-2 border-primary text-primary
                  font-semibold
                  hover:bg-primary hover:text-blue
                  shadow-sm hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                  transform hover:scale-105
                  transition-all duration-200
                  active:scale-95
                "
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/signup"
                className="
                  px-4 py-2 rounded-lg
                  border-2 border-primary text-primary
                  font-semibold
                  hover:bg-primary hover:text-blue
                  shadow-sm hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                  transform hover:scale-105
                  transition-all duration-200
                  active:scale-95
                "
              >
                Regístrate
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
