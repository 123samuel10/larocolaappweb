import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dropdown } from "@/shared/ui/Dropdown"
import { useAuth } from "@/store/useAuth"
import { obtenerSesiones } from "@/db/admin/sesion"
import { obtenerCumplimiento } from "@/db/admin/listaDefecto"
import {
  obtenerResumenSesion,
  obtenerCancionesTop,
  obtenerParticipacionPorHora,
  obtenerHistorial,
  obtenerEsperaPromedioSeg,
} from "@/db/admin/estadisticas"

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

  const { data: resumen } = useQuery({
    queryKey: ["admin", "resumen", sesionId],
    queryFn: () => obtenerResumenSesion(sesionId!),
    enabled: !!sesionId,
  })

  const { data: esperaPromedioSeg } = useQuery({
    queryKey: ["admin", "espera-promedio", sesionId],
    queryFn: () => obtenerEsperaPromedioSeg(sesionId!),
    enabled: !!sesionId,
  })

  const { data: topSongs = [] } = useQuery({
    queryKey: ["admin", "top-canciones", sesionId],
    queryFn: () => obtenerCancionesTop(sesionId!),
    enabled: !!sesionId,
  })

  const { data: participacion = [] } = useQuery({
    queryKey: ["admin", "participacion", sesionId],
    queryFn: () => obtenerParticipacionPorHora(sesionId!),
    enabled: !!sesionId,
  })

  const { data: historial = [] } = useQuery({
    queryKey: ["admin", "historial", sesionId],
    queryFn: () => obtenerHistorial(sesionId!),
    enabled: !!sesionId,
  })

  const { data: cumplimiento } = useQuery({
    queryKey: ["admin", "cumplimiento-lista-defecto", establecimientoId],
    queryFn: () => obtenerCumplimiento(establecimientoId!),
    enabled: !!establecimientoId,
  })

  const maxVotes = Math.max(1, ...topSongs.map((s) => s.votos))
  const maxParticipacion = Math.max(1, ...participacion.map((p) => p.solicitudes))

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="rocola-display text-xl text-[#0c2944]">Tablero de la sesion</h1>
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

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Total solicitudes", value: String(resumen?.totalSolicitudes ?? 0) },
          { label: "Usuarios únicos", value: String(resumen?.usuariosUnicos ?? 0) },
          {
            label: "Tiempo de espera promedio",
            value: esperaPromedioSeg != null ? `${Math.round(esperaPromedioSeg / 60)} min` : "—",
          },
          { label: "Lista por defecto", value: cumplimiento != null ? `${cumplimiento}%` : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className="text-xl font-bold text-[#0c2944]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <p className="font-bold text-[#0c2944] mb-4">Canciones mas pedidas</p>
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
                      <span className="text-gray-500 shrink-0 ml-2">{song.votos}v</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${isTop ? "bg-[#ba1929]" : "bg-[#133b62]"}`} style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Concentracion de votos de la noche</p>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="font-bold text-[#0c2944] mb-4">Participacion por hora</p>
          {participacion.length === 0 ? (
            <p className="text-sm text-gray-400 mb-6">Sin actividad registrada.</p>
          ) : (
            <div className="flex items-end gap-3 h-32 mb-6">
              {participacion.map((bar) => {
                const heightPct = Math.round((bar.solicitudes / maxParticipacion) * 100)
                return (
                  <div key={bar.hora} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${bar.solicitudes === maxParticipacion ? "bg-[#ba1929]" : "bg-[#133b62]"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs text-gray-400">{bar.hora}</span>
                  </div>
                )
              })}
            </div>
          )}
          <h4 className="font-bold text-[#0c2944] text-sm mb-3">Historial de reproduccion</h4>
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
