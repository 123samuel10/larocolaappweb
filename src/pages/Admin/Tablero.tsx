import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ThumbsUp } from "lucide-react"
import { Dropdown } from "@/shared/ui/Dropdown"
import { useAuth } from "@/store/useAuth"
import { obtenerEstablecimientoPropio } from "@/db/admin/establecimiento"
import { obtenerSesiones } from "@/db/admin/sesion"
import {
  obtenerCancionesTop,
  obtenerSolicitudesPorHora,
  obtenerHistorial,
} from "@/db/admin/estadisticas"

function etiquetaFranja(hora: number) {
  return `${String(hora).padStart(2, "0")}:00–${String(hora).padStart(2, "0")}:59`
}

export default function Tablero() {
  const { admin } = useAuth()
  const establecimientoId = admin?.establecimientoId ?? null
  const [sesionId, setSesionId] = useState<string | null>(null)

  const { data: sesiones = [] } = useQuery({
    queryKey: ["admin", "sesiones", establecimientoId],
    queryFn: () => obtenerSesiones(establecimientoId!),
    enabled: !!establecimientoId,
  })

  useEffect(() => {
    if (!sesionId && sesiones.length > 0) setSesionId(sesiones[0].id)
  }, [sesiones, sesionId])

  const opcionesSesion = sesiones.map((s) => ({
    value: s.id,
    label: new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(s.abiertaEn)),
  }))

  const establecimiento = useQuery({
    queryKey: ["admin", "establecimiento", establecimientoId],
    queryFn: () => obtenerEstablecimientoPropio(establecimientoId!),
    enabled: !!establecimientoId,
  })
  const zonaHoraria = establecimiento.data?.zonaHoraria

  const solicitudes = useQuery({
    queryKey: ["admin", "solicitudes-por-hora", sesionId, zonaHoraria],
    queryFn: () => obtenerSolicitudesPorHora(sesionId!, zonaHoraria!),
    enabled: !!sesionId && !!zonaHoraria,
  })

  const { data: topSongs = [] } = useQuery({
    queryKey: ["admin", "top-canciones", sesionId],
    queryFn: () => obtenerCancionesTop(sesionId!),
    enabled: !!sesionId,
  })

  const { data: historial = [] } = useQuery({
    queryKey: ["admin", "historial", sesionId],
    queryFn: () => obtenerHistorial(sesionId!),
    enabled: !!sesionId,
  })

  const maxVotes = Math.max(1, ...topSongs.map((s) => s.votos))
  const franjas = solicitudes.data?.franjas ?? []
  const maxSolicitudes = Math.max(0, ...franjas.map((franja) => franja.cantidad))
  const franjasPico = franjas.filter((franja) => franja.cantidad === maxSolicitudes)
  const mensajeSolicitudes = !sesionId
    ? "Selecciona una sesión."
    : establecimiento.isError || (establecimiento.isSuccess && !zonaHoraria) || solicitudes.isError
      ? "No se pudieron cargar las solicitudes."
      : "Cargando solicitudes…"

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="rocola-display text-xl text-[#0c2944]">Tablero de la sesión</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de actividad de la noche</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <label id="sesion-tablero-label" htmlFor="sesion-tablero" className="text-xs uppercase tracking-widest text-gray-400">
            Sesión
          </label>
          {opcionesSesion.length > 0 ? (
            <Dropdown id="sesion-tablero" value={sesionId ?? ""} options={opcionesSesion} onChange={setSesionId} />
          ) : (
            <span className="text-sm text-gray-400">Sin sesiones aún</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Total de solicitudes</h2>
          <p className="text-xl font-bold text-[#0c2944]">{solicitudes.data?.total ?? "—"}</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            {franjasPico.length > 1 ? "Horarios con más solicitudes" : "Horario con más solicitudes"}
          </h2>
          {franjasPico.length > 0 ? (
            <>
              <p className="text-xl font-bold text-[#0c2944]">
                {franjasPico.map(({ hora }) => etiquetaFranja(hora)).join(" · ")}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {maxSolicitudes} {maxSolicitudes === 1 ? "solicitud" : "solicitudes"}
                {franjasPico.length > 1 && " por franja"}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">{solicitudes.data ? "Sin solicitudes registradas." : mensajeSolicitudes}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-bold text-[#0c2944] mb-4">Canciones más votadas</h2>
          {topSongs.length === 0 ? (
            <p className="text-sm text-gray-400">No hay canciones pedidas todavía.</p>
          ) : (
            <div className="space-y-4">
              {topSongs.map((song) => {
                const widthPct = Math.round((song.votos / maxVotes) * 100)
                const isTop = song.votos === maxVotes
                return (
                  <div key={`${song.titulo}-${song.artista}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#0c2944] truncate">{song.titulo}</span>
                      <span className="text-gray-500 shrink-0 ml-2 inline-flex items-center gap-1">
                        <ThumbsUp className="size-3.5" aria-hidden="true" />
                        {song.votos}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${isTop ? "bg-[#ba1929]" : "bg-[#133b62]"}`} style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-bold text-[#0c2944]">Solicitudes por franja horaria</h2>
          <p className="text-sm text-gray-600 mt-1 mb-4">
            Hora local del establecimiento{zonaHoraria && ` (${zonaHoraria})`}
          </p>
          {franjas.length > 0 ? (
            <ul className="space-y-3">
              {franjas.map(({ hora, cantidad }) => (
                <li key={hora} className="grid grid-cols-[auto_minmax(0,1fr)_2.5rem] items-center gap-2 text-sm">
                  <span className="tabular-nums">{etiquetaFranja(hora)}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                    <div
                      className={`h-full rounded-full ${cantidad === maxSolicitudes ? "bg-[#ba1929]" : "bg-[#133b62]"}`}
                      style={{ width: `${(cantidad / maxSolicitudes) * 100}%` }}
                    />
                  </div>
                  <span className="text-right tabular-nums font-semibold text-[#0c2944]">{cantidad}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">{solicitudes.data ? "Sin solicitudes registradas." : mensajeSolicitudes}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-bold text-[#0c2944] mb-3">Historial de reproducción</h2>
          <div className="space-y-2">
            {historial.length === 0 && <p className="text-sm text-gray-400">Sin historial aún.</p>}
            {historial.map((item, i) => (
              <p key={i} className="text-sm text-gray-600">
                <span className="text-gray-400">{item.estado === "reproducida" ? "Reproducida" : "Saltada/bloqueada"}</span>
                {" — "}{item.titulo}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
