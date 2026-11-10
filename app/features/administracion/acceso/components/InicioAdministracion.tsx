import { FormularioAdministrador, type FormularioAdministradorProps } from "./FormularioAdministrador"

export function InicioAdministracion({ admin, error }: FormularioAdministradorProps) {
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

        <FormularioAdministrador admin={admin} error={error} />
      </div>
    </main>
  )
}
