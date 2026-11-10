import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("/:slug", "routes/e.$slug.tsx"),
  route("/e/:slug", "routes/redirect-establecimiento.ts"),
  route("/pantalla/:slug", "routes/pantalla.$slug.tsx"),
] satisfies RouteConfig
