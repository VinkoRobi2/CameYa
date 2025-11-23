// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TermsAndPriv from "./global/pages/Terms&Priv";
import Contact from "./global/pages/Contact";
import LandingPage from "./landingPage/LandingPage";

import RegisterChoice from "./auth/RegisterChoice";
import StudentRegister from "./auth/StudentRegister";
import StudentCheckEmail from "./auth/StudentCheckEmail";
import VerifyEmail from "./auth/VerifyEmail";
import StudentCompleteRegister from "./auth/StudentCompleteRegister";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Registro */}
      <Route path="/register" element={<RegisterChoice />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route
        path="/register/student/check-email"
        element={<StudentCheckEmail />}
      />
      <Route
        path="/register/student/complete"
        element={<StudentCompleteRegister />}
      />

      {/* Ruta que se usa desde el mail */}
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Global */}
      <Route path="/terms-and-privacy" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default App;
