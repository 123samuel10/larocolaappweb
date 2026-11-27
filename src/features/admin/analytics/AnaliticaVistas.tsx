import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { FilaAnalitica } from "@/db/admin/analitica"
import { dias, etiquetaFranja, etiquetaSesion, nocheLocal, numero, porcentaje } from "./format"

type Sesion = FilaAnalitica<"session">
type Cancion = FilaAnalitica<"song">
type Franja = FilaAnalitica<"hour">
type Actividad = { etiqueta: string; solicitudes: number; votos: number }

export function Tarjeta({ titulo, children, className = "" }: {
  titulo: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-black/5 bg-white p-4 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-base font-semibold text-[#0c2944]">{titulo}</h2>
      {children}
    </section>
  )
}

function EstadoVacio({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[#f6f5f3] px-4 py-3 text-sm text-slate-600">{children}</p>
}

export function GraficoActividad({ datos, etiquetaVotos }: {
  datos: Actividad[]
  etiquetaVotos: string
}) {
  return (
    <div className="h-64 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickLine={false} minTickGap={16} />
          <YAxis width={32} tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="solicitudes" name="Solicitudes" fill="#133b62" radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
          <Bar dataKey="votos" name={etiquetaVotos} fill="#ba1929" radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Ranking({ canciones, criterio }: {
  canciones: Cancion[]
  criterio: "solicitudes" | "votos_vigentes"
}) {
  const ranking = canciones
    .filter(({ metricas }) => metricas[criterio] > 0)
    .sort((a, b) => b.metricas[criterio] - a.metricas[criterio] || a.row_key.localeCompare(b.row_key))
    .slice(0, 5)

  if (!ranking.length) {
    return <EstadoVacio>{criterio === "solicitudes" ? "Sin solicitudes en esta sesión." : "Sin votos vigentes en esta sesión."}</EstadoVacio>
  }

  return (
    <ol className="space-y-3">
      {ranking.map(({ row_key, metricas }, index) => (
        <li key={row_key} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
          <span className="pt-0.5 text-xs font-semibold text-slate-500">{index + 1}</span>
          <div className="wrap-break-word">
            <p className="font-medium text-[#0c2944]">{metricas.titulo}</p>
            {metricas.artista && <p className="text-xs text-slate-500">{metricas.artista}</p>}
          </div>
          <span className="font-semibold tabular-nums text-[#0c2944]">{numero.format(metricas[criterio])}</span>
          <div aria-hidden="true" className="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${index === 0 ? "bg-[#ba1929]" : "bg-[#133b62]"}`}
              style={{ width: `${metricas[criterio] / ranking[0].metricas[criterio] * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Descriptiva({ sesion, canciones, franjas }: {
  sesion: Sesion
  canciones: Cancion[]
  franjas: Franja[]
}) {
  const { metricas } = sesion
  const favorita = canciones.find(({ metricas: cancion }) => cancion.cancion_id === metricas.cancion_mas_votada_id)
  const kpis = [
    { etiqueta: "Solicitudes", valor: numero.format(metricas.solicitudes) },
    { etiqueta: "Votos vigentes", valor: numero.format(metricas.votos_vigentes) },
    { etiqueta: "Dispositivos únicos", valor: numero.format(metricas.dispositivos_unicos) },
    { etiqueta: "Canción más votada", valor: favorita?.metricas.titulo ?? "Sin votos", detalle: favorita?.metricas.artista },
  ]
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ etiqueta, valor, detalle }) => (
          <div key={etiqueta} className="min-w-0 rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
            <dt className="mb-2 text-xs font-semibold text-slate-600">{etiqueta}</dt>
            <dd className="text-lg font-semibold wrap-break-word text-[#0c2944] sm:text-xl">{valor}</dd>
            {detalle && <dd className="mt-1 text-xs wrap-break-word text-slate-500">{detalle}</dd>}
          </div>
        ))}
      </dl>
      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Canciones más solicitadas">
          <Ranking canciones={canciones} criterio="solicitudes" />
        </Tarjeta>
        <Tarjeta titulo="Canciones más votadas">
          <Ranking canciones={canciones} criterio="votos_vigentes" />
        </Tarjeta>
      </div>
      <Tarjeta titulo="Participación por hora local">
        {franjas.length ? (
          <GraficoActividad
            etiquetaVotos="Altas de votos aún vigentes"
            datos={franjas.map(({ metricas: franja }) => ({
              etiqueta: etiquetaFranja(franja.franja_local),
              solicitudes: franja.solicitudes,
              votos: franja.altas_de_votos_aun_vigentes,
            }))}
          />
        ) : <EstadoVacio>Esta sesión no tiene franjas publicadas.</EstadoVacio>}
      </Tarjeta>
    </div>
  )
}

export function Diagnostica({ canciones, franjas }: { canciones: Cancion[]; franjas: Franja[] }) {
  const masVotadas = canciones
    .filter(({ metricas }) => metricas.votos_vigentes > 0)
    .sort((a, b) => b.metricas.votos_vigentes - a.metricas.votos_vigentes || a.row_key.localeCompare(b.row_key))
    .slice(0, 5)
  const cuotaTop = masVotadas.slice(0, 3).reduce((suma, { metricas }) => suma + (metricas.cuota_votos ?? 0), 0)
  const sinActividad = franjas.filter(({ metricas }) =>
    metricas.solicitudes === 0 && metricas.altas_de_votos_aun_vigentes === 0,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Tarjeta titulo="Concentración de votos">
        {masVotadas.length ? (
          <>
            <p className="mb-4 text-sm text-slate-600">
              <strong className="text-[#0c2944]">{porcentaje.format(cuotaTop)}</strong> de los votos vigentes en las
              {" "}{masVotadas.length < 3 ? "canciones con votos" : "tres canciones más votadas"}.
            </p>
            <ul className="space-y-3">
              {masVotadas.map(({ row_key, metricas }) => (
                <li key={row_key}>
                  <div className="mb-1.5 flex justify-between gap-3">
                    <span className="min-w-0 wrap-break-word text-[#0c2944]">{metricas.titulo}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{porcentaje.format(metricas.cuota_votos ?? 0)}</span>
                  </div>
                  <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#ba1929]"
                      style={{ width: `${(metricas.cuota_votos ?? 0) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : <EstadoVacio>Sin votos vigentes para calcular la concentración.</EstadoVacio>}
      </Tarjeta>
      <Tarjeta titulo="Franjas sin actividad registrada">
        {sinActividad.length ? (
          <>
            <p className="mb-3 text-sm text-slate-600">
              {numero.format(sinActividad.length)} de {numero.format(franjas.length)} franjas sin solicitudes ni altas de votos aún vigentes.
            </p>
            <ul className="flex flex-wrap gap-2">
              {sinActividad.map(({ row_key, metricas }) => (
                <li key={row_key} className="rounded-lg bg-[#e9f0f7] px-3 py-1.5 text-xs font-medium text-[#0c2944]">
                  {etiquetaFranja(metricas.franja_local)}
                </li>
              ))}
            </ul>
          </>
        ) : <EstadoVacio>{franjas.length ? "Todas las franjas tienen actividad registrada." : "Esta sesión no tiene franjas publicadas."}</EstadoVacio>}
      </Tarjeta>
    </div>
  )
}

export type Agrupacion = "sesion" | "noche" | "dia"

export function Comparativa({ sesiones, agrupacion }: { sesiones: Sesion[]; agrupacion: Agrupacion }) {
  const grupos = new Map<string, Actividad & { sesiones: number; dispositivos: number; parciales: number }>()
  for (const sesion of sesiones) {
    const { metricas } = sesion
    const clave = agrupacion === "sesion" ? sesion.sesion_id : agrupacion === "noche" ? sesion.noche : String(metricas.dia_semana)
    const etiqueta = agrupacion === "sesion" ? etiquetaSesion(sesion) : agrupacion === "noche" ? nocheLocal(sesion.noche) : dias[metricas.dia_semana]
    const fila = grupos.get(clave) ?? { etiqueta, solicitudes: 0, votos: 0, sesiones: 0, dispositivos: 0, parciales: 0 }
    fila.solicitudes += metricas.solicitudes
    fila.votos += metricas.votos_vigentes
    fila.dispositivos += metricas.dispositivos_unicos
    fila.parciales += Number(metricas.estado === "activa")
    fila.sesiones += 1
    grupos.set(clave, fila)
  }

  const filas = [...grupos]
  if (agrupacion === "dia") filas.sort(([a], [b]) => Number(a) - Number(b))
  const serie = filas.slice(0, 12).map(([, fila]) => fila)
  if (agrupacion !== "dia") serie.reverse()

  return (
    <Tarjeta titulo="Participación comparada">
      <GraficoActividad datos={serie} etiquetaVotos="Votos vigentes" />
      {filas.length > 12 && <p className="mb-3 text-xs text-slate-500">El gráfico muestra los 12 períodos más recientes.</p>}
      <div className="max-h-96 overflow-auto" tabIndex={0} aria-label="Detalle de la comparación">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-600">
            <tr>
              <th scope="col" className="px-2 py-2">Período</th>
              <th scope="col" className="px-2 py-2 text-right">Sesiones</th>
              <th scope="col" className="px-2 py-2 text-right">Solicitudes</th>
              <th scope="col" className="px-2 py-2 text-right">Votos vigentes</th>
              <th scope="col" className="px-2 py-2 text-right">{agrupacion === "sesion" ? "Dispositivos únicos" : "Dispositivos promedio por sesión"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map(([clave, fila]) => (
              <tr key={clave} className="tabular-nums">
                <th scope="row" className="px-2 py-3 font-medium text-[#0c2944]">
                  {fila.etiqueta}
                  {fila.parciales > 0 && <span className="block text-xs font-normal text-slate-500">{agrupacion === "sesion" ? "Sesión en curso" : `${fila.parciales} en curso`}</span>}
                </th>
                <td className="px-2 py-3 text-right">{numero.format(fila.sesiones)}</td>
                <td className="px-2 py-3 text-right">{numero.format(fila.solicitudes)}</td>
                <td className="px-2 py-3 text-right">{numero.format(fila.votos)}</td>
                <td className="px-2 py-3 text-right">{numero.format(fila.dispositivos / fila.sesiones)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  )
}
