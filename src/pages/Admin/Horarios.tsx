import { useState } from "react"

const schedule = [
  { day: "Lunes a miércoles", hours: "Cerrado" },
  { day: "Jueves", hours: "7:00 p.m. — 1:00 a.m." },
  { day: "Viernes", hours: "8:00 p.m. — 2:00 a.m." },
  { day: "Sábado", hours: "8:00 p.m. — 3:00 a.m." },
  { day: "Domingo", hours: "Cerrado" },
]

export default function Horarios() {
  const [confirmado, setConfirmado] = useState(false)

  return (
    <div className="p-8">
      <h1 className="rocola-display text-3xl text-[#0c2944] mb-6">Horarios y mantenimiento</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-[#0c2944]">Horarios del servicio</span>
            <button className="text-xs border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors">
              Editar
            </button>
          </div>
          {schedule.map((row, i) => (
            <div key={row.day} className={`flex justify-between py-3 text-sm ${i < schedule.length - 1 ? "border-b border-gray-100" : ""}`}>
              <span className="text-gray-600">{row.day}</span>
              <span className={`font-medium ${row.hours === "Cerrado" ? "text-gray-400" : "text-[#0c2944]"}`}>
                {row.hours}
              </span>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[#0c2944] text-sm">Pausa manual</p>
                <p className="text-xs text-gray-500 mt-0.5">Detiene las solicitudes y votos hasta reanudar.</p>
              </div>
              <button className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors">
                Pausar servicio
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-[#0c2944] text-lg mb-2">Modo mantenimiento</h3>
          <p className="text-sm text-gray-600 mb-4">
            Cierra la sesion de esta noche, elimina la cola y bloquea nuevas solicitudes hasta que el servicio se reactive manualmente.
          </p>
          <div className="bg-red-100 text-red-800 rounded-xl p-3 text-sm mb-4">
            Solicitudes que se eliminarán: <strong>5 en cola</strong>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Confirmo que quiero cerrar la sesion de esta noche</span>
          </label>
          <button
            disabled={!confirmado}
            className={`w-full bg-[#ba1929] text-white rounded-xl py-3 text-sm font-bold mt-4 transition-colors ${
              confirmado ? "hover:bg-[#a01522] cursor-pointer" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Activar modo mantenimiento
          </button>
        </div>
      </div>
    </div>
  )
}
