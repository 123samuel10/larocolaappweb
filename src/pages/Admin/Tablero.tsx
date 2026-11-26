import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, CalendarDays, ChartNoAxesColumn, RefreshCw } from "lucide-react"
import { useAuth } from "@/store/useAuth"
import { obtenerTableroAnalitico, PublicacionActualizada } from "@/db/admin/analitica"
import { Dropdown } from "@/shared/ui/Dropdown"
import { Comparativa, Descriptiva, Diagnostica, Tarjeta, type Agrupacion } from "@/features/admin/analytics/AnaliticaVistas"
import { etiquetaSesion, fechaHora } from "@/features/admin/analytics/format"

const vistas = [
  { id: "descriptiva", nombre: "Descriptiva", icono: ChartNoAxesColumn },
  { id: "diagnostica", nombre: "Diagnóstica", icono: Activity },
  { id: "comparativa", nombre: "Comparativa", icono: CalendarDays },
] as const

const grupos = [
  { value: "sesion", label: "Por sesión" },
  { value: "noche", label: "Por noche" },
  { value: "dia", label: "Por día de la semana" },
] satisfies { value: Agrupacion; label: string }[]

function mensajeError(error: unknown) {
  const codigo = typeof error === "object" && error && "code" in error ? error.code : null
  if (codigo === "analitica_no_configurada") return "La consulta de analítica aún no está habilitada en Supabase."
  if (codigo === "acceso_denegado") return "Tu cuenta no tiene acceso a la analítica de este establecimiento."
  if (error instanceof PublicacionActualizada) return "Se está actualizando la publicación. Intenta consultar de nuevo."
  return "Ocurrió un problema al consultar las estadísticas."
}

