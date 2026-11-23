import { useQuery } from "@tanstack/react-query"
import { useColaEnVivo } from "../hooks/useColaEnVivo"
import { useAutoAvanzarCola } from "@/shared/hooks/useAutoAvanzarCola"
import { useAutoAvanzarListaDefecto } from "@/shared/hooks/useAutoAvanzarListaDefecto"
import { obtenerCancionDefectoActual } from "@/db/pantalla/listaDefecto"
import type { DatosPantallaCola } from "../types"
import { CancionDestacada } from "./CancionDestacada"
import { ListaCola } from "./ListaCola"

export function PantallaCola({ nombre, cola, sesionActiva, servicioAbierto, pausada, pausadaEn, enMantenimiento, rutaAcceso, qrAcceso, establecimientoId }: DatosPantallaCola & { establecimientoId: string }) {
  useColaEnVivo(establecimientoId)

  const reproduciendo = cola.find((i) => i.estado === "reproduciendo")
  const enCola = cola.filter((i) => i.estado === "pendiente")
  const colaEnVivoVacia = !reproduciendo && enCola.length === 0

  const motivoNoDisponible = enMantenimiento
    ? "Servicio en mantenimiento"
    : !servicioAbierto
      ? "Servicio cerrado — fuera de horario"
      : pausada
        ? "Servicio en pausa"
        : null

  const { data: defectoActual } = useQuery({
    queryKey: ["defecto-actual", establecimientoId],
    queryFn: () => obtenerCancionDefectoActual(establecimientoId),
    enabled: colaEnVivoVacia,
  })

  const destacada = reproduciendo ?? enCola[0] ?? (colaEnVivoVacia ? (defectoActual ?? undefined) : undefined)

  const avanzarAhora = useAutoAvanzarCola(establecimientoId, reproduciendo?.inicioReproduccion, reproduciendo?.duracionSeg)
  const avanzarListaDefectoAhora = useAutoAvanzarListaDefecto(establecimientoId, colaEnVivoVacia, defectoActual?.inicioReproduccion, defectoActual?.duracionSeg)
  const onCancionTerminada = colaEnVivoVacia ? avanzarListaDefectoAhora : avanzarAhora

  return (
    <main className="rocola-page min-h-dvh px-5 py-6 sm:px-8 sm:py-8 xl:px-11 xl:py-10">
      {motivoNoDisponible && (
        <div className="mx-auto mb-6 max-w-[112rem] rounded-2xl bg-black/30 px-5 py-3 text-center">
          <p className="text-sm font-semibold text-white/60 tracking-wide uppercase">
            {motivoNoDisponible}
          </p>
        </div>
      )}
      <div className="mx-auto grid max-w-[112rem] gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(18rem,1fr)] xl:gap-10">
        <CancionDestacada
          nombre={nombre}
          cancion={destacada}
          sesionActiva={sesionActiva && servicioAbierto}
          pausada={pausada}
          pausadaEn={pausadaEn}
          onCancionTerminada={onCancionTerminada}
        />

        <aside className="flex min-w-0 flex-col gap-6">
          <ListaCola enCola={enCola} sesionActiva={sesionActiva} />

          <a href={rutaAcceso} className="rocola-paper mt-auto flex items-center gap-4 rounded-2xl p-3 sm:p-4">
            <img src={qrAcceso} alt="" width={112} height={112} className="size-24 shrink-0 rounded-lg sm:size-28" />
            <div>
              <p className="text-xl leading-tight font-bold">Entra a La Rocola</p>
              <p className="mt-1 text-sm text-slate-700">Escanea el QR para abrir este local en tu celular.</p>
            </div>
          </a>
        </aside>
      </div>
    </main>
  )
}
