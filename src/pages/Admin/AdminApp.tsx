import { lazy, Suspense } from "react"
import { Route, Switch, Redirect } from "wouter"
import { useAuth } from "@/store/useAuth"
import AdminLayout from "@/components/Layout/AdminLayout"
import Panel from "./Panel"
import Reproduccion from "./Reproduccion"
import ListaDefecto from "./ListaDefecto"
import Horarios from "./Horarios"
const Tablero = lazy(() => import("./Tablero"))

export default function AdminApp() {
  const { admin, loading } = useAuth()

  if (loading) return null
  if (!admin || admin.role !== "bar_admin") return <Redirect to="/" />

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={Panel} />
        <Route path="/admin/reproduccion" component={Reproduccion} />
        <Route path="/admin/lista-defecto" component={ListaDefecto} />
        <Route path="/admin/horarios" component={Horarios} />
        <Route path="/admin/tablero">
          <Suspense fallback={<p role="status" className="p-6 text-slate-600">Cargando tablero…</p>}>
            <Tablero />
          </Suspense>
        </Route>
      </Switch>
    </AdminLayout>
  )
}
