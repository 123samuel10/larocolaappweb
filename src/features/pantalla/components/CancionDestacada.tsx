import { useEffect, useState } from "react"
import { Music } from "lucide-react"
import { formatearDuracion } from "@/shared/format/duracion"
import type { ItemCola } from "../types"
import { YoutubePlayer } from "./YoutubePlayer"

type CancionDestacadaProps = {
  nombre: string
  cancion?: ItemCola
  sesionActiva: boolean
  pausada: boolean
  pausadaEn: string | null
  onCancionTerminada?: () => void
}

export function CancionDestacada({ nombre, cancion, sesionActiva, pausada, pausadaEn, onCancionTerminada }: CancionDestacadaProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (cancion?.estado !== "reproduciendo" || !cancion.inicioReproduccion || pausada) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [cancion?.estado, cancion?.inicioReproduccion, pausada])

  const enVivo = cancion?.estado === "reproduciendo" && !!cancion.inicioReproduccion
  const referenciaMs = pausada && pausadaEn ? new Date(pausadaEn).getTime() : Date.now()
  const elapsedSeg = enVivo
    ? Math.min(cancion!.duracionSeg, Math.max(0, Math.floor((referenciaMs - new Date(cancion!.inicioReproduccion!).getTime()) / 1000)))
    : 0

  return (
    <section aria-labelledby="now-playing-heading" className="min-w-0">
      <div className="rocola-media relative isolate grid aspect-video place-items-center overflow-hidden rounded-[1.25rem]">
        {enVivo && cancion?.youtubeId ? (
          <YoutubePlayer
            key={cancion.solicitudId}
            youtubeId={cancion.youtubeId}
            startSeconds={elapsedSeg}
            onEnded={() => onCancionTerminada?.()}
          />
        ) : cancion?.miniaturaUrl ? (
          <img
            src={cancion.miniaturaUrl}
            alt=""
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        ) : (
          <>
            <div aria-hidden="true" className="rocola-ring -z-10 -bottom-[26%] -left-[9%] h-[105%] aspect-square" />
            <div aria-hidden="true" className="rocola-mark absolute top-[11%] right-[7.5%] size-[9%] rounded-full" />
            <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white/15 sm:size-24">
              <Music className="size-8 sm:size-12" />
            </span>
          </>
        )}
        <p className="rocola-media-label absolute top-4 left-4 max-w-[85%] truncate rounded-lg px-3 py-1.5 text-sm font-semibold sm:top-5 sm:left-5">
          {nombre}
        </p>
      </div>
      <div className="mt-5">
        <p className="rocola-kicker mb-1 text-xs font-bold tracking-[.14em] uppercase sm:text-sm">
          {cancion?.estado === "reproduciendo" ? "Sonando ahora" : cancion ? "Próxima canción" : "Reproducción"}
        </p>
        <h1 id="now-playing-heading" className="rocola-display text-xl leading-tight">
          {cancion?.titulo ?? (sesionActiva ? "Sin reproducción" : "No hay sesión activa")}
        </h1>
        {cancion && (
          <>
            <div className="rocola-muted mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
              <p>{cancion.artista} · {cancion.votos} {cancion.votos === 1 ? "voto" : "votos"}</p>
              {enVivo ? (
                <p className="font-bold tabular-nums">
                  {formatearDuracion(elapsedSeg)} / {formatearDuracion(cancion.duracionSeg)}
                </p>
              ) : (
                <p className="font-bold tabular-nums">{formatearDuracion(cancion.duracionSeg)}</p>
              )}
            </div>
            {enVivo && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.min(100, (elapsedSeg / cancion.duracionSeg) * 100)}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
