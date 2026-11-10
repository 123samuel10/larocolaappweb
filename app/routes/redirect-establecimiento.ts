import { redirect } from "react-router"
import type { Route } from "./+types/redirect-establecimiento"

export function loader({ params, request }: Route.LoaderArgs) {
  const { search } = new URL(request.url)
  return redirect(`/${encodeURIComponent(params.slug)}${search}`, 308)
}
