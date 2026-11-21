import { useEffect, useRef, useState } from "react"
import { Search, X, Plus, Check } from "lucide-react"
import { obtenerSugerencias, buscarEnYoutube, BusquedaError, type ResultadoBusqueda } from "@/db/admin/busqueda"
import { formatearDuracion } from "@/shared/format/duracion"

type EstadoResultados =
  | { tipo: "inicial" }
  | { tipo: "cargando" }
  | { tipo: "resultados"; items: ResultadoBusqueda[] }
  | { tipo: "sin_resultados" }
  | { tipo: "cuota_agotada" }
  | { tipo: "error"; mensaje: string }

const MENSAJES_ERROR: Record<string, string> = {
  cuota_agotada: "Se agotó la cuota de búsqueda de YouTube por hoy. Intenta más tarde.",
  rate_limit: "Demasiadas búsquedas seguidas. Espera un momento.",
  network_error: "No se pudo conectar con el buscador. Intenta de nuevo.",
}

export function AgregarCancionModal({
  sesionId,
  cancionIdsExistentes,
  onSeleccionar,
  onClose,
}: {
  sesionId?: string
  cancionIdsExistentes: Set<string>
  onSeleccionar: (resultado: ResultadoBusqueda) => void
  onClose: () => void
}) {
  const [texto, setTexto] = useState("")
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [estado, setEstado] = useState<EstadoResultados>({ tipo: "inicial" })
  const buscandoRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (buscandoRef.current) {
      buscandoRef.current = false
      return
    }
    if (texto.trim().length < 3) {
      setSugerencias([])
      setMostrarSugerencias(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const sugs = await obtenerSugerencias(texto)
      setSugerencias(sugs)
      setMostrarSugerencias(sugs.length > 0)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [texto])

  const buscar = async (consulta: string) => {
    if (!consulta.trim()) return
    // Cancela el debounce de sugerencias pendiente: si no, su setTimeout
    // puede resolver después de buscar() y volver a mostrar el dropdown.
    if (debounceRef.current) clearTimeout(debounceRef.current)
    buscandoRef.current = true
    setMostrarSugerencias(false)
    setEstado({ tipo: "cargando" })
    try {
      const items = await buscarEnYoutube(consulta.trim(), sesionId)
      setEstado(items.length === 0 ? { tipo: "sin_resultados" } : { tipo: "resultados", items })
    } catch (e) {
      if (e instanceof BusquedaError) {
        setEstado(
          e.code === "cuota_agotada"
            ? { tipo: "cuota_agotada" }
            : { tipo: "error", mensaje: MENSAJES_ERROR[e.code] ?? e.message },
        )
      } else {
        setEstado({ tipo: "error", mensaje: "Error inesperado al buscar." })
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-xl w-full rounded-2xl mx-4 flex flex-col max-h-[85vh]">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-[#0c2944]">Agregar canción</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#0c2944] transition-colors"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-[#133b62] transition-colors">
              <Search className="size-4 text-gray-400 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") buscar(texto)
                }}
                placeholder="Busca una canción en YouTube..."
                className="w-full py-2.5 text-sm outline-none"
              />
              {texto && (
                <button
                  onClick={() => {
                    setTexto("")
                    setEstado({ tipo: "inicial" })
                    setSugerencias([])
                  }}
                  className="text-gray-400 hover:text-[#0c2944] shrink-0"
                  aria-label="Limpiar"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {mostrarSugerencias && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                {sugerencias.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setTexto(sug)
                      buscar(sug)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 overflow-y-auto flex-1">
          {estado.tipo === "inicial" && (
            <p className="text-sm text-gray-400 text-center py-8">Escribe el nombre de una canción o artista.</p>
          )}
          {estado.tipo === "cargando" && (
            <p className="text-sm text-gray-400 text-center py-8">Buscando…</p>
          )}
          {estado.tipo === "sin_resultados" && (
            <p className="text-sm text-gray-400 text-center py-8">No se encontraron resultados.</p>
          )}
          {estado.tipo === "cuota_agotada" && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">{MENSAJES_ERROR.cuota_agotada}</p>
          )}
          {estado.tipo === "error" && (
            <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{estado.mensaje}</p>
          )}
          {estado.tipo === "resultados" && (
            <div className="space-y-2">
              {estado.items.map((item) => {
                const yaAgregada = !!item.cancionId && cancionIdsExistentes.has(item.cancionId)
                return (
                  <div
                    key={item.youtubeId}
                    className={`flex items-center gap-3 rounded-xl p-2 ${item.reproducible ? "" : "opacity-50"}`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.miniaturaUrl}
                        alt=""
                        className="w-20 h-14 rounded-lg object-cover bg-gray-100"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {formatearDuracion(item.duracionSeg)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0c2944] truncate">{item.titulo}</p>
                      {item.reproducible ? (
                        <p className="text-xs text-gray-400 truncate">{item.artista}</p>
                      ) : (
                        <p className="text-xs text-[#ba1929]">No se puede reproducir</p>
                      )}
                    </div>
                    <button
                      onClick={() => item.cancionId && onSeleccionar(item)}
                      disabled={!item.reproducible || !item.cancionId || yaAgregada}
                      className={`shrink-0 size-9 rounded-full flex items-center justify-center transition-colors ${
                        yaAgregada
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-[#ba1929] text-white hover:bg-[#a01522] disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                      aria-label={yaAgregada ? "Ya está en la lista" : `Agregar ${item.titulo}`}
                    >
                      {yaAgregada ? <Check className="size-4" /> : <Plus className="size-4" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
