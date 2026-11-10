import { Form, useNavigation } from "react-router"
import type { Route } from "./+types/home"
import { handleAdminLogin, loadAdmin } from "~/lib/admin-auth.server"

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
  const { admin } = loaderData
  const busy = useNavigation().state !== "idle"

  return (
    <main className="rocola-page relative isolate grid min-h-dvh overflow-hidden px-6 py-10 sm:px-12 lg:px-16">
      <div aria-hidden="true" className="rocola-ring -z-10 -top-48 -left-52 size-[44rem] opacity-40" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_26rem] lg:gap-20">
        <header>
          <div className="mb-6 flex items-center gap-3 lg:mb-12">
            <span className="rocola-mark grid size-12 place-items-center rounded-xl" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-7">
                <path d="M9 18V5l12-2v13" />
                <ellipse cx="6" cy="18" rx="3" ry="2.5" />
                <ellipse cx="18" cy="16" rx="3" ry="2.5" />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-[.22em] uppercase">La Rocola</span>
          </div>
          <h1 className="rocola-display max-w-2xl text-5xl leading-[.98] sm:text-7xl lg:text-8xl">
            Bienvenido a La Rocola
          </h1>
        </header>

        <section aria-labelledby="admin-heading" className="rocola-paper rounded-3xl p-6 shadow-2xl sm:p-9">
          <p className="rocola-paper-kicker mb-2 text-xs font-bold tracking-[.15em] uppercase">Administración del sistema</p>
          <h2 id="admin-heading" className="rocola-display mb-7 text-3xl sm:text-4xl">
            {admin ? "Sesión iniciada" : "Iniciar sesión"}
          </h2>
          {admin ? (
            <Form method="post" className="space-y-6">
              <p className="text-sm break-all">{admin.email}</p>
              <button className="rocola-button" name="intent" value="logout" disabled={busy}>Cerrar sesión</button>
            </Form>
          ) : (
            <Form method="post" className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                <input className="rocola-input" id="email" name="email" type="email" autoComplete="username" required />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">Contraseña</label>
                <input className="rocola-input" id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {actionData?.error && (
                <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm text-red-900">{actionData.error}</p>
              )}
              <button className="rocola-button" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button>
              <p className="text-center text-xs text-slate-600">Acceso exclusivo para administradores del sistema.</p>
            </Form>
          )}
        </section>
      </div>
    </main>
  )
}
