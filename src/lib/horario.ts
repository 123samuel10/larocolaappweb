export type Horario = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

function localDowYHora(timezone: string): { dow: number; hora: string } {
  const ahora = new Date()

  const dowStr = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(ahora)

  const dowMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(ahora)

  const h = partes.find((p) => p.type === "hour")?.value ?? "00"
  const m = partes.find((p) => p.type === "minute")?.value ?? "00"
  const s = partes.find((p) => p.type === "second")?.value ?? "00"

  return {
    dow: dowMap[dowStr] ?? 0,
    hora: `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`,
  }
}

/**
 * Devuelve true si el horario está activo ahora para la zona horaria dada.
 * Se omite la validación si VITE_SKIP_HORARIO_CHECK=true (desarrollo local).
 */
export function esHorarioActivo(horarios: Horario[], timezone: string): boolean {
  if (import.meta.env.VITE_SKIP_HORARIO_CHECK === "true") return true

  const { dow, hora } = localDowYHora(timezone)

  return horarios.some((h) => {
    if (h.dia_semana !== dow) return false

    if (h.hora_fin > h.hora_inicio) {
      return hora >= h.hora_inicio && hora < h.hora_fin
    }
    // cruza medianoche
    return hora >= h.hora_inicio || hora < h.hora_fin
  })
}
