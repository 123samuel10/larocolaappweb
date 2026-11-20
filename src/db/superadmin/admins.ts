import { supabase } from "@/shared/supabase/client"
import { supabaseUrl } from "@/shared/supabase/config"

export type AdminPerfil = {
  id: string
  user_id: string
  email: string
  establecimiento_id: string
  establecimiento_nombre: string
  created_at: string
}

export async function obtenerAdmins(): Promise<AdminPerfil[]> {
  const { data } = await supabase
    .from("perfil_admin")
    .select("id, user_id, email, establecimiento_id, created_at, establecimiento(nombre)")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    establecimiento_id: row.establecimiento_id,
    establecimiento_nombre: (row.establecimiento as unknown as { nombre: string } | null)?.nombre ?? "—",
    created_at: row.created_at,
  }))
}

export async function crearAdmin(datos: {
  email: string
  password: string
  establecimiento_id: string
}): Promise<{ error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: "Sin sesión activa" }

  const { data, error } = await supabase.functions.invoke("crear-admin", {
    body: datos,
  })

  if (error || data?.error) {
    return { error: data?.error ?? error?.message ?? "Error desconocido" }
  }
  return { error: null }
}
