// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import TermsAndPriv from "./global/pages/Terms&Priv";
import Contact from "./global/pages/Contact";
import LandingPage from "./landingPage/LandingPage";

import RegisterChoice from "./auth/RegisterChoice";
import StudentRegister from "./auth/StudentRegister";
import StudentCheckEmail from "./auth/StudentCheckEmail";
import StudentCompleteRegister from "./auth/StudentCompleteRegister";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Registro estudiante (paso 1 + pantalla de correo) */}
      <Route path="/register" element={<RegisterChoice />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route
        path="/register/student/check-email"
        element={<StudentCheckEmail />}
      />

      {/* Link del mail: verifica y guarda TODO en un solo request */}
      <Route path="/verify/:token" element={<StudentCompleteRegister />} />

      {/* Páginas globales */}
      <Route path="/terms-and-privacy" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default App;
