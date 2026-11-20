import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import { useColaAdminEnVivo } from "@/features/admin/hooks/useColaAdminEnVivo"
import { obtenerColaAdmin, saltarCancion, bloquearCancionYQuitar } from "@/db/admin/cola"

const DURACIONES: Record<string, number> = {
  "1 hora": 1,
  "2 horas": 2,
  "Toda la noche": 12,
}

export default function Reproduccion() {
  const { establecimientoId, sesion, isLoading: cargandoSesion } = useSesionActiva()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("Toda la noche")
  const [motivo, setMotivo] = useState("")

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
  })

  const bloquear = useMutation({
    mutationFn: async () => {
      if (!actual) return
      const horas = DURACIONES[selectedDuration]
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
      setModalOpen(false)
      setMotivo("")
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
              <div className="flex gap-2 mt-5">
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
                <span className="text-sm text-gray-500 shrink-0">{song.votos}v</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && actual && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-2xl p-8 mx-4">
            <h3 className="font-bold text-xl text-[#0c2944] mb-2">Bloquear cancion</h3>
            <p className="text-sm text-gray-600 mb-5">
              {actual.titulo} — {actual.artista}. Sale de la cola y no se puede volver a pedir durante el bloqueo.
            </p>
            <label className="block text-sm font-medium text-[#0c2944] mb-2">Duración del bloqueo</label>
            <div className="flex gap-3 mb-5">
              {Object.keys(DURACIONES).map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 flex items-center justify-center border rounded-xl px-4 py-3 text-sm cursor-pointer transition-colors ${
                    selectedDuration === opt
                      ? "border-[#133b62] bg-[#133b62]/10 text-[#133b62] font-medium"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={opt}
                    checked={selectedDuration === opt}
                    onChange={() => setSelectedDuration(opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
            <label className="block text-sm font-medium text-[#0c2944] mb-2">Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="rocola-input h-20 resize-none"
              placeholder="Contenido inapropiado para el ambiente"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-[#0c2944] text-[#0c2944] rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => bloquear.mutate()}
                disabled={bloquear.isPending}
                className="flex-1 bg-[#ba1929] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#a01522] transition-colors disabled:opacity-60"
              >
                {bloquear.isPending ? "Bloqueando…" : "Bloquear y quitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
