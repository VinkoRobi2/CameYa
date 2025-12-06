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

// 🔐 Helper para reconstruir el usuario desde localStorage
const getInitialUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("auth_token");
  const storedUserStr = localStorage.getItem("auth_user");

  if (!token || !storedUserStr) return null;

  try {
    const raw = JSON.parse(storedUserStr);

    const tipoCuenta = raw.tipo_cuenta || raw.role;

    const role: Role =
      tipoCuenta === "estudiante" || tipoCuenta === "student"
        ? "student"
        : tipoCuenta === "empleador" || tipoCuenta === "employer"
        ? "employer"
        : null;

    if (!role) return null;

    const normalizedUser: User = {
      id: String(raw.user_id ?? raw.id ?? ""),
      name:
        raw.nombre || raw.apellido
          ? `${raw.nombre ?? ""} ${raw.apellido ?? ""}`.trim()
          : raw.name ?? "",
      email: raw.email,
      role,
    };

    return normalizedUser;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 🧠 Al iniciar, tratamos de restaurar la sesión desde localStorage
  const [user, setUser] = useState<User | null>(() =>
    getInitialUserFromStorage()
  );
  const [role, setRole] = useState<Role>(user?.role ?? null);

  const login = (u: User) => {
    setUser(u);
    setRole(u.role);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    // 👇 importante: limpiar sesión persistida
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
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
