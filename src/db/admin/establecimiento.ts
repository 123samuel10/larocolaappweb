import { supabase } from "@/shared/supabase/client"

export type EstablecimientoPropio = {
  id: string
  nombre: string
  zonaHoraria: string
  slug: string
}

export async function obtenerEstablecimientoPropio(id: string): Promise<EstablecimientoPropio | null> {
  const { data } = await supabase
    .from("establecimiento")
    .select("id, nombre, zona_horaria, slug")
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  return { id: data.id, nombre: data.nombre, zonaHoraria: data.zona_horaria, slug: data.slug }
}
