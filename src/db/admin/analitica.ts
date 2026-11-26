import { supabase } from "@/shared/supabase/client"

export type FiltroNoches = { desde: string; hasta: string }

type Metricas = {
  session: {
    estado: "activa" | "cerrada"
    abierta_en: string
    zona_horaria: string
    dia_semana: number
    solicitudes: number
    votos_vigentes: number
    dispositivos_unicos: number
    cancion_mas_votada_id: string | null
  }
  song: {
    cancion_id: string
    titulo: string
    artista: string
    solicitudes: number
    votos_vigentes: number
    cuota_votos: number | null
  }
  hour: {
    franja_local: string
    solicitudes: number
    altas_de_votos_aun_vigentes: number
  }
}

type Tipo = keyof Metricas
export type FilaAnalitica<T extends Tipo> = {
  noche: string
  sesion_id: string
  row_key: string
  metricas: Metricas[T]
}

type Corte = {
  version: string | null
  publicado_en: string | null
  corte_fuente: string | null
}

type Pagina<T extends Tipo> = Corte & { filas: FilaAnalitica<T>[] }

export class PublicacionActualizada extends Error {}

class ErrorAnalitica extends Error {
  constructor(public code: string) {
    super(code)
  }
}

async function errorDeConsulta(error: unknown) {
  const respuesta = (error as { context?: Response }).context
  if (respuesta instanceof Response) {
    if ([401, 403].includes(respuesta.status)) return new ErrorAnalitica("acceso_denegado")
    if ([404, 503].includes(respuesta.status)) return new ErrorAnalitica("analitica_no_configurada")
  }
  return error
}

const limite = 500

async function obtenerFilas<T extends Tipo>(
  tipo: T,
  filtros: FiltroNoches,
  sesionId: string | null,
  signal: AbortSignal,
  corteEsperado?: Corte,
) {
  let corte = corteEsperado
  const filas: FilaAnalitica<T>[] = []

  while (true) {
    const { data: respuesta, error } = await supabase.functions.invoke<Pagina<T>>("leer-analitica", {
      signal,
      body: {
        p_kind: tipo,
        p_desde: filtros.desde || null,
        p_hasta: filtros.hasta || null,
        p_sesion_id: sesionId,
        p_limit: limite,
        p_offset: filas.length,
      },
    })

    if (error) throw await errorDeConsulta(error)
    const data = respuesta
    if (!data || !Array.isArray(data.filas) || (data.version !== null && typeof data.version !== "string")) {
      throw new Error("La publicación analítica llegó en un formato inválido.")
    }
    if (corte && data.version !== corte.version) {
      throw new PublicacionActualizada("La publicación cambió durante la consulta.")
    }

    corte = data
    filas.push(...data.filas)
    if (data.filas.length < limite) {
      return { version: corte.version, publicado_en: corte.publicado_en, corte_fuente: corte.corte_fuente, filas }
    }
  }
}

export async function obtenerTableroAnalitico(
  filtros: FiltroNoches,
  sesionSolicitada: string | null,
  signal: AbortSignal,
) {
  const corte = await obtenerFilas("session", filtros, null, signal)
  const sesiones = corte.filas.sort((a, b) =>
    Date.parse(b.metricas.abierta_en) - Date.parse(a.metricas.abierta_en),
  )
  const sesion = sesiones.find((fila) => fila.sesion_id === sesionSolicitada) ?? sesiones[0]

  if (!sesion) return { corte, sesiones, sesion, canciones: [], franjas: [] }
  const [canciones, franjas] = await Promise.all([
    obtenerFilas("song", filtros, sesion.sesion_id, signal, corte),
    obtenerFilas("hour", filtros, sesion.sesion_id, signal, corte),
  ])

  return { corte, sesiones, sesion, canciones: canciones.filas, franjas: franjas.filas }
}
