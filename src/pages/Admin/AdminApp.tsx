import { Route, Switch, Redirect } from "wouter"
import { useEffect } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/store/AuthContext"
import AdminLayout from "@/components/Layout/AdminLayout"
import Panel from "./Panel"
import Reproduccion from "./Reproduccion"
import ListaDefecto from "./ListaDefecto"
import Horarios from "./Horarios"
import Tablero from "./Tablero"

export default function AdminApp() {
  const { admin, loading } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!loading && !admin) navigate("/")
  }, [admin, loading, navigate])

  if (loading) return null
  if (!admin) return null

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={Panel} />
        <Route path="/admin/reproduccion" component={Reproduccion} />
        <Route path="/admin/lista-defecto" component={ListaDefecto} />
        <Route path="/admin/horarios" component={Horarios} />
        <Route path="/admin/tablero" component={Tablero} />
      </Switch>
    </AdminLayout>
  )
}
