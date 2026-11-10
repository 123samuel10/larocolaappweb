import { useColaEnVivo } from "../hooks/useColaEnVivo"
import type { DatosPantallaCola } from "../types"
import { CancionDestacada } from "./CancionDestacada"
import { ListaCola } from "./ListaCola"
import "../pantalla.css"

export function PantallaCola({ nombre, cola, sesionActiva, rutaAcceso, qrAcceso }: DatosPantallaCola) {
  useColaEnVivo()

  const reproduciendo = cola.find((i) => i.estado === "reproduciendo")
  const enCola = cola.filter((i) => i.estado === "pendiente")
  const destacada = reproduciendo ?? enCola[0]

  return (
    <main className="rocola-page min-h-dvh px-5 py-6 sm:px-8 sm:py-8 xl:px-11 xl:py-10">
      <div className="mx-auto grid max-w-[112rem] gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(18rem,1fr)] xl:gap-10">
        <CancionDestacada nombre={nombre} cancion={destacada} sesionActiva={sesionActiva} />

        <aside className="flex min-w-0 flex-col gap-6">
          <ListaCola enCola={enCola} sesionActiva={sesionActiva} />

          <a href={rutaAcceso} className="rocola-paper mt-auto flex items-center gap-4 rounded-2xl p-3 sm:p-4">
            <img src={qrAcceso} alt="" width={112} height={112} className="size-24 shrink-0 rounded-lg sm:size-28" />
            <div>
              <p className="text-lg leading-tight font-bold xl:text-xl">Entra a La Rocola</p>
              <p className="mt-1 text-sm text-slate-700">Escanea el QR para abrir este local en tu celular.</p>
            </div>
          </a>
        </aside>
      </div>
    </main>
  )
}
