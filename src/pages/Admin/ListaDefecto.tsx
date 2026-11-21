import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { useSesionActiva } from "@/features/admin/hooks/useSesionActiva"
import { AgregarCancionModal } from "@/features/admin/components/AgregarCancionModal"
import { obtenerListaDefecto, agregarCancionALista, quitarDeLista, reordenarLista } from "@/db/admin/listaDefecto"
import type { ResultadoBusqueda } from "@/db/admin/busqueda"

export default function ListaDefecto() {
  const qc = useQueryClient()
  const { establecimientoId, sesion, isLoading: cargandoSesion } = useSesionActiva()
  const [modalAbierto, setModalAbierto] = useState(false)

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
      setModalAbierto(false)
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

  const handleSeleccionar = (resultado: ResultadoBusqueda) => {
    if (resultado.cancionId) agregar.mutate(resultado.cancionId)
  }

  if (cargandoSesion) return null

  const cancionIdsExistentes = new Set(items.map((i) => i.cancionId))

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
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors inline-flex items-center gap-2 whitespace-nowrap mt-1"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar canción
        </button>
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
                  <th className="w-8 px-3 pb-3 text-left">#</th>
                  <th className="pb-3 pr-3 text-left">Canción</th>
                  <th className="pb-3 pr-3 text-left">Artista</th>
                  <th className="pb-3 pr-3 text-left">Estado</th>
                  <th className="w-px pb-3 pr-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const estado = item.sonadaEn ? "Ya sonó" : i === siguienteIndex ? "Siguiente" : "En espera"
                  return (
                    <tr key={item.id} className={`border-b border-gray-50 ${estado === "Siguiente" ? "bg-red-50" : ""}`}>
                      <td className="px-3 py-3 text-gray-400">{item.posicion}</td>
                      <td className="py-3 pr-3 font-medium text-[#0c2944]">{item.titulo}</td>
                      <td className="py-3 pr-3 text-gray-500">{item.artista || "—"}</td>
                      <td
                        className={`py-3 pr-3 ${estado === "Siguiente" ? "text-[#ba1929] font-bold" : estado === "Ya sonó" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {estado}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        {estado !== "Ya sonó" && (
                          <button
                            type="button"
                            onClick={() => quitar.mutate(item.id)}
                            aria-label={`Quitar «${item.titulo}» de la lista`}
                            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:border-red-400 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                          >
                            <Trash2 aria-hidden="true" className="size-3.5 shrink-0" />
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

      {modalAbierto && (
        <AgregarCancionModal
          sesionId={sesion?.id}
          cancionIdsExistentes={cancionIdsExistentes}
          onSeleccionar={handleSeleccionar}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}
