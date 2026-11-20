import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import {
  obtenerListaDefecto,
  buscarCancionesExistentes,
  agregarCancionALista,
  quitarDeLista,
  reordenarLista,
  type CancionBusqueda,
} from "@/db/admin/listaDefecto"

export default function ListaDefecto() {
  const qc = useQueryClient()
  const { establecimientoId, isLoading: cargandoSesion } = useSesionActiva()
  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState<CancionBusqueda[]>([])

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "lista-defecto", establecimientoId],
    queryFn: () => obtenerListaDefecto(establecimientoId!),
    enabled: !!establecimientoId,
  })

  const invalidarLista = () => qc.invalidateQueries({ queryKey: ["admin", "lista-defecto", establecimientoId] })

  const agregar = useMutation({
    mutationFn: async (cancionId: string) => {
      const siguientePosicion = (items.at(-1)?.posicion ?? 0) + 1
      await agregarCancionALista(establecimientoId!, cancionId, siguientePosicion)
    },
    onSuccess: () => {
      invalidarLista()
      setBusqueda("")
      setResultados([])
    },
  })

  const quitar = useMutation({
    mutationFn: quitarDeLista,
    onSuccess: invalidarLista,
  })

  const reordenar = useMutation({
    mutationFn: async () => {
      const sinSonar = items.filter((i) => !i.sonadaEn)
      const yaSonaron = [...items.filter((i) => i.sonadaEn)].sort(
        (a, b) => new Date(a.sonadaEn!).getTime() - new Date(b.sonadaEn!).getTime(),
      )
      const nuevoOrden = [...sinSonar, ...yaSonaron]
      await reordenarLista(nuevoOrden.map((item, i) => ({ id: item.id, posicion: i + 1 })))
    },
    onSuccess: invalidarLista,
  })

  const buscar = async (consulta: string) => {
    setBusqueda(consulta)
    if (consulta.trim().length < 2) {
      setResultados([])
      return
    }
    setResultados(await buscarCancionesExistentes(consulta.trim()))
  }

  if (cargandoSesion) return null

  const totalMin = Math.round(items.reduce((acc, i) => acc + i.duracionSeg, 0) / 60)
  const siguienteIndex = items.findIndex((i) => !i.sonadaEn)
  const cumplimiento = items.length
    ? Math.round((items.filter((i) => i.sonadaEn).length / items.length) * 100)
    : 0

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="rocola-display text-xl text-[#0c2944]">Lista por defecto</h1>
          <p className="text-sm text-gray-500 mt-1">Canciones que suenan cuando no hay solicitudes pendientes</p>
        </div>
        <div className="flex gap-3 items-center mt-1 relative">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => buscar(e.target.value)}
            placeholder="Buscar cancion..."
            className="rocola-input text-sm"
            style={{ width: 220 }}
          />
          {resultados.length > 0 && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
              {resultados.map((c) => (
                <button
                  key={c.id}
                  onClick={() => agregar.mutate(c.id)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <p className="font-medium text-[#0c2944] truncate">{c.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{c.artista}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-[#0c2944]">{items.length} canciones — {totalMin} min</span>
            {siguienteIndex >= 0 && (
              <span className="text-sm text-gray-400">Posicion {siguienteIndex + 1} de {items.length}</span>
            )}
          </div>
          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400">No hay canciones en la lista por defecto aún.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 w-8">#</th>
                  <th className="text-left pb-3">Canción</th>
                  <th className="text-left pb-3">Artista</th>
                  <th className="text-left pb-3">Estado</th>
                  <th className="pb-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const estado = item.sonadaEn ? "Ya sonó" : i === siguienteIndex ? "Siguiente" : "En espera"
                  return (
                    <tr key={item.id} className={`border-b border-gray-50 ${estado === "Siguiente" ? "bg-red-50" : ""}`}>
                      <td className="py-3 text-gray-400">{item.posicion}</td>
                      <td className="py-3 font-medium text-[#0c2944]">{item.titulo}</td>
                      <td className="py-3 text-gray-500">{item.artista || "—"}</td>
                      <td
                        className={`py-3 ${estado === "Siguiente" ? "text-[#ba1929] font-bold" : estado === "Ya sonó" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {estado}
                      </td>
                      <td className="py-3 text-right">
                        {estado !== "Ya sonó" && (
                          <button
                            onClick={() => quitar.mutate(item.id)}
                            className="text-xs text-gray-400 hover:text-[#ba1929] transition-colors"
                          >
                            Quitar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 flex flex-col">
          <p className="text-sm font-bold text-[#0c2944] mb-2">Cumplimiento de la noche</p>
          <p className="text-xl font-bold text-[#0c2944] mb-2">{cumplimiento}%</p>
          <p className="text-xs text-gray-500 mb-6">
            Porcentaje de canciones de la lista por defecto que sonaron según lo planificado.
          </p>
          <div className="mb-auto" />
          <button
            onClick={() => reordenar.mutate()}
            disabled={reordenar.isPending || items.length === 0}
            className="mt-6 w-full border border-[#133b62] text-[#133b62] rounded-xl py-2 text-sm font-medium hover:bg-[#133b62]/5 transition-colors disabled:opacity-60"
          >
            {reordenar.isPending ? "Reordenando…" : "Reordenar lista ahora"}
          </button>
        </div>
      </div>
    </div>
  )
}
