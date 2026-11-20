import { useEffect } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/store/useAuth"
import { InicioAdministracion } from "@/features/administracion/acceso/components/InicioAdministracion"

export default function AuthPage() {
  const { admin, loading } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!loading && admin) {
      navigate(admin.role === "super_admin" ? "/super-admin" : "/admin")
    }
  }, [admin, loading, navigate])

  if (loading) return null

  return <InicioAdministracion />
}
