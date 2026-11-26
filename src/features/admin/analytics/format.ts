import type { FilaAnalitica } from "@/db/admin/analitica"

export const numero = new Intl.NumberFormat("es-CO")
export const porcentaje = new Intl.NumberFormat("es-CO", {
  style: "percent",
  maximumFractionDigits: 1,
})

export const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const fechaNoche = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function nocheLocal(noche: string) {
  return fechaNoche.format(new Date(`${noche}T12:00:00Z`))
}

export function fechaHora(instante: string, timeZone?: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(instante))
}

export function etiquetaSesion({ metricas }: FilaAnalitica<"session">) {
  return fechaHora(metricas.abierta_en, metricas.zona_horaria)
}

export function etiquetaFranja(franja: string) {
  return `${franja.slice(8, 10)}/${franja.slice(5, 7)} · ${franja.slice(11, 16)}`
}
