export function formatearDuracion(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatearEspera(seg: number): string {
  if (seg < 60) return `${seg}s`
  return `${Math.floor(seg / 60)} min`
}
