import { useState } from "react"

const queue = [
  { pos: 1, title: "Tusa", artist: "Karol G, Nicki Minaj", votes: 15 },
  { pos: 2, title: "Vivir Mi Vida", artist: "Marc Anthony", votes: 11 },
  { pos: 3, title: "Rayando el Sol", artist: "Maná", votes: 7 },
  { pos: 4, title: "Felices los 4", artist: "Maluma", votes: 4 },
  { pos: 5, title: "La Gota Fria", artist: "Carlos Vives", votes: 2 },
]

const durationOptions = ["1 hora", "2 horas", "Toda la noche"]

export default function Reproduccion() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("Toda la noche")

  return (
    <div className="p-8">
      <h1 className="rocola-display text-3xl text-[#0c2944] mb-6">Reproduccion</h1>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="bg-white rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Origen: solicitud</p>
          <h2 className="font-bold text-2xl text-[#0c2944]">La Bicicleta</h2>
          <p className="text-sm text-gray-500 mt-1">Carlos Vives, Shakira</p>
          <div className="mt-5 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#ba1929] h-full rounded-full" style={{ width: "60%" }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2:16</span>
            <span>3:48</span>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="border border-[#0c2944] text-[#0c2944] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors">
              Pausar
            </button>
            <button className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors">
              Saltar
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="border border-[#ba1929] text-[#ba1929] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#ba1929]/5 transition-colors"
            >
              Bloquear canción
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="text-sm font-bold text-[#0c2944] mb-4">
            Cola — 5 canciones{" "}
            <span className="text-gray-400 font-normal">(~19 min)</span>
          </p>
          <div className="space-y-3">
            {queue.map((song) => (
              <div key={song.pos} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white bg-[#0c2944] rounded px-2 py-0.5 min-w-[24px] text-center">
                  {song.pos}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0c2944] truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <span className="text-sm text-gray-500 shrink-0">{song.votes}v</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-2xl p-8 mx-4">
            <h3 className="font-bold text-xl text-[#0c2944] mb-2">Bloquear cancion</h3>
            <p className="text-sm text-gray-600 mb-5">
              Felices los 4 — Maluma. Sale de la cola y no se puede volver a pedir durante el bloqueo.
            </p>
            <label className="block text-sm font-medium text-[#0c2944] mb-2">Duración del bloqueo</label>
            <div className="flex gap-3 mb-5">
              {durationOptions.map((opt) => (
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
            <textarea className="rocola-input h-20 resize-none" placeholder="Contenido inapropiado para el ambiente" />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-[#0c2944] text-[#0c2944] rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-[#ba1929] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#a01522] transition-colors"
              >
                Bloquear y quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
