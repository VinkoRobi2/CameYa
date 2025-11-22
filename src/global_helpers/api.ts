export const API_BASE = "https://3d864863b8cf.ngrok-free.app";

// Auth & user
export const REGISTER_URL = `${API_BASE}/register`;
export const LOGIN_URL = `${API_BASE}/login`;
export const VERIFY_EMAIL_URL = `${API_BASE}/verify`; // handler VerifyEmailHandler
export const ME_URL = `${API_BASE}/protected/me`;               // devolver usuario logueado
export const USERS_URL = `${API_BASE}/users`;         // base para PATCH de onboarding
export const RESEND_VERIFICATION_URL = `${API_BASE}/auth/resend-verification`;