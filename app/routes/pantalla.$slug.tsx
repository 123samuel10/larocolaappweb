import type { Route } from "./+types/pantalla.$slug"
import { AccesoLocal } from "~/features/pantalla/components/AccesoLocal"
import { PantallaCola } from "~/features/pantalla/components/PantallaCola"
import { cargarPantalla } from "~/features/pantalla/pantalla.server"

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData ? `${loaderData.nombre} — ${loaderData.vista === "acceso" ? "La Rocola" : "Cola"}` : "La Rocola" },
]

export function loader({ params, request }: Route.LoaderArgs) {
  return cargarPantalla(params.slug, request.url)
}

export default function PantallaEstablecimiento({ loaderData }: Route.ComponentProps) {
  if (loaderData.vista === "cola") return <PantallaCola {...loaderData} />

  return <AccesoLocal {...loaderData} />
}
