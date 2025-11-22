import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_TOKEN_KEY = "auth_token";
const STORAGE_USER_KEY = "auth_user";
const LEGACY_USER_KEY = "user_data";

type TipoCuenta = "estudiante" | "empleador";

export interface AuthUser {
  user_id: number;
  email: string;
  email_verificado: boolean;
  foto_perfil: string;
  nombre: string;
  perfil_completo: boolean;
  tipo_cuenta: TipoCuenta;
  tipo_identidad?: string;
  // Permite campos extra que venga del backend (apellido, telefono, etc.)
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  userData: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isEmployer: boolean;
  hasVerifiedEmail: boolean;
  hasCompletedProfile: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  updateUserData: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Normaliza cualquier payload que venga del back o del localStorage
function normalizeUser(raw: any): AuthUser | null {
  if (!raw) return null;

  let u = raw;

  // Si viene como { user_data: {...} }
  if (u.user_data && typeof u.user_data === "object") {
    u = { ...u.user_data };
  }

  const user_id_raw =
    u.user_id ?? u.id ?? u.uid ?? u.sub ?? u.userId ?? u.userID ?? 0;
  const user_id = Number(user_id_raw) || 0;

  const tipo_cuenta_raw: string | undefined =
    u.tipo_cuenta ?? u.role ?? u.account_type ?? u.tipoCuenta;

  const tipo_cuenta: TipoCuenta =
    tipo_cuenta_raw === "empleador" ? "empleador" : "estudiante";

  const email_verificado = Boolean(
    u.email_verificado ?? u.emailVerified ?? u.email_verified ?? false
  );

  const perfil_completo = Boolean(
    u.perfil_completo ??
      u.completed_onboarding ??
      u.onboarding_complete ??
      false
  );

  return {
    ...u,
    user_id,
    tipo_cuenta,
    email_verificado,
    perfil_completo,
  };
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser =
        localStorage.getItem(STORAGE_USER_KEY) ??
        localStorage.getItem(LEGACY_USER_KEY);

      if (storedToken && storedUser) {
        const raw = JSON.parse(storedUser);
        const parsedUser = normalizeUser(raw);
        if (parsedUser) {
          setToken(storedToken);
          setUserData(parsedUser);
        } else {
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          localStorage.removeItem(LEGACY_USER_KEY);
        }
      }
    } catch (error) {
      console.error("Error cargando sesión desde localStorage", error);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      setToken(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = (newToken: string, newUserData: AuthUser) => {
    setToken(newToken);
    setUserData(newUserData);
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUserData));
  };

  const clearSession = () => {
    setToken(null);
    setUserData(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const login = (newToken: string, rawUserData: any) => {
    const normalized = normalizeUser(rawUserData) ?? (rawUserData as AuthUser);
    persistSession(newToken, normalized);

    // Flujo de navegación básico según estado
    if (!normalized.email_verificado) {
      navigate("/email-check", { replace: true });
      return;
    }

    if (!normalized.perfil_completo) {
      if (normalized.tipo_cuenta === "estudiante") {
        navigate("/register/worker/onboarding", { replace: true });
      } else {
        navigate("/register/employer/onboarding", { replace: true });
      }
      return;
    }

    if (normalized.tipo_cuenta === "estudiante") {
      navigate("/student/dashboard", { replace: true });
    } else {
      navigate("/employer/dashboard", { replace: true });
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const updateUserData = (partial: Partial<AuthUser>) => {
    setUserData((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = { ...prev, ...partial };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = !!token;
  const isStudent = userData?.tipo_cuenta === "estudiante";
  const isEmployer = userData?.tipo_cuenta === "empleador";
  const hasVerifiedEmail = !!userData?.email_verificado;
  const hasCompletedProfile = !!userData?.perfil_completo;

  const value: AuthContextType = {
    token,
    userData,
    isLoading,
    isAuthenticated,
    isStudent,
    isEmployer,
    hasVerifiedEmail,
    hasCompletedProfile,
    login,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
};
