import type { Route } from "./+types/home"
import { InicioAdministracion } from "~/features/administracion/acceso/components/InicioAdministracion"
import { handleAdminLogin, loadAdmin } from "~/features/administracion/acceso/session.server"

export const meta: Route.MetaFunction = () => [
  { title: "La Rocola | Administración" },
  { name: "description", content: "Acceso para la administración del sistema de La Rocola." },
]

export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "private, no-store" })

export function loader({ request }: Route.LoaderArgs) {
  return loadAdmin(request)
}

export function action({ request }: Route.ActionArgs) {
  return handleAdminLogin(request)
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  return <InicioAdministracion admin={loaderData.admin} error={actionData?.error} />
}
