import { Route, Switch } from "wouter"
import AuthPage from "@/pages/Auth"
import PantallaPage from "@/pages/Pantalla"
import AdminApp from "@/pages/Admin/AdminApp"

export default function App() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/pantalla/:slug" component={PantallaPage} />
      <Route path="/admin~" component={AdminApp} />
    </Switch>
  )
}
