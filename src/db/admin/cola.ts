import { supabase } from "@/shared/supabase/client"

export type ItemColaAdmin = {
  solicitudId: string
  cancionId: string
  titulo: string
  artista: string
  youtubeId: string
  duracionSeg: number
  estado: "pendiente" | "reproduciendo"
  votos: number
  inicioReproduccion: string | null
}

type FilaSolicitud = {
  id: string
  estado: "pendiente" | "reproduciendo"
  inicio_reproduccion: string | null
  cancion: { id: string; titulo: string; artista: string; youtube_id: string; duracion_seg: number }
  voto: { id: string }[]
}

export async function obtenerColaAdmin(sesionId: string): Promise<ItemColaAdmin[]> {
  const { data } = await supabase
    .from("solicitud")
    .select(`
      id,
      estado,
      inicio_reproduccion,
      cancion!inner(id, titulo, artista, youtube_id, duracion_seg),
      voto(id)
    `)
    .eq("sesion_id", sesionId)
    .in("estado", ["pendiente", "reproduciendo"])
    .overrideTypes<FilaSolicitud[], { merge: false }>()

  const cola = (data ?? []).map((s): ItemColaAdmin => ({
    solicitudId: s.id,
    cancionId: s.cancion.id,
    titulo: s.cancion.titulo,
    artista: s.cancion.artista,
    youtubeId: s.cancion.youtube_id,
    duracionSeg: s.cancion.duracion_seg,
    estado: s.estado,
    votos: s.voto.length,
    inicioReproduccion: s.inicio_reproduccion,
  }))

  return cola.sort((a, b) => {
    if (a.estado === "reproduciendo") return -1
    if (b.estado === "reproduciendo") return 1
    return b.votos - a.votos
  })
}

export async function saltarCancion(sesionId: string, solicitudActualId: string | null): Promise<string | null> {
  const { data, error } = await supabase.rpc("avanzar_cola", {
    p_sesion_id: sesionId,
    p_solicitud_actual_id: solicitudActualId,
    p_resultado: "reproducida",
  })
  if (error) throw error
  return data as string | null
}

export async function bloquearCancionYQuitar(params: {
  establecimientoId: string
  sesionId: string
  solicitudActualId: string | null
  cancionId: string
  motivo: string
  bloqueadaHasta: string
}) {
  const { error: bloqueoError } = await supabase.from("bloqueo_cancion").upsert(
    {
      establecimiento_id: params.establecimientoId,
      cancion_id: params.cancionId,
      motivo: params.motivo || null,
      bloqueada_hasta: params.bloqueadaHasta,
    },
    { onConflict: "establecimiento_id,cancion_id" },
  )
  if (bloqueoError) throw bloqueoError

  const { error } = await supabase.rpc("avanzar_cola", {
    p_sesion_id: params.sesionId,
    p_solicitud_actual_id: params.solicitudActualId,
    p_resultado: "rechazada",
  })
  if (error) throw error
}
