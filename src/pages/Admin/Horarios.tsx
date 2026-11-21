import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import { obtenerHorarios, guardarHorarioDia } from "@/db/admin/horarios"
import { abrirSesion, pausarSesion, reanudarSesion, activarMantenimiento } from "@/db/admin/sesion"
import { obtenerColaAdmin } from "@/db/admin/cola"
import type { Horario } from "@/lib/horario"

const DIAS = [
  { dia: 0, label: "Domingo" },
  { dia: 1, label: "Lunes" },
  { dia: 2, label: "Martes" },
  { dia: 3, label: "Miércoles" },
  { dia: 4, label: "Jueves" },
  { dia: 5, label: "Viernes" },
  { dia: 6, label: "Sábado" },
]

type FilaEditable = { cerrado: boolean; horaInicio: string; horaFin: string }

function filasDesdeHorarios(horarios: Horario[]): Record<number, FilaEditable> {
  const filas: Record<number, FilaEditable> = {}
  for (const { dia } of DIAS) {
    const h = horarios.find((x) => x.dia_semana === dia)
    filas[dia] = h
      ? { cerrado: false, horaInicio: h.hora_inicio.slice(0, 5), horaFin: h.hora_fin.slice(0, 5) }
      : { cerrado: true, horaInicio: "20:00", horaFin: "02:00" }
  }
  return filas
}

export default function Horarios() {
  const qc = useQueryClient()
  const { establecimientoId, sesion, isLoading: cargandoSesion, invalidar } = useSesionActiva()
  const [editando, setEditando] = useState(false)
  const [filas, setFilas] = useState<Record<number, FilaEditable>>({})
  const [confirmado, setConfirmado] = useState(false)

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

  useEffect(() => {
    if (!editando) setFilas(filasDesdeHorarios(horarios))
  }, [horarios, editando])

  const guardar = useMutation({
    mutationFn: async () => {
      for (const { dia } of DIAS) {
        const fila = filas[dia]
        await guardarHorarioDia(
          establecimientoId!,
          dia,
          fila.cerrado ? null : { horaInicio: fila.horaInicio, horaFin: fila.horaFin },
        )
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "horarios", establecimientoId] })
      setEditando(false)
    },
  })

  const togglePausa = useMutation({
    mutationFn: async () => {
      if (sesion) return sesion.pausada ? reanudarSesion(sesion.id) : pausarSesion(sesion.id)
      return abrirSesion(establecimientoId!)
    },
    onSuccess: invalidar,
  })

  const mantenimiento = useMutation({
    mutationFn: async () => activarMantenimiento(sesion!.id),
    onSuccess: () => {
      invalidar()
      setConfirmado(false)
    },
  })

  if (cargandoSesion) return null

  return (
    <div className="p-8">
      <h1 className="rocola-display text-xl text-[#0c2944] mb-6">Horarios y mantenimiento</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-[#0c2944]">Horarios del servicio</span>
            {editando ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditando(false)}
                  className="text-xs border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => guardar.mutate()}
                  disabled={guardar.isPending}
                  className="text-xs bg-[#133b62] text-white rounded-lg px-3 py-1.5 hover:bg-[#0c2944] transition-colors disabled:opacity-60"
                >
                  {guardar.isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="text-xs border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {DIAS.map(({ dia, label }, i) => {
            const fila = filas[dia]
            if (!fila) return null
            return (
              <div
                key={dia}
                className={`flex justify-between items-center py-3 text-sm ${i < DIAS.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-gray-600">{label}</span>
                {editando ? (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={fila.cerrado}
                        onChange={(e) =>
                          setFilas((f) => ({ ...f, [dia]: { ...f[dia], cerrado: e.target.checked } }))
                        }
                      />
                      Cerrado
                    </label>
                    {!fila.cerrado && (
                      <>
                        <input
                          type="time"
                          value={fila.horaInicio}
                          onChange={(e) =>
                            setFilas((f) => ({ ...f, [dia]: { ...f[dia], horaInicio: e.target.value } }))
                          }
                          className="rocola-input text-xs py-1 px-2"
                          style={{ width: 90 }}
                        />
                        <span className="text-gray-400">—</span>
                        <input
                          type="time"
                          value={fila.horaFin}
                          onChange={(e) =>
                            setFilas((f) => ({ ...f, [dia]: { ...f[dia], horaFin: e.target.value } }))
                          }
                          className="rocola-input text-xs py-1 px-2"
                          style={{ width: 90 }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <span className={`font-medium ${fila.cerrado ? "text-gray-400" : "text-[#0c2944]"}`}>
                    {fila.cerrado ? "Cerrado" : `${fila.horaInicio} — ${fila.horaFin}`}
                  </span>
                )}
              </div>
            )
          })}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[#0c2944] text-sm">Pausa manual</p>
                <p className="text-xs text-gray-500 mt-0.5">Detiene las solicitudes y votos hasta reanudar.</p>
              </div>
              <button
                onClick={() => togglePausa.mutate()}
                disabled={togglePausa.isPending}
                className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {!sesion ? "Abrir servicio" : sesion.pausada ? "Reanudar servicio" : "Pausar servicio"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-[#0c2944] text-xl mb-2">Modo mantenimiento</h3>
          <p className="text-sm text-gray-600 mb-4">
            Cierra la sesion de esta noche, elimina la cola y bloquea nuevas solicitudes hasta que el servicio se reactive manualmente.
          </p>
          {!sesion ? (
            <p className="text-sm text-gray-400">No hay una sesión activa en este momento.</p>
          ) : (
            <>
              <div className="bg-red-100 text-red-800 rounded-xl p-3 text-sm mb-4">
                Solicitudes que se eliminarán: <strong>{cola.length} en cola</strong>
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
                disabled={!confirmado || mantenimiento.isPending}
                onClick={() => mantenimiento.mutate()}
                className={`w-full bg-[#ba1929] text-white rounded-xl py-3 text-sm font-bold mt-4 transition-colors ${
                  confirmado ? "hover:bg-[#a01522] cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {mantenimiento.isPending ? "Activando…" : "Activar modo mantenimiento"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
