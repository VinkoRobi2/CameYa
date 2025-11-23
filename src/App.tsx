import React from "react";
import { Routes, Route } from "react-router-dom";
import TermsAndPriv from "./global/Terms&Priv";
import Contact from "./global/Contact";
import LandingPage from "./landingPage/LandingPage";


const App: React.FC = () => {
  return (
    <Routes>

      {/* Landing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/terms-and-privacy" element={<TermsAndPriv />} />
      <Route path="/contact" element={<Contact />} /> 
   </Routes>
  );
};

export default App;
