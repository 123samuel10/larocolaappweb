import { supabase } from "@/shared/supabase/client"
import type { ItemCola } from "@/features/pantalla/types"

type FilaListaDefecto = {
  id: string
  inicio_reproduccion: string | null
  cancion: {
    titulo: string
    artista: string
    youtube_id: string
    miniatura_url: string | null
    duracion_seg: number
  }
}

export async function obtenerCancionDefectoActual(establecimientoId: string): Promise<ItemCola | null> {
  const { data: item } = await supabase
    .from("lista_defecto_item")
    .select("id, inicio_reproduccion, cancion!inner(titulo, artista, youtube_id, miniatura_url, duracion_seg)")
    .eq("establecimiento_id", establecimientoId)
    .not("inicio_reproduccion", "is", null)
    .limit(1)
    .maybeSingle()
    .overrideTypes<FilaListaDefecto | null, { merge: false }>()

  if (!item) return null

  return {
    solicitudId: `defecto-${item.id}`,
    titulo: item.cancion.titulo,
    artista: item.cancion.artista,
    youtubeId: item.cancion.youtube_id,
    miniaturaUrl: item.cancion.miniatura_url,
    duracionSeg: item.cancion.duracion_seg,
    estado: "reproduciendo",
    votos: 0,
    inicioReproduccion: item.inicio_reproduccion,
  }
}
