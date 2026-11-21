import { useState } from "react"

export const DURACIONES_BLOQUEO: Record<string, number> = {
  "1 hora": 1,
  "2 horas": 2,
  "Toda la noche": 12,
}

export function BloquearCancionModal({
  titulo,
  artista,
  pendiente,
  onCancelar,
  onConfirmar,
}: {
  titulo: string
  artista: string
  pendiente: boolean
  onCancelar: () => void
  onConfirmar: (horas: number, motivo: string) => void
}) {
  const [selectedDuration, setSelectedDuration] = useState("Toda la noche")
  const [motivo, setMotivo] = useState("")

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 mx-4">
        <h3 className="font-bold text-xl text-[#0c2944] mb-2">Bloquear cancion</h3>
        <p className="text-sm text-gray-600 mb-5">
          {titulo} — {artista}. Sale de la cola y no se puede volver a pedir durante el bloqueo.
        </p>
        <label className="block text-sm font-medium text-[#0c2944] mb-2">Duración del bloqueo</label>
        <div className="flex gap-3 mb-5">
          {Object.keys(DURACIONES_BLOQUEO).map((opt) => (
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
            onClick={onCancelar}
            className="flex-1 border border-[#0c2944] text-[#0c2944] rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(DURACIONES_BLOQUEO[selectedDuration], motivo)}
            disabled={pendiente}
            className="flex-1 bg-[#ba1929] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#a01522] transition-colors disabled:opacity-60"
          >
            {pendiente ? "Bloqueando…" : "Bloquear y quitar"}
          </button>
        </div>
      </div>
    </div>
  )
}
