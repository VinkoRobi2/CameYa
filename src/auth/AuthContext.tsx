// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type TipoCuenta = "estudiante" | "empleador";

export interface UserData {
  user_id: number;
  email: string;
  email_verificado: boolean;
  nombre: string;
  foto_perfil: string;
  tipo_cuenta: TipoCuenta;
  perfil_completo: boolean;
  // ...otros campos
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  setAuth: (data: { user_data: UserData; token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cameya_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user_data: UserData; token: string };
        setUser(parsed.user_data);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem("cameya_auth");
      }
    }
    setLoading(false);
  }, []);

  const setAuth = (data: { user_data: UserData; token: string }) => {
    setUser(data.user_data);
    setToken(data.token);
    localStorage.setItem("cameya_auth", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cameya_auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
