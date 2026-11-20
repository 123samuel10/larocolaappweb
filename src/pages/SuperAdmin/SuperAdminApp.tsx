import { Route, Switch, Redirect } from "wouter"
import { useAuth } from "@/store/useAuth"
import SuperAdminLayout from "@/components/Layout/SuperAdminLayout"
import Panel from "./Panel"
import Establecimientos from "./Establecimientos"
import Admins from "./Admins"

export default function SuperAdminApp() {
  const { admin, loading } = useAuth()

  if (loading) return null
  if (!admin || admin.role !== "super_admin") return <Redirect to="/" />

  return (
    <SuperAdminLayout>
      <Switch>
        <Route path="/super-admin" component={Panel} />
        <Route path="/super-admin/establecimientos" component={Establecimientos} />
        <Route path="/super-admin/admins" component={Admins} />
      </Switch>
    </SuperAdminLayout>
  )
}
