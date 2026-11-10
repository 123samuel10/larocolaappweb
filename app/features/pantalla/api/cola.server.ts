import { supabase } from "~/shared/supabase/client"
import type { ItemCola } from "../types"

type FilaSolicitud = {
  id: string
  estado: string
  cancion: {
    titulo: string
    artista: string
    miniatura_url: string | null
    duracion_seg: number
  }
  voto: { id: string }[]
}

export async function obtenerEstablecimientoActivo(slug: string) {
  const { data } = await supabase
    .from("establecimiento")
    .select("id, nombre")
    .eq("slug", slug)
    .eq("activo", true)
    .single()
    .overrideTypes<{ id: string; nombre: string } | null, { merge: false }>()

  return data
}

export async function obtenerColaActiva(
  establecimientoId: string,
): Promise<{ cola: ItemCola[]; sesionActiva: boolean }> {
  const { data: sesion } = await supabase
    .from("sesion")
    .select("id")
    .eq("establecimiento_id", establecimientoId)
    .eq("estado", "activa")
    .maybeSingle()

  if (!sesion) return { cola: [], sesionActiva: false }

  const { data: solicitudes } = await supabase
    .from("solicitud")
    .select(`
      id,
      estado,
      cancion!inner(titulo, artista, miniatura_url, duracion_seg),
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
      miniaturaUrl: solicitud.cancion.miniatura_url,
      duracionSeg: solicitud.cancion.duracion_seg,
      estado: solicitud.estado,
      votos: solicitud.voto.length,
    }))
    .sort((a, b) => {
      if (a.estado === "reproduciendo") return -1
      if (b.estado === "reproduciendo") return 1
      return b.votos - a.votos
    })

  return { cola, sesionActiva: true }
}
