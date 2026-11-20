import { supabase } from "@/shared/supabase/client"
import type { Horario } from "@/lib/horario"

export async function obtenerHorarios(establecimientoId: string): Promise<Horario[]> {
  const { data } = await supabase
    .from("horario")
    .select("dia_semana, hora_inicio, hora_fin")
    .eq("establecimiento_id", establecimientoId)

  return data ?? []
}
