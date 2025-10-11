import  { createContext, useContext, useState, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  // agrega más campos que necesites
  lastRole?: "flashemployer" | "freelancer" | "flashworker"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const isAuthenticated = !!user

  const login = (userData: User) => {
    setUser(userData)
    // aquí puedes guardar token o userData en localStorage si quieres persistir sesión
  }

  const logout = () => {
    setUser(null)
    // limpia localStorage, cookies o lo que uses
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
