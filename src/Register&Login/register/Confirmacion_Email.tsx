import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { RESEND_VERIFICATION_URL } from "../../global_helpers/api";
export default function EmailConfirmation() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResendLoading(true);
    try {
      // Ajusta esta URL según tu backend
      await axios.post(`${RESEND_VERIFICATION_URL}`, { email });
      setResendMessage("✓ Correo reenviado exitosamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "No se pudo reenviar el correo";
      setResendMessage(`✗ ${msg}`);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-600 text-3xl">
              mail_outline
            </span>
          </div>
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight mb-2">
          Correo enviado correctamente
        </h1>

        <p className="text-sm text-foreground-light/70 dark:text-foreground-dark/70 mb-6">
          Hemos enviado un correo de confirmación a <strong>{email}</strong>. 
          Revisa tu bandeja de entrada y la carpeta de spam.
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Si no ves el correo, revisa tu carpeta de <strong>Spam</strong> o <strong>Correo no deseado</strong>
          </p>
        </div>

        <button
          onClick={handleResendEmail}
          disabled={resendLoading}
          className="w-full h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mb-3"
        >
          {resendLoading ? "Reenviando..." : "Reenviar correo"}
        </button>

        {resendMessage && (
          <p className={`text-sm mb-4 ${resendMessage.includes("✓") ? "text-green-600" : "text-red-600"}`}>
            {resendMessage}
          </p>
        )}

        <Link
          to="/"
          className="text-sm text-primary font-semibold hover:underline"
        >
          ← Volver al inicio
        </Link>
      </div>
    </section>
  );
}