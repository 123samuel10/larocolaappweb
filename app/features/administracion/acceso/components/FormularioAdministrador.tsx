import { Form, useNavigation } from "react-router"

export type FormularioAdministradorProps = {
  admin: { email: string } | null
  error?: string
}

export function FormularioAdministrador({ admin, error }: FormularioAdministradorProps) {
  const busy = useNavigation().state !== "idle"

  return (
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
          {error && (
            <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm text-red-900">{error}</p>
          )}
          <button className="rocola-button" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button>
          <p className="text-center text-xs text-slate-600">Acceso exclusivo para administradores del sistema.</p>
        </Form>
      )}
    </section>
  )
}
