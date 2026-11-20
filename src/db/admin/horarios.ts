import { supabase } from "@/shared/supabase/client"
import type { Horario } from "@/lib/horario"

export async function obtenerHorarios(establecimientoId: string): Promise<Horario[]> {
  const { data } = await supabase
    .from("horario")
    .select("dia_semana, hora_inicio, hora_fin")
    .eq("establecimiento_id", establecimientoId)

  return data ?? []
}

export async function guardarHorarioDia(
  establecimientoId: string,
  diaSemana: number,
  horario: { horaInicio: string; horaFin: string } | null,
) {
  if (!horario) {
    const { error } = await supabase
      .from("horario")
      .delete()
      .eq("establecimiento_id", establecimientoId)
      .eq("dia_semana", diaSemana)
    if (error) throw error
    return
  }

  const { error } = await supabase.from("horario").upsert(
    {
      establecimiento_id: establecimientoId,
      dia_semana: diaSemana,
      hora_inicio: horario.horaInicio,
      hora_fin: horario.horaFin,
    },
    { onConflict: "establecimiento_id,dia_semana" },
  )
  if (error) throw error
}
