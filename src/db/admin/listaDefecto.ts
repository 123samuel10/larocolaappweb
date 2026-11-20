import { supabase } from "@/shared/supabase/client"

export type ItemListaDefecto = {
  id: string
  cancionId: string
  titulo: string
  artista: string
  duracionSeg: number
  posicion: number
  sonadaEn: string | null
}

type FilaLista = {
  id: string
  posicion: number
  sonada_en: string | null
  cancion: { id: string; titulo: string; artista: string; duracion_seg: number }
}

export async function obtenerListaDefecto(establecimientoId: string): Promise<ItemListaDefecto[]> {
  const { data } = await supabase
    .from("lista_defecto_item")
    .select("id, posicion, sonada_en, cancion!inner(id, titulo, artista, duracion_seg)")
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
  }))
}

export type CancionBusqueda = { id: string; titulo: string; artista: string; duracionSeg: number }

export async function buscarCancionesExistentes(consulta: string): Promise<CancionBusqueda[]> {
  const { data } = await supabase
    .from("cancion")
    .select("id, titulo, artista, duracion_seg")
    .ilike("titulo", `%${consulta}%`)
    .limit(10)

  return (data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    artista: c.artista,
    duracionSeg: c.duracion_seg,
  }))
}

export async function agregarCancionALista(establecimientoId: string, cancionId: string, posicion: number) {
  const { error } = await supabase
    .from("lista_defecto_item")
    .insert({ establecimiento_id: establecimientoId, cancion_id: cancionId, posicion })
  if (error) throw error
}

/** Marca un ítem como sonado ahora. Pensado para que lo llame el reproductor (Android/Pantalla) cuando efectivamente reproduce una canción de la lista por defecto. */
export async function marcarSonada(id: string) {
  const { error } = await supabase
    .from("lista_defecto_item")
    .update({ sonada_en: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
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
