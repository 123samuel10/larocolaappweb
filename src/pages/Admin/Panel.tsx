import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import { ThumbsUp } from "lucide-react"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import { useColaAdminEnVivo } from "@/features/admin/hooks/useColaAdminEnVivo"
import { useAutoAvanzarCola } from "@/shared/hooks/useAutoAvanzarCola"
import { BloquearCancionModal } from "@/features/admin/components/BloquearCancionModal"
import { obtenerColaAdmin, saltarCancion, bloquearCancionYQuitar } from "@/db/admin/cola"
import { obtenerResumenSesion } from "@/db/admin/estadisticas"
import { obtenerEstablecimientoPropio } from "@/db/admin/establecimiento"
import { obtenerHorarios } from "@/db/admin/horarios"
import { pausarSesion, reanudarSesion } from "@/db/admin/sesion"
import { diaSemanaActual } from "@/lib/horario"
import { formatearDuracion } from "@/shared/format/duracion"

function formatHora12(hora: string): string {
  const [hStr, mStr] = hora.split(":")
  let h = parseInt(hStr, 10)
  const periodo = h >= 12 ? "p.m." : "a.m."
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${mStr} ${periodo}`
}

export default function Panel() {
  const { establecimientoId, sesion, isLoading: cargandoSesion, invalidar } = useSesionActiva()
  const [, setTick] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data: establecimiento } = useQuery({
    queryKey: ["admin", "establecimiento", establecimientoId],
    queryFn: () => obtenerEstablecimientoPropio(establecimientoId!),
    enabled: !!establecimientoId,
  })

  const { data: horarios = [] } = useQuery({
    queryKey: ["admin", "horarios", establecimientoId],
    queryFn: () => obtenerHorarios(establecimientoId!),
    enabled: !!establecimientoId,
  })

  const { data: cola = [] } = useQuery({
    queryKey: ["admin", "cola", sesion?.id],
    queryFn: () => obtenerColaAdmin(sesion!.id),
    enabled: !!sesion,
  })

  const { data: resumen } = useQuery({
    queryKey: ["admin", "resumen", sesion?.id],
    queryFn: () => obtenerResumenSesion(sesion!.id),
    enabled: !!sesion,
  })

  useColaAdminEnVivo(sesion?.id ?? null)

  const actual = cola.find((i) => i.estado === "reproduciendo") ?? null
  const siguientes = cola.filter((i) => i.estado !== "reproduciendo")

  useAutoAvanzarCola(establecimientoId, actual?.inicioReproduccion, actual?.duracionSeg)

  useEffect(() => {
    if (!actual?.inicioReproduccion || sesion?.pausada) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [actual?.inicioReproduccion, sesion?.pausada])

  const togglePausa = useMutation({
    mutationFn: () => (sesion!.pausada ? reanudarSesion(sesion!.id) : pausarSesion(sesion!.id)),
    onSuccess: invalidar,
  })

  const saltar = useMutation({
    mutationFn: () => saltarCancion(sesion!.id, actual?.solicitudId ?? null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cola", sesion?.id] })
      qc.invalidateQueries({ queryKey: ["admin", "resumen", sesion?.id] })
    },
  })

  const bloquear = useMutation({
    mutationFn: async ({ horas, motivo }: { horas: number; motivo: string }) => {
      if (!actual) return
      const bloqueadaHasta = new Date(Date.now() + horas * 60 * 60 * 1000).toISOString()
      await bloquearCancionYQuitar({
        establecimientoId: establecimientoId!,
        sesionId: sesion!.id,
        solicitudActualId: actual.solicitudId,
        cancionId: actual.cancionId,
        motivo,
        bloqueadaHasta,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cola", sesion?.id] })
      setModalOpen(false)
    },
  })

  if (cargandoSesion) return null

  const horarioHoy = establecimiento
    ? horarios.find((h) => h.dia_semana === diaSemanaActual(establecimiento.zonaHoraria))
    : undefined

  const fechaHoy = establecimiento
    ? new Intl.DateTimeFormat("es-CO", {
        timeZone: establecimiento.zonaHoraria,
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date())
    : ""

  const referenciaMs = sesion?.pausada && sesion.pausadaEn ? new Date(sesion.pausadaEn).getTime() : Date.now()
  const elapsedSeg = actual?.inicioReproduccion
    ? Math.min(actual.duracionSeg, Math.max(0, Math.floor((referenciaMs - new Date(actual.inicioReproduccion).getTime()) / 1000)))
    : 0

  const estadoLabel = !sesion
    ? "Cerrado"
    : sesion.pausada
      ? "Pausado manualmente"
      : "Activo — pedidos abiertos"

  return (
    <div className="p-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">
            {establecimiento?.nombre}
            {fechaHoy && ` — ${fechaHoy}`}
          </p>
          <h1 className="rocola-display text-xl text-[#0c2944]">Panel</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => togglePausa.mutate()}
            disabled={!sesion || togglePausa.isPending}
            className="border border-[#133b62] text-[#133b62] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#133b62]/5 transition-colors disabled:opacity-50"
          >
            {sesion?.pausada ? "Reanudar servicio" : "Pausar servicio"}
          </button>
          <Link
            to="/admin/reproduccion"
            className="bg-[#ba1929] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#a01522] transition-colors"
          >
            Ir a reproduccion
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="rounded-2xl p-5" style={{ background: "#133b62" }}>
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Estado del servicio</p>
          <p className="text-white font-bold text-sm leading-tight">{estadoLabel}</p>
          <p className="text-xs text-white/50 mt-1">
            {horarioHoy ? `Cierra a las ${formatHora12(horarioHoy.hora_fin)}` : "Sin horario para hoy"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Solicitudes</p>
          <p className="text-xl font-bold text-[#0c2944]">{resumen?.totalSolicitudes ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Usuarios únicos</p>
          <p className="text-xl font-bold text-[#0c2944]">{resumen?.usuariosUnicos ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">En cola</p>
          <p className="text-xl font-bold text-[#0c2944]">{siguientes.length}</p>
        </div>
      </div>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-[#0c2944]">Cola — {siguientes.length} canciones</span>
          </div>
          <div className="space-y-3">
            {siguientes.length === 0 && <p className="text-sm text-gray-400">No hay canciones en cola.</p>}
            {siguientes.map((song, i) => (
              <div key={song.solicitudId} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white bg-[#0c2944] rounded px-2 py-0.5 min-w-[24px] text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0c2944] truncate">{song.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artista}</p>
                </div>
                <span className="text-sm text-gray-500 shrink-0 inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5" aria-hidden="true" />
                  {song.votos}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Sonando ahora</p>
          {actual ? (
            <>
              <p className="font-bold text-xl text-[#0c2944]">{actual.titulo}</p>
              <p className="text-sm text-gray-500 mt-1">
                {actual.artista} — pedida con {actual.votos} votos
              </p>
              <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#ba1929] h-full rounded-full"
                  style={{ width: `${Math.min(100, (elapsedSeg / actual.duracionSeg) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatearDuracion(elapsedSeg)}</span>
                <span>{formatearDuracion(actual.duracionSeg)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => saltar.mutate()}
                  disabled={saltar.isPending}
                  className="flex-1 bg-[#133b62] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors disabled:opacity-60"
                >
                  Saltar
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 border border-[#ba1929] text-[#ba1929] rounded-xl py-2 text-sm font-medium hover:bg-[#ba1929]/5 transition-colors"
                >
                  Bloquear canción
                </button>
              </div>
            </>
          ) : siguientes.length > 0 ? (
            <>
              <p className="text-sm text-gray-400 mb-4">Nada reproduciéndose, pero hay canciones en cola.</p>
              <button
                onClick={() => saltar.mutate()}
                disabled={saltar.isPending}
                className="w-full bg-[#ba1929] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#a01522] transition-colors disabled:opacity-60"
              >
                {saltar.isPending ? "Iniciando…" : "Reproducir siguiente"}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">Nada reproduciéndose.</p>
          )}
        </div>
      </div>

      {modalOpen && actual && (
        <BloquearCancionModal
          titulo={actual.titulo}
          artista={actual.artista}
          pendiente={bloquear.isPending}
          onCancelar={() => setModalOpen(false)}
          onConfirmar={(horas, motivo) => bloquear.mutate({ horas, motivo })}
        />
      )}
    </div>
  )
}
