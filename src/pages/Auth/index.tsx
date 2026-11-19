import { useEffect } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/store/AuthContext"
import { InicioAdministracion } from "@/features/administracion/acceso/components/InicioAdministracion"

export default function AuthPage() {
  const { admin, loading } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!loading && admin) navigate("/admin")
  }, [admin, loading, navigate])

  if (loading) return null

  return <InicioAdministracion />
}
