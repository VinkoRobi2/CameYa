import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion, Transition } from 'framer-motion'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import AvisoLegal from './pages/AvisoLegal'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad'
import TerminosCondiciones from './pages/TerminosCondiciones'
import Footer from './components/Footer'
import NotFound from './pages/NotFound'
import LoginPage from './pages/Login'

// Dashboard imports (ajusta la ruta según la carpeta real)
import DashboardLayout from './dashboard/DashboardLayout'
import DashboardFlashEmployer from './dashboard/DashboardFlashEmployer'
import DashboardFreelancer from './dashboard/DashboardFreelancer'
import DashboardFlashWorker from './dashboard/DashboardFlashWorker'

export default function App() {
  const location = useLocation()

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  const pageTransition: Transition = {
    type: 'spring',
    damping: 20,
    stiffness: 100,
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home */}
        <Route
          path="/"
          element={
            <motion.div
              className="pt-[80px]"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <HomePage />
              <Footer />
            </motion.div>
          }
        />
        {/* Pricing */}
        <Route
          path="/pricing"
          element={
            <motion.div
              className="pt-[80px] pb-20 bg-white"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <PricingPage />
              <Footer />
            </motion.div>
          }
        />
        {/* Aviso Legal */}
        <Route
          path="/aviso-legal"
          element={
            <motion.div
              className="pt-[80px] pb-20 bg-white"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <AvisoLegal />
              <Footer />
            </motion.div>
          }
        />
        {/* Política de Privacidad */}
        <Route
          path="/privacidad"
          element={
            <motion.div
              className="pt-[80px] pb-20 bg-white"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <PoliticaPrivacidad />
              <Footer />
            </motion.div>
          }
        />
        {/* Términos y Condiciones */}
        <Route
          path="/terminos"
          element={
            <motion.div
              className="pt-[80px] pb-20 bg-white"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <TerminosCondiciones />
              <Footer />
            </motion.div>
          }
        />
        {/* Login */}
        <Route
          path="/login"
          element={
            <motion.div
              className="bg-white min-h-screen flex items-center justify-center"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <LoginPage />
            </motion.div>
          }
        />
        {/* Dashboard multiperfil */}
        <Route
          path="/dashboard"
          element={<DashboardLayout />}
        >
          <Route path="flash-employer" element={<DashboardFlashEmployer />} />
          <Route path="freelancer" element={<DashboardFreelancer />} />
          <Route path="flashworker" element={<DashboardFlashWorker />} />
          {/* Redirección por defecto */}
          <Route index element={<Navigate to="flash-employer" replace />} />
        </Route>
        {/* Catch-all: Not found */}
        <Route
          path="*"
          element={
            <motion.div
              className="pt-[80px] pb-20 bg-white"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Header />
              <NotFound />
              <Footer />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}
