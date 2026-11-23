import { supabase } from "@/shared/supabase/client"
import type { ItemCola } from "@/features/pantalla/types"

type FilaSolicitud = {
  id: string
  estado: string
  inicio_reproduccion: string | null
  cancion: {
    titulo: string
    artista: string
    youtube_id: string
    miniatura_url: string | null
    duracion_seg: number
  }
  voto: { id: string }[]
}

export async function obtenerEstablecimientoActivo(slug: string) {
  const { data } = await supabase
    .from("establecimiento")
    .select("id, nombre, zona_horaria")
    .eq("slug", slug)
    .eq("activo", true)
    .single()
    .overrideTypes<{ id: string; nombre: string; zona_horaria: string } | null, { merge: false }>()

  return data
}

export async function obtenerColaActiva(
  establecimientoId: string,
): Promise<{ cola: ItemCola[]; sesionActiva: boolean; pausada: boolean; pausadaEn: string | null }> {
  const { data: sesion } = await supabase
    .from("sesion")
    .select("id, pausada, pausada_en")
    .eq("establecimiento_id", establecimientoId)
    .eq("estado", "activa")
    .maybeSingle()

  if (!sesion) return { cola: [], sesionActiva: false, pausada: false, pausadaEn: null }

  const { data: solicitudes } = await supabase
    .from("solicitud")
    .select(`
      id,
      estado,
      inicio_reproduccion,
      cancion!inner(titulo, artista, youtube_id, miniatura_url, duracion_seg),
      voto(id)
    `)
    .eq("sesion_id", sesion.id)
    .in("estado", ["pendiente", "reproduciendo"])
    .overrideTypes<FilaSolicitud[], { merge: false }>()

  const cola = (solicitudes ?? [])
    .map((solicitud): ItemCola => ({
      solicitudId: solicitud.id,
      titulo: solicitud.cancion.titulo,
      artista: solicitud.cancion.artista,
      youtubeId: solicitud.cancion.youtube_id,
      miniaturaUrl: solicitud.cancion.miniatura_url,
      duracionSeg: solicitud.cancion.duracion_seg,
      estado: solicitud.estado,
      votos: solicitud.voto.length,
      inicioReproduccion: solicitud.inicio_reproduccion,
    }))
    .sort((a, b) => {
      if (a.estado === "reproduciendo") return -1
      if (b.estado === "reproduciendo") return 1
      return b.votos - a.votos
    })

  return { cola, sesionActiva: true, pausada: sesion.pausada, pausadaEn: sesion.pausada_en }
}
