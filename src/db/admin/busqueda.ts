import { supabase } from "@/shared/supabase/client"

export type ResultadoBusqueda = {
  cancionId: string | null
  youtubeId: string
  titulo: string
  artista: string
  duracionSeg: number
  miniaturaUrl: string
  reproducible: boolean
}

export class BusquedaError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

async function codigoDeError(error: unknown): Promise<string> {
  const contexto = (error as { context?: Response }).context
  if (!contexto) return "network_error"
  try {
    const body = await contexto.json()
    return typeof body?.error === "string" ? body.error : "network_error"
  } catch {
    return "network_error"
  }
}

export async function obtenerSugerencias(q: string): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("sugerencias-busqueda", { body: { q } })
  if (error) return []
  return (data?.sugerencias ?? []) as string[]
}

export async function buscarEnYoutube(q: string, sesionId?: string): Promise<ResultadoBusqueda[]> {
  const { data, error } = await supabase.functions.invoke("youtube-search", {
    body: { q, sesion_id: sesionId },
  })
  if (error) throw new BusquedaError(await codigoDeError(error), error.message)

  return ((data?.resultados ?? []) as Array<Record<string, unknown>>).map((r) => ({
    cancionId: (r.cancion_id as string | null) ?? null,
    youtubeId: r.youtube_id as string,
    titulo: r.titulo as string,
    artista: r.artista as string,
    duracionSeg: r.duracion_seg as number,
    miniaturaUrl: r.miniatura_url as string,
    reproducible: r.reproducible as boolean,
  }))
}
