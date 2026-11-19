import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/shared/supabase/client"

type Admin = { email: string }

type AuthContextValue = {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const isAdmin = user?.app_metadata.role === "system_admin"
      setAdmin(isAdmin && user?.email ? { email: user.email } : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ?? null
      const isAdmin = user?.app_metadata.role === "system_admin"
      setAdmin(isAdmin && user?.email ? { email: user.email } : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !session || user?.app_metadata.role !== "system_admin") {
      await supabase.auth.signOut()
      return "No se pudo iniciar sesión. Revisa tus credenciales y tu acceso de administrador."
    }
    return null
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
