import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { Check, ChevronDown } from "lucide-react"

type Opcion = { value: string; label: string }

type DropdownProps = {
  id: string
  value: string
  options: Opcion[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").normalize("NFD").replace(/\p{M}/gu, "")
}

export function Dropdown({
  id,
  value,
  options,
  onChange,
  placeholder = "Selecciona una opción…",
  required = false,
}: DropdownProps) {
  const listaId = useId()
  const control = useRef<HTMLButtonElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const busqueda = useRef({ texto: "", instante: 0 })
  const [apertura, setApertura] = useState<{ arriba: boolean; altura: number } | null>(null)
  const [activo, setActivo] = useState<string>()
  const seleccionado = options.find((opcion) => opcion.value === value)
  const indiceActivo = options.findIndex((opcion) => opcion.value === activo)
  const abierto = apertura !== null && options.length > 0

  useEffect(() => {
    if (!abierto || indiceActivo < 0) return
    lista.current?.children[indiceActivo]?.scrollIntoView({ block: "nearest" })
  }, [abierto, indiceActivo])

  function abrir(opcion = seleccionado ?? options[0]) {
    const rect = control.current?.getBoundingClientRect()
    if (!rect || !opcion) return
    const debajo = window.innerHeight - rect.bottom - 16
    const encima = rect.top - 16
    const arriba = debajo < Math.min(240, 44 * options.length + 8) && encima > debajo
    setActivo(opcion.value)
    setApertura({ arriba, altura: Math.max(0, Math.min(240, arriba ? encima : debajo)) })
  }

  function cerrar() {
    setApertura(null)
    busqueda.current = { texto: "", instante: 0 }
  }

  function elegir(opcion: Opcion) {
    cerrar()
    onChange(opcion.value)
  }

  function alPulsar(evento: KeyboardEvent<HTMLButtonElement>) {
    const { key } = evento
    switch (key) {
      case "ArrowDown":
      case "ArrowUp": {
        evento.preventDefault()
        const haciaAbajo = key === "ArrowDown"
        if (!abierto) {
          abrir(seleccionado ?? options[haciaAbajo ? 0 : options.length - 1])
          return
        }
        const siguiente = indiceActivo + (haciaAbajo ? 1 : -1)
        const indice = Math.max(0, Math.min(options.length - 1, siguiente))
        setActivo(options[indice]?.value)
        return
      }
      case "Home":
      case "End": {
        evento.preventDefault()
        const opcion = options[key === "Home" ? 0 : options.length - 1]
        if (abierto) setActivo(opcion?.value)
        else abrir(opcion)
        return
      }
      case "Escape":
        if (!abierto) return
        evento.preventDefault()
        evento.stopPropagation()
        cerrar()
        return
      case "Enter":
      case " ":
        if (!abierto) return
        evento.preventDefault()
        if (indiceActivo >= 0) elegir(options[indiceActivo])
        return
      default:
        if (key.length !== 1 || evento.ctrlKey || evento.altKey || evento.metaKey || evento.nativeEvent.isComposing) return
        evento.preventDefault()
        const ahora = evento.timeStamp
        const prefijo = ahora - busqueda.current.instante <= 700 ? busqueda.current.texto : ""
        const texto = prefijo + normalizar(key)
        const opcion = options.find(({ label }) => normalizar(label).startsWith(texto))
        busqueda.current = { texto, instante: ahora }
        if (!opcion) return
        if (abierto) setActivo(opcion.value)
        else abrir(opcion)
    }
  }

  return (
    <div className="relative min-w-0">
      <button
        ref={control}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-activedescendant={abierto && indiceActivo >= 0 ? `${listaId}-${indiceActivo}` : undefined}
        aria-required={required || undefined}
        disabled={options.length === 0}
        onClick={() => {
          control.current?.focus()
          if (abierto) cerrar()
          else abrir()
        }}
        onBlur={cerrar}
        onKeyDown={alPulsar}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-[#a4adba] bg-white px-4 py-[0.8rem] text-left text-sm hover:border-[#133b62] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133b62] disabled:opacity-60"
      >
        <span className={seleccionado ? "truncate text-[#0c2944]" : "truncate text-gray-500"}>
          {seleccionado?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-[#133b62] transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      {abierto && (
        <ul
          ref={lista}
          id={listaId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          style={{ maxHeight: apertura.altura }}
          className={`absolute z-10 w-full overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1 shadow-lg ${apertura.arriba ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {options.map((opcion, indice) => (
            <li
              key={opcion.value}
              id={`${listaId}-${indice}`}
              role="option"
              aria-selected={opcion.value === value}
              onMouseDown={(evento) => evento.preventDefault()}
              onMouseEnter={() => setActivo(opcion.value)}
              onClick={() => elegir(opcion)}
              className={`flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-[#0c2944] ${opcion.value === activo ? "bg-[#e9f0f7]" : ""} ${opcion.value === value ? "font-semibold" : ""}`}
            >
              <span className="min-w-0 wrap-break-word">{opcion.label}</span>
              {opcion.value === value && <Check aria-hidden="true" className="size-4 shrink-0 text-[#133b62]" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
