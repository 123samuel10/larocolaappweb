import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ThumbsUp } from "lucide-react"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import { useColaAdminEnVivo } from "@/features/admin/hooks/useColaAdminEnVivo"
import { BloquearCancionModal } from "@/features/admin/components/BloquearCancionModal"
import { obtenerColaAdmin, saltarCancion, bloquearCancionYQuitar } from "@/db/admin/cola"
import { pausarSesion, reanudarSesion } from "@/db/admin/sesion"

export default function Reproduccion() {
  const { establecimientoId, sesion, isLoading: cargandoSesion, invalidar } = useSesionActiva()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: cola = [] } = useQuery({
    queryKey: ["admin", "cola", sesion?.id],
    queryFn: () => obtenerColaAdmin(sesion!.id),
    enabled: !!sesion,
  })

  useColaAdminEnVivo(sesion?.id ?? null)

  const actual = cola.find((i) => i.estado === "reproduciendo") ?? null
  const siguientes = cola.filter((i) => i.estado !== "reproduciendo")

  const saltar = useMutation({
    mutationFn: () => saltarCancion(sesion!.id, actual?.solicitudId ?? null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cola", sesion?.id] }),
  })

  const togglePausa = useMutation({
    mutationFn: () => (sesion!.pausada ? reanudarSesion(sesion!.id) : pausarSesion(sesion!.id)),
    onSuccess: invalidar,
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

  return (
    <div className="p-8">
      <h1 className="rocola-display text-xl text-[#0c2944] mb-6">Reproduccion</h1>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="bg-white rounded-2xl p-6">
          {actual ? (
            <>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Origen: solicitud</p>
              <h2 className="font-bold text-xl text-[#0c2944]">{actual.titulo}</h2>
              <p className="text-sm text-gray-500 mt-1">{actual.artista}</p>
              <button
                onClick={() => togglePausa.mutate()}
                disabled={togglePausa.isPending}
                className="mt-4 w-full border border-[#133b62] text-[#133b62] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#133b62]/5 transition-colors disabled:opacity-50"
              >
                {sesion?.pausada ? "Reanudar servicio" : "Pausar servicio"}
              </button>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => saltar.mutate()}
                  disabled={saltar.isPending}
                  className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors disabled:opacity-60"
                >
                  Saltar
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="border border-[#ba1929] text-[#ba1929] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#ba1929]/5 transition-colors"
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
                className="bg-[#ba1929] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#a01522] transition-colors disabled:opacity-60"
              >
                {saltar.isPending ? "Iniciando…" : "Reproducir siguiente"}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">Nada reproduciéndose.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="text-sm font-bold text-[#0c2944] mb-4">Cola — {siguientes.length} canciones</p>
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
