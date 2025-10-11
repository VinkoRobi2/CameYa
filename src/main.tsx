import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ScrollToTop from "./ui/ScrollToTop";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter /* basename="/camella" si despliegas bajo subruta */>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
