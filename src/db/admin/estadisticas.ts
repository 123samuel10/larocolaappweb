import { supabase } from "@/shared/supabase/client"

export type ResumenSesion = {
  totalSolicitudes: number
  usuariosUnicos: number
}

export async function obtenerResumenSesion(sesionId: string): Promise<ResumenSesion> {
  const [{ count: totalSolicitudes }, { data: dispositivos }] = await Promise.all([
    supabase.from("solicitud").select("*", { count: "exact", head: true }).eq("sesion_id", sesionId),
    supabase.from("sesion_dispositivo").select("dispositivo_id").eq("sesion_id", sesionId),
  ])

  const usuariosUnicos = new Set((dispositivos ?? []).map((d) => d.dispositivo_id)).size

  return { totalSolicitudes: totalSolicitudes ?? 0, usuariosUnicos }
}

export type CancionTop = { titulo: string; artista: string; votos: number }

type FilaTop = { cancion: { titulo: string; artista: string }; voto: { id: string }[] }

export async function obtenerCancionesTop(sesionId: string, limite = 4): Promise<CancionTop[]> {
  const { data } = await supabase
    .from("solicitud")
    .select("cancion!inner(titulo, artista), voto(id)")
    .eq("sesion_id", sesionId)
    .overrideTypes<FilaTop[], { merge: false }>()

  return (data ?? [])
    .map((s) => ({ titulo: s.cancion.titulo, artista: s.cancion.artista, votos: s.voto.length }))
    .sort((a, b) => b.votos - a.votos)
    .slice(0, limite)
}

type SolicitudesPorHora = { hora: number; cantidad: number }

export async function obtenerSolicitudesPorHora(sesionId: string, zonaHoraria: string) {
  const formatoHora = new Intl.DateTimeFormat("es-CO", {
    timeZone: zonaHoraria,
    hour: "2-digit",
    hourCycle: "h23",
  })
  const porHora = new Map<number, number>()
  const limite = 500
  let ultimoId: string | undefined
  let total = 0

  while (true) {
    const consulta = supabase
      .from("solicitud")
      .select("id, created_at")
      .eq("sesion_id", sesionId)
      .order("id")
      .limit(limite)

    if (ultimoId !== undefined) consulta.gt("id", ultimoId)

    const { data, error } = await consulta
    if (error) throw error

    for (const solicitud of data) {
      const hora = Number(formatoHora.format(new Date(solicitud.created_at)))
      porHora.set(hora, (porHora.get(hora) ?? 0) + 1)
    }
    total += data.length

    if (data.length < limite) break
    ultimoId = data[data.length - 1].id
  }

  const franjas: SolicitudesPorHora[] = Array.from(porHora, ([hora, cantidad]) => ({ hora, cantidad }))
    .sort((a, b) => a.hora - b.hora)

  return { total, franjas }
}

export type HistorialItem = {
  titulo: string
  estado: string
  createdAt: string
  esperaSeg: number | null
}

type FilaHistorial = {
  estado: string
  created_at: string
  inicio_reproduccion: string | null
  cancion: { titulo: string }
}

export async function obtenerHistorial(sesionId: string, limite = 10): Promise<HistorialItem[]> {
  const { data } = await supabase
    .from("solicitud")
    .select("estado, created_at, inicio_reproduccion, cancion!inner(titulo)")
    .eq("sesion_id", sesionId)
    .in("estado", ["reproducida", "rechazada"])
    .order("created_at", { ascending: false })
    .limit(limite)
    .overrideTypes<FilaHistorial[], { merge: false }>()

  return (data ?? []).map((s) => ({
    titulo: s.cancion.titulo,
    estado: s.estado,
    createdAt: s.created_at,
    esperaSeg: s.inicio_reproduccion
      ? Math.round((new Date(s.inicio_reproduccion).getTime() - new Date(s.created_at).getTime()) / 1000)
      : null,
  }))
}

export async function obtenerEsperaPromedioSeg(sesionId: string): Promise<number | null> {
  const historial = await obtenerHistorial(sesionId, 200)
  const esperas = historial.map((h) => h.esperaSeg).filter((v): v is number => v !== null && v >= 0)
  if (esperas.length === 0) return null
  return Math.round(esperas.reduce((a, b) => a + b, 0) / esperas.length)
}
