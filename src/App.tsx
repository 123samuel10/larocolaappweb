import { Route, Switch } from "wouter"
import AuthPage from "@/pages/Auth"
import PantallaPage from "@/pages/Pantalla"
import AdminApp from "@/pages/Admin/AdminApp"
import SuperAdminApp from "@/pages/SuperAdmin/SuperAdminApp"

export default function App() {
  return (
    <Switch>
      <Route path="/pantalla/:slug" component={PantallaPage} />
      <Route path="/admin" component={AdminApp} />
      <Route path="/admin/:path+" component={AdminApp} />
      <Route path="/super-admin" component={SuperAdminApp} />
      <Route path="/super-admin/:path+" component={SuperAdminApp} />
      <Route path="/" component={AuthPage} />
    </Switch>
  )
}
