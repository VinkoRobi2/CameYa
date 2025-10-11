// Valida e-mails institucionales ecuatorianos (.edu.ec)
export function isInstitutionalEmail(email: string): boolean {
  const trimmed = (email || "").trim().toLowerCase();
  // Acepta cualquier dominio que termine en .edu.ec (ej: @espol.edu.ec, @ucuenca.edu.ec, etc.)
  return /^[^\s@]+@[^\s@]+\.edu\.ec$/.test(trimmed);
}
