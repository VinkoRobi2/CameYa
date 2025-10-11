// src/components/Footer.tsx
import { Link } from 'react-router-dom'
import { Youtube, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const sections = [
    {
      title: '¿Quiénes somos?',
      links: [
        { label: 'Sobre nosotros', href: '/about' },
        { label: 'Contáctanos', href: '/contact' },
        { label: 'Glosario', href: '/glossary' },
        { label: 'Contratar', href: '/jobs' },
        { label: 'Aviso Legal y Copyright', href: '/aviso-legal' },
        { label: 'Política de Privacidad', href: '/privacidad' },
        { label: 'Términos y Condiciones', href: '/terminos' },
        { label: 'Configuración de cookies', href: '/cookies' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Centro de ayuda', href: '/help' },
        { label: 'Cómo funciona', href: '/how-it-works' },
        { label: 'Proyectos por hora', href: '/hourly-projects' },
        { label: 'Casos de éxito', href: '/success-stories' },
        { label: 'Planes de beneficios', href: '/pricing-plans' },
        { label: 'Prensa', href: '/press' },
        { label: 'Empresas', href: '/enterprise' },
        { label: 'Tutoriales para clientes', href: '/tutorials/clients' },
        { label: 'Tutoriales para freelancers', href: '/tutorials/freelancers' },
        { label: 'Mapa del sitio', href: '/sitemap' },
      ],
    },
    {
      title: 'Busca camello',
      links: [
        { label: 'IT & Programación', href: '/jobs?sub=it' },
        { label: 'Diseño & multimedia', href: '/jobs?sub=design' },
        { label: 'Traducción y contenidos', href: '/jobs?sub=translation' },
        { label: 'Marketing y Ventas', href: '/jobs?sub=marketing' },
        { label: 'Soporte Administrativo', href: '/jobs?sub=admin' },
        { label: 'Legales', href: '/jobs?sub=legal' },
        { label: 'Finanzas y Administración', href: '/jobs?sub=finance' },
        { label: 'Ingeniería y Manufactura', href: '/jobs?sub=engineering' },
      ],
    },
    {
      title: 'Cachuelos',
      links: [
        { label: 'Montaje de Stands', href: '/jobs?sub=stand-montage' },
        { label: 'Diseño de Stands', href: '/jobs?sub=stand-design' },
        { label: 'Personal para Ferias', href: '/jobs?sub=fair-staff' },
        { label: 'Promotores de Eventos', href: '/jobs?sub=event-promo' },
        { label: 'Atención en Stands', href: '/jobs?sub=stand-assist' },
        { label: 'Logística de Ferias', href: '/jobs?sub=fair-logistics' },
        { label: 'Servicio al Visitante', href: '/jobs?sub=visitor-service' },
        { label: 'Soporte Técnico Rápido', href: '/jobs?sub=tech-support' },
      ],
    },
    {
      title: 'Buscar Trabajadores',
      links: [
        { label: 'Programadores', href: '/talent?sub=programadores' },
        { label: 'Diseñadores', href: '/talent?sub=diseñadores' },
        { label: 'Redactores', href: '/talent?sub=redactores' },
        { label: 'Especialistas en Marketing', href: '/talent?sub=marketing' },
        { label: 'Soporte Administrativo', href: '/talent?sub=admin' },
        { label: 'Personal para Ferias', href: '/talent?sub=personal-ferias' },
        { label: 'Soporte Técnico', href: '/talent?sub=tech-support' },
        { label: 'Freelancers Creativos', href: '/talent?sub=creativos' },
      ],
    },
  ]

  return (
    <footer className="bg-gray-50 text-gray-700">
      {/* Top: logo, copyright, language + social */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            FlashWorkEC
          </Link>
          <span className="text-sm">
            © {new Date().getFullYear()} FlashWorkEC – Todos los derechos reservados
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <select className="border border-gray-300 rounded px-2 py-1 bg-white text-sm">
            <option>Español</option>
            <option>English</option>
          </select>
          <div className="flex items-center space-x-3 text-gray-500">
            <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Links grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="hover:text-primary transition">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
