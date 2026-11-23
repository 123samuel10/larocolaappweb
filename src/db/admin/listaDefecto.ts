import { supabase } from "@/shared/supabase/client"

export type ItemListaDefecto = {
  id: string
  cancionId: string
  titulo: string
  artista: string
  duracionSeg: number
  posicion: number
  sonadaEn: string | null
  vecesSonada: number
}

type FilaLista = {
  id: string
  posicion: number
  sonada_en: string | null
  cancion: { id: string; titulo: string; artista: string; duracion_seg: number }
  lista_defecto_reproduccion: { count: number }[]
}

export async function obtenerListaDefecto(establecimientoId: string): Promise<ItemListaDefecto[]> {
  const { data } = await supabase
    .from("lista_defecto_item")
    .select("id, posicion, sonada_en, cancion!inner(id, titulo, artista, duracion_seg), lista_defecto_reproduccion(count)")
    .eq("establecimiento_id", establecimientoId)
    .order("posicion", { ascending: true })
    .overrideTypes<FilaLista[], { merge: false }>()

  return (data ?? []).map((i) => ({
    id: i.id,
    cancionId: i.cancion.id,
    titulo: i.cancion.titulo,
    artista: i.cancion.artista,
    duracionSeg: i.cancion.duracion_seg,
    posicion: i.posicion,
    sonadaEn: i.sonada_en,
    vecesSonada: i.lista_defecto_reproduccion?.[0]?.count ?? 0,
  }))
}

export async function agregarCancionALista(establecimientoId: string, cancionId: string, posicion: number) {
  const { error } = await supabase
    .from("lista_defecto_item")
    .insert({ establecimiento_id: establecimientoId, cancion_id: cancionId, posicion })
  if (error) throw error
}

/**
 * Marca un ítem como sonado ahora y registra la repetición en el historial.
 * Pensado para que lo llame el reproductor (Android/Pantalla) cuando efectivamente reproduce
 * una canción de la lista por defecto, y también para el botón "Repetir" del admin.
 */
export async function marcarSonada(id: string) {
  const ahora = new Date().toISOString()

  const { error: errorActualizar } = await supabase
    .from("lista_defecto_item")
    .update({ sonada_en: ahora })
    .eq("id", id)
  if (errorActualizar) throw errorActualizar

  const { error: errorHistorial } = await supabase
    .from("lista_defecto_reproduccion")
    .insert({ lista_defecto_item_id: id, reproducida_en: ahora })
  if (errorHistorial) throw errorHistorial
}

export async function obtenerCumplimiento(establecimientoId: string): Promise<number | null> {
  const items = await obtenerListaDefecto(establecimientoId)
  if (items.length === 0) return null
  return Math.round((items.filter((i) => i.sonadaEn).length / items.length) * 100)
}

export async function quitarDeLista(id: string) {
  const { error } = await supabase.from("lista_defecto_item").delete().eq("id", id)
  if (error) throw error
}

export async function reordenarLista(items: { id: string; posicion: number }[]) {
  for (const item of items) {
    const { error } = await supabase
      .from("lista_defecto_item")
      .update({ posicion: item.posicion })
      .eq("id", item.id)
    if (error) throw error
  }
}
