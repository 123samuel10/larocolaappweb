import { formatearDuracion } from "~/shared/format/duracion"
import type { ItemCola } from "../types"

type CancionDestacadaProps = {
  nombre: string
  cancion?: ItemCola
  sesionActiva: boolean
}

export function CancionDestacada({ nombre, cancion, sesionActiva }: CancionDestacadaProps) {
  return (
    <section aria-labelledby="now-playing-heading" className="min-w-0">
      <div className="rocola-media relative isolate grid aspect-video place-items-center overflow-hidden rounded-[1.25rem]">
        {cancion?.miniaturaUrl ? (
          <img
            src={cancion.miniaturaUrl}
            alt=""
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        ) : (
          <>
            <div aria-hidden="true" className="rocola-ring -z-10 -bottom-[26%] -left-[9%] h-[105%] aspect-square" />
            <div aria-hidden="true" className="rocola-mark absolute top-[11%] right-[7.5%] size-[9%] rounded-full" />
            <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white/15 text-3xl sm:size-24 sm:text-5xl">♫</span>
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
        <h1 id="now-playing-heading" className="rocola-display text-4xl leading-tight sm:text-5xl xl:text-6xl">
          {cancion?.titulo ?? (sesionActiva ? "Sin reproducción" : "No hay sesión activa")}
        </h1>
        {cancion && (
          <div className="rocola-muted mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-base sm:text-xl">
            <p>{cancion.artista} · {cancion.votos} {cancion.votos === 1 ? "voto" : "votos"}</p>
            <p className="font-bold tabular-nums">{formatearDuracion(cancion.duracionSeg)}</p>
          </div>
        )}
      </div>
    </section>
  )
}
