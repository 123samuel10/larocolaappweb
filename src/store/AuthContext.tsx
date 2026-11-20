import { createContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/shared/supabase/client"

export type AdminRole = "super_admin" | "bar_admin"

export type AdminUser = {
  email: string
  role: AdminRole
  establecimientoId: string | null
}

type AuthContextValue = {
  admin: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

async function resolveAdmin(userId: string, email: string, role: string): Promise<AdminUser | null> {
  if (role === "super_admin") {
    return { email, role: "super_admin", establecimientoId: null }
  }
  if (role === "bar_admin") {
    const { data } = await supabase
      .from("perfil_admin")
      .select("establecimiento_id")
      .eq("user_id", userId)
      .single()
    return { email, role: "bar_admin", establecimientoId: data?.establecimiento_id ?? null }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      const role = user?.app_metadata?.role
      const resolved =
        user?.email && (role === "super_admin" || role === "bar_admin")
          ? await resolveAdmin(user.id, user.email, role)
          : null
      setAdmin(resolved)
      setLoading(false)
    }).catch((e) => { console.error("[Auth] getSession error", e); setLoading(false) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      const role = user?.app_metadata?.role
      const resolved =
        user?.email && (role === "super_admin" || role === "bar_admin")
          ? await resolveAdmin(user.id, user.email, role)
          : null
      setAdmin(resolved)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    const role = user?.app_metadata?.role
    if (error || !session || (role !== "super_admin" && role !== "bar_admin")) {
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

