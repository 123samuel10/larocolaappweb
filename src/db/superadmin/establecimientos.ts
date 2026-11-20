import { supabase } from "@/shared/supabase/client"

export type Establecimiento = {
  id: string
  nombre: string
  slug: string
  zona_horaria: string
  activo: boolean
  created_at: string
  admin_email: string | null
}

export async function obtenerEstablecimientos(): Promise<Establecimiento[]> {
  const { data: establecimientos } = await supabase
    .from("establecimiento")
    .select("id, nombre, slug, zona_horaria, activo, created_at")
    .order("created_at", { ascending: false })

  if (!establecimientos) return []

  const { data: perfiles } = await supabase
    .from("perfil_admin")
    .select("establecimiento_id, email")

  const emailPorEstablecimiento = Object.fromEntries(
    (perfiles ?? []).map((p) => [p.establecimiento_id, p.email]),
  )

  return establecimientos.map((e) => ({
    ...e,
    admin_email: emailPorEstablecimiento[e.id] ?? null,
  }))
}

export async function crearEstablecimiento(datos: {
  nombre: string
  slug: string
  zona_horaria: string
}) {
  return supabase.from("establecimiento").insert(datos).select("id").single()
}

export async function toggleActivo(id: string, activo: boolean) {
  return supabase.from("establecimiento").update({ activo }).eq("id", id)
}
