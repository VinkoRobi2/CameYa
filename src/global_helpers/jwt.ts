// Sin librerías externas
export type JwtClaims = {
  sub?: string | number;
  email?: string;
  role?: string;
  email_verificado?: boolean;
  emailVerified?: boolean; // por si el claim cambia de nombre
  completed_onboarding?: boolean;
  exp?: number;
  iat?: number;
  [k: string]: any;
};

export function decodeJWT(token: string): JwtClaims | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return claims.exp <= nowSec;
}
