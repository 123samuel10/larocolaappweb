import { useQuery } from "@tanstack/react-query"
import qrcode from "qrcode-generator"
import { obtenerColaActiva, obtenerEstablecimientoActivo } from "@/db/pantalla/cola"
import { obtenerHorarios } from "@/db/pantalla/horarios"
import { esHorarioActivo } from "@/lib/horario"
import type { DatosAccesoLocal, DatosPantallaCola } from "../types"

function generarQr(url: string): string {
  const qr = qrcode(0, "M")
  qr.addData(url)
  qr.make()
  return qr.createDataURL(4, 16)
}

export function usePantalla(slug: string, currentUrl: string) {
  const url = new URL(currentUrl)
  const esAcceso = url.searchParams.get("unirse") === "1"

  const establecimientoQuery = useQuery({
    queryKey: ["establecimiento", slug],
    queryFn: () => obtenerEstablecimientoActivo(slug),
    staleTime: 1000 * 60 * 5,
  })

  const establecimiento = establecimientoQuery.data

  const colaQuery = useQuery({
    queryKey: ["cola", establecimiento?.id ?? ""],
    queryFn: () => obtenerColaActiva(establecimiento!.id),
    enabled: !!establecimiento && !esAcceso,
    refetchInterval: false,
  })

  const horariosQuery = useQuery({
    queryKey: ["horarios", establecimiento?.id ?? ""],
    queryFn: () => obtenerHorarios(establecimiento!.id),
    enabled: !!establecimiento && !esAcceso,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
  })

  if (establecimientoQuery.isLoading) return { estado: "cargando" as const }
  if (!establecimiento) return { estado: "noEncontrado" as const }

  if (esAcceso) {
    const datos: DatosAccesoLocal = {
      vista: "acceso",
      nombre: establecimiento.nombre,
      enlaceApp: `larocola://e/${encodeURIComponent(slug)}`,
    }
    return { estado: "listo" as const, datos, establecimientoId: establecimiento.id }
  }

  const accessUrl = new URL(currentUrl)
  accessUrl.search = "?unirse=1"
  const qrAcceso = generarQr(accessUrl.href)

  const servicioAbierto = esHorarioActivo(
    horariosQuery.data ?? [],
    establecimiento.zona_horaria,
  )

  const datos: DatosPantallaCola = {
    vista: "cola",
    nombre: establecimiento.nombre,
    rutaAcceso: accessUrl.pathname + accessUrl.search,
    qrAcceso,
    cola: colaQuery.data?.cola ?? [],
    sesionActiva: colaQuery.data?.sesionActiva ?? false,
    servicioAbierto,
  }

  return { estado: "listo" as const, datos, establecimientoId: establecimiento.id }
}
