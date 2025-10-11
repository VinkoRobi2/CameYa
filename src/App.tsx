// App.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./ui/ScrollToTop";

import LandingPage from "./landingPage/LandingPage";
import Login from "./Register&Login/login";
import ChooseRegister from "./Register&Login/register";
import WorkerRegister from "./Register&Login/register/WorkerRegister";
import EmployerRegister from "./Register&Login/register/EmployerRegister";

// ⬇️ importa tus nuevas páginas
import TermsAndPriv from "./global/Terms&Priv";
import Contact from "./global/Contact";

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<ChooseRegister />} />
          <Route path="/register/worker" element={<WorkerRegister />} />
          <Route path="/register/employer" element={<EmployerRegister />} />

          {/* ⬇️ nuevas rutas */}
          <Route path="/terms" element={<TermsAndPriv />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
