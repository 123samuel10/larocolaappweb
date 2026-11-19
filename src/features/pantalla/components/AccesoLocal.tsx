import type { DatosAccesoLocal } from "../types"

const APK_URL =
  "https://dsopvxdfhimztngcxgdo.supabase.co/storage/v1/object/public/descargas/app-debug.apk"

export function AccesoLocal({ nombre, enlaceApp }: DatosAccesoLocal) {
  return (
    <main className="rocola-page grid min-h-dvh place-items-center px-5 py-10">
      <section className="rocola-paper w-full max-w-sm rounded-3xl p-6 text-center sm:p-8">
        <p className="rocola-paper-kicker text-xs font-bold tracking-[.15em] uppercase">La Rocola</p>
        <h1 className="rocola-display mt-2 text-4xl leading-tight">{nombre}</h1>
        <p className="mt-3 text-sm text-slate-700">Pide canciones y vota desde la app de Android.</p>
        <div className="mt-6 grid gap-3">
          <a href={enlaceApp} className="rocola-button block">Abrir en La Rocola</a>
          <a href={APK_URL} className="block rounded-xl border border-current px-4 py-3 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2">Descargar APK</a>
        </div>
        <p className="mt-4 text-sm text-slate-700">Si acabas de instalar la app, vuelve aquí y toca «Abrir en La Rocola».</p>
      </section>
    </main>
  )
}