export default function Tablero() {
  const { admin } = useAuth()
  const establecimientoId = admin?.establecimientoId
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [sesionId, setSesionId] = useState<string | null>(null)
  const [vista, setVista] = useState<(typeof vistas)[number]["id"]>("descriptiva")
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("sesion")
  const rangoValido = !desde || !hasta || desde <= hasta

  const analitica = useQuery({
    queryKey: ["admin", "analitica", establecimientoId, desde, hasta, sesionId],
    queryFn: ({ signal }) => obtenerTableroAnalitico({ desde, hasta }, sesionId, signal),
    enabled: Boolean(establecimientoId) && rangoValido,
    refetchInterval: 5 * 60 * 1000,
    retry: (intento, error) => error instanceof PublicacionActualizada && intento < 2,
  })

  const datos = analitica.data
  const sesion = datos?.sesion
  const ultimaPublicacion = datos?.corte.publicado_en
  const zonaHoraria = sesion?.metricas.zona_horaria ?? "America/Bogota"
  const opcionesSesion = datos?.sesiones.map((fila) => ({
    value: fila.sesion_id,
    label: etiquetaSesion(fila),
  })) ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="rocola-display text-2xl text-[#0c2944] sm:text-3xl">Tablero de analítica</h1>
          <p className="mt-1 text-sm text-slate-600">Solicitudes, votación y participación en tu establecimiento.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ultimaPublicacion && (
            <p className="px-1 text-xs text-slate-600">
              Última publicación <time className="font-semibold text-[#0c2944]" dateTime={ultimaPublicacion}>
                {fechaHora(ultimaPublicacion, zonaHoraria)}
              </time>
            </p>
          )}
          <button type="button" onClick={() => void analitica.refetch()}
            disabled={analitica.isFetching || !rangoValido || !establecimientoId}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#a4adba] bg-white px-3 text-sm font-medium text-[#0c2944] hover:border-[#133b62] focus-visible:outline-2 focus-visible:outline-[#133b62] disabled:cursor-default disabled:opacity-55">
            <RefreshCw aria-hidden className={`size-4 ${analitica.isFetching ? "motion-safe:animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-black/5 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
          <label className="grid min-w-0 gap-1 text-xs font-medium text-[#0c2944]">
            Noche desde
            <input type="date" value={desde} max={hasta || undefined}
              onChange={(event) => { setDesde(event.target.value); setSesionId(null) }}
              className="rocola-input min-w-0 text-sm" />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium text-[#0c2944]">
            Noche hasta
            <input type="date" value={hasta} min={desde || undefined}
              onChange={(event) => { setHasta(event.target.value); setSesionId(null) }}
              className="rocola-input min-w-0 text-sm" />
          </label>
          {vista !== "comparativa" && (
            <div className="grid min-w-0 gap-1 sm:col-span-2 xl:col-span-1">
              <label id="sesion-analitica-label" htmlFor="sesion-analitica" className="text-xs font-medium text-[#0c2944]">Sesión</label>
              <Dropdown id="sesion-analitica" value={sesion?.sesion_id ?? ""} options={opcionesSesion}
                placeholder="Sin sesiones en el período" onChange={setSesionId} />
            </div>
          )}
          {vista === "comparativa" && (
            <div className="grid min-w-0 gap-1 sm:col-span-2 xl:col-span-1">
              <label id="grupo-analitica-label" htmlFor="grupo-analitica" className="text-xs font-medium text-[#0c2944]">Agrupar</label>
              <Dropdown id="grupo-analitica" options={grupos} value={agrupacion}
                onChange={(valor) => setAgrupacion(grupos.find(({ value }) => value === valor)?.value ?? "sesion")} />
            </div>
          )}
        </div>
      </div>

      <div role="group" aria-label="Tipo de analítica" className="flex flex-wrap gap-2">
        {vistas.map(({ id, nombre, icono: Icono }) => (
          <button key={id} type="button" aria-pressed={vista === id} onClick={() => setVista(id)}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#0c2944]/15 bg-white px-3 text-sm font-medium text-[#0c2944] hover:border-[#133b62] focus-visible:outline-2 focus-visible:outline-[#133b62] aria-pressed:border-[#0c2944] aria-pressed:bg-[#0c2944] aria-pressed:text-white">
            <Icono aria-hidden className="size-4" />
            {nombre}
          </button>
        ))}
      </div>

      {!establecimientoId ? (
        <Tarjeta titulo="Establecimiento sin asignar">
          <p className="text-sm text-slate-600">Tu cuenta necesita un establecimiento asociado para consultar estadísticas.</p>
        </Tarjeta>
      ) : !rangoValido ? (
        <p role="alert" className="rounded-xl bg-white p-4 text-sm text-[#a41423]">La noche inicial debe ser anterior o igual a la final.</p>
      ) : analitica.isPending ? (
        <p role="status" className="rounded-xl bg-white p-4 text-sm text-slate-600">Cargando estadísticas…</p>
      ) : analitica.isError ? (
        <Tarjeta titulo="Estadísticas no disponibles">
          <p role="alert" className="text-sm text-slate-600">{mensajeError(analitica.error)}</p>
        </Tarjeta>
      ) : !datos?.corte.version ? (
        <Tarjeta titulo="A la espera de la primera publicación">
          <p className="text-sm text-slate-600">El tablero mostrará los indicadores cuando el pipeline publique su primer lote.</p>
        </Tarjeta>
      ) : !sesion ? (
        <Tarjeta titulo="Sin sesiones en el período">
          <p className="text-sm text-slate-600">Prueba con otro rango de noches para consultar las sesiones publicadas.</p>
        </Tarjeta>
      ) : vista === "comparativa" ? (
        <Comparativa sesiones={datos.sesiones} agrupacion={agrupacion} />
      ) : (
        <>
          {sesion.metricas.estado === "activa" && <p className="text-xs text-slate-600">Sesión en curso · Datos parciales al último corte.</p>}
          {vista === "descriptiva"
            ? <Descriptiva sesion={sesion} canciones={datos.canciones} franjas={datos.franjas} />
            : <Diagnostica franjas={datos.franjas} />}
        </>
      )}
    </div>
  )
}
