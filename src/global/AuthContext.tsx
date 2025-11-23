// src/global/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Role = "student" | "employer" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);

  const login = (u: User) => {
    setUser(u);
    setRole(u.role);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    // 👇 importante: limpiar sesión persistida
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value: AuthContextValue = { user, role, setRole, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
};
