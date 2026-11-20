import { supabase } from "@/shared/supabase/client"

export type SesionActiva = {
  id: string
  pausada: boolean
  abiertaEn: string
}

export async function obtenerSesionActiva(establecimientoId: string): Promise<SesionActiva | null> {
  const { data } = await supabase
    .from("sesion")
    .select("id, pausada, abierta_en")
    .eq("establecimiento_id", establecimientoId)
    .eq("estado", "activa")
    .maybeSingle()

  if (!data) return null
  return { id: data.id, pausada: data.pausada, abiertaEn: data.abierta_en }
}

export async function abrirSesion(establecimientoId: string) {
  // Reinicia el cumplimiento de la lista por defecto para la noche que empieza.
  await supabase
    .from("lista_defecto_item")
    .update({ sonada_en: null })
    .eq("establecimiento_id", establecimientoId)

  return supabase.from("sesion").insert({ establecimiento_id: establecimientoId }).select("id").single()
}

export async function pausarSesion(sesionId: string, pausada: boolean) {
  return supabase.from("sesion").update({ pausada }).eq("id", sesionId)
}

export type SesionHistorial = {
  id: string
  estado: string
  abiertaEn: string
}

export async function obtenerSesiones(establecimientoId: string, limite = 20): Promise<SesionHistorial[]> {
  const { data } = await supabase
    .from("sesion")
    .select("id, estado, abierta_en")
    .eq("establecimiento_id", establecimientoId)
    .order("abierta_en", { ascending: false })
    .limit(limite)

  return (data ?? []).map((s) => ({ id: s.id, estado: s.estado, abiertaEn: s.abierta_en }))
}

export async function activarMantenimiento(sesionId: string) {
  await supabase
    .from("solicitud")
    .update({ estado: "rechazada" })
    .eq("sesion_id", sesionId)
    .in("estado", ["pendiente", "reproduciendo"])

  return supabase
    .from("sesion")
    .update({ estado: "cerrada", cerrada_en: new Date().toISOString() })
    .eq("id", sesionId)
}
