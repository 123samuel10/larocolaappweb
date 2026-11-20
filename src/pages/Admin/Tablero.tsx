import { useState } from "react"
import { Dropdown } from "@/shared/ui/Dropdown"

const sesiones = [{ value: "viernes-20", label: "Viernes 20 nov — 8:00 p.m." }]

const topSongs = [
  { title: "La Bicicleta", artist: "Carlos Vives, Shakira", votes: 18 },
  { title: "Tusa", artist: "Karol G, Nicki Minaj", votes: 15 },
  { title: "Vivir Mi Vida", artist: "Marc Anthony", votes: 11 },
  { title: "Rayando el Sol", artist: "Maná", votes: 7 },
]

const maxVotes = 18

const hourBars = [
  { label: "8pm", heightPct: 40, peak: false },
  { label: "10pm", heightPct: 60, peak: false },
  { label: "12am", heightPct: 90, peak: true },
  { label: "2am", heightPct: 55, peak: false },
]

const historial = [
  { label: "Solicitud 14", title: "Tusa", duration: "4:02 min" },
  { label: "Lista por defecto", title: "Tabaco y Chanel", duration: "3:10 min" },
  { label: "Solicitud 15", title: "Vivir Mi Vida", duration: "4:12 min" },
  { label: "Saltada por DJ", title: "Fruta Fresca", duration: null },
]

export default function Tablero() {
  const [sesion, setSesion] = useState(sesiones[0].value)

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
          <Dropdown id="sesion-tablero" value={sesion} options={sesiones} onChange={setSesion} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Total solicitudes", value: "46" },
          { label: "Usuarios únicos", value: "31" },
          { label: "Tiempo de espera promedio", value: "9 min" },
          { label: "Lista por defecto", value: "64%" },
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
          <div className="space-y-4">
            {topSongs.map((song) => {
              const widthPct = Math.round((song.votes / maxVotes) * 100)
              const isTop = song.votes === maxVotes
              return (
                <div key={song.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#0c2944] truncate">{song.title}</span>
                    <span className="text-gray-500 shrink-0 ml-2">{song.votes}v</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full ${isTop ? "bg-[#ba1929]" : "bg-[#133b62]"}`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">Concentracion de votos — las 4 canciones mas pedidas de la noche</p>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="font-bold text-[#0c2944] mb-4">Participacion por hora</p>
          <div className="flex items-end gap-3 h-32 mb-6">
            {hourBars.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t ${bar.peak ? "bg-[#ba1929]" : "bg-[#133b62]"}`} style={{ height: `${bar.heightPct}%` }} />
                <span className="text-xs text-gray-400">{bar.label}</span>
              </div>
            ))}
          </div>
          <h4 className="font-bold text-[#0c2944] text-sm mb-3">Historial de reproduccion</h4>
          <div className="space-y-2">
            {historial.map((item, i) => (
              <p key={i} className="text-sm text-gray-600">
                <span className="text-gray-400">{item.label}</span> — {item.title}
                {item.duration && <span className="text-gray-400"> — {item.duration}</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
